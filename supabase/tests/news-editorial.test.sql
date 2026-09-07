begin;
create extension if not exists pgtap with schema extensions;
set search_path=public,extensions;
select no_plan();
insert into auth.users(id,email,raw_user_meta_data) values
 ('61000000-0000-0000-0000-000000000001','news-admin@test.local','{}'),
 ('61000000-0000-0000-0000-000000000002','news-coach@test.local','{}'),
 ('61000000-0000-0000-0000-000000000003','news-student@test.local','{}');
insert into public.profiles(user_id,full_name,role) values
 ('61000000-0000-0000-0000-000000000001','News Admin','admin'),
 ('61000000-0000-0000-0000-000000000002','News Coach','coach'),
 ('61000000-0000-0000-0000-000000000003','News Student','student');
create temporary table news_test_data(d jsonb);
insert into news_test_data values('{"title":"Test editorial","excerpt":"Resumen","date":"2026-09-06T10:00:00Z","read_time":"1 min","image":"/placeholder.svg","image_alt":"","categories":["news"],"lang":"ca","status":"draft","kind":"internal","body":"Contenido"}');
grant select on news_test_data to authenticated;
create temporary table news_test_identity(id uuid, slug text);
grant all on news_test_identity to authenticated;
set local role authenticated;
select set_config('request.jwt.claim.sub','61000000-0000-0000-0000-000000000001',true);
insert into news_test_identity select admin_id,slug from public.admin_save_news(null,0,(select d from news_test_data));
select is((select status from public.news_articles where admin_id=(select id from news_test_identity)),'draft','admin creates private draft');
select lives_ok($$select public.admin_save_news((select id from news_test_identity),1,(select d || '{"status":"published"}' from news_test_data))$$,'admin publishes');
select throws_ok($$select public.admin_save_news((select id from news_test_identity),1,(select d from news_test_data))$$,'P0001','Otra persona ha modificado esta noticia. Abre la versión actual antes de guardar.','stale version rejected');
select lives_ok($$select public.admin_save_news((select id from news_test_identity),2,(select d || '{"title":"Título nuevo","status":"published"}' from news_test_data))$$,'title changes');
select is((select slug from public.news_articles where admin_id=(select id from news_test_identity)),(select slug from news_test_identity),'title edit preserves URL');
select ok(exists(select 1 from public.backoffice_audit where entity='news_articles' and entity_id=(select id::text from news_test_identity) and actor_id=auth.uid()),'editorial audit has actor');
select ok(not exists(select 1 from public.backoffice_audit where entity='news_articles' and (before_data ? 'body' or after_data ? 'body')),'audit does not copy article bodies');
select set_config('request.jwt.claim.sub','61000000-0000-0000-0000-000000000002',true);
select throws_ok($$select public.admin_save_news(null,0,(select d from news_test_data))$$,'P0001','No autorizado.','coach cannot create');
select throws_ok($$update public.news_articles set title='bypass'$$,'42501',null,'direct table writes forbidden');
select throws_ok($$select public.import_news('[]','rss')$$,'42501',null,'coach cannot import');
select throws_ok($$select public.claim_news_sync(null)$$,'42501',null,'coach cannot start privileged sync');
select set_config('request.jwt.claim.sub','61000000-0000-0000-0000-000000000003',true);
select throws_ok($$select public.admin_save_news(null,0,(select d from news_test_data))$$,'P0001','No autorizado.','student cannot create');
select set_config('request.jwt.claim.sub','61000000-0000-0000-0000-000000000001',true);
select lives_ok($$select public.admin_save_news((select id from news_test_identity),3,(select d from news_test_data))$$,'withdraw to draft');
select is((select published from public.news_articles where admin_id=(select id from news_test_identity)),false,'legacy boolean follows status');
select lives_ok($$select public.admin_save_news((select id from news_test_identity),4,(select d || '{"status":"archived"}' from news_test_data))$$,'archive');
select throws_ok($$select public.admin_save_news((select id from news_test_identity),5,(select d || '{"status":"published"}' from news_test_data))$$,'P0001','Restaura primero la noticia a borrador.','archive requires explicit restoration');
select lives_ok($$select public.admin_save_news((select id from news_test_identity),5,(select d from news_test_data))$$,'restore to draft');
select throws_ok($$select public.admin_save_news((select id from news_test_identity),6,(select d || '{"body":"","status":"published"}' from news_test_data))$$,'P0001','Escribe el contenido antes de publicar.','database validates publishable body');
select set_config('request.jwt.claim.sub','61000000-0000-0000-0000-000000000002',true);
select is((select count(*)::int from public.news_articles where title='Test editorial'),0,'coach cannot read drafts');
set local role anon;
select is((select count(*)::int from public.news_articles where title='Test editorial'),0,'anonymous cannot read drafts');
reset role;
select is(public.news_slug('Formació i salut','https://medium.com/p/abcdef123456'),'formacio-i-salut-abcdef123456','migration matches old public slug');
select set_config('request.jwt.claim.sub','',true);
select is(public.import_news('[{"id":"news-import-test","title":"Importada","excerpt":"Resumen","date":"2026-09-06T00:00:00Z","read_time":"1 min","image":"/placeholder.svg","categories":["news"],"external_url":"https://example.test/import-news","lang":"es"}]','rss'),1,'import creates draft');
update public.news_articles set title='Edición manual',status='archived' where id='news-import-test';
select is(public.import_news('[{"id":"news-import-test","title":"Importada","excerpt":"Resumen","date":"2026-09-06T00:00:00Z","read_time":"1 min","image":"/placeholder.svg","categories":["news"],"external_url":"https://example.test/import-news","lang":"es"}]','rss'),0,'repeat import does not overwrite');
select is((select title from public.news_articles where id='news-import-test'),'Edición manual','manual edit preserved');
select is((select status from public.news_articles where id='news-import-test'),'archived','archive preserved');
select is(public.import_news('[{"id":"different-import-id","title":"Otra","excerpt":"Resumen","date":"2026-09-06T00:00:00Z","read_time":"1 min","image":"/placeholder.svg","categories":["news"],"external_url":"https://example.test/import-news","lang":"es"}]','rss'),0,'URL conflict does not duplicate');
select lives_ok($$select public.claim_news_sync(null)$$,'sync lease acquired');
select throws_ok($$select public.claim_news_sync(null)$$,'P0001','Ya hay una sincronización en curso.','concurrent sync blocked');
update public.news_sync_runs set started_at=now()-interval '11 minutes' where status='running';
select lives_ok($$select public.claim_news_sync(null)$$,'expired sync can be retried');
select is((select public from storage.buckets where id='news-images'),false,'image bucket is private');
select * from finish();
rollback;
