-- Editorial lifecycle. Existing IDs and public URLs are preserved.
alter table public.news_articles
 add column admin_id uuid not null default extensions.gen_random_uuid() unique,
 add column status text not null default 'draft' check (status in ('draft','published','archived')),
 add column kind text not null default 'external' check (kind in ('external','internal')),
 add column source text not null default 'manual' check (source in ('manual','rss','csv','legacy')),
 add column slug text,
 add column body text not null default '',
 add column image_alt text not null default '',
 add column created_by uuid,
 add column updated_by uuid,
 add column version integer not null default 1;
alter table public.news_articles alter column external_url drop not null;
alter table public.news_articles alter column published set default false;

create function public.news_slug(p_title text, p_id text) returns text
language sql immutable set search_path = '' as $$
 select coalesce(nullif(trim(both '-' from regexp_replace(
   regexp_replace(normalize(lower(p_title), NFD), U&'[\0300-\036f]', '', 'g'),
   '[^a-z0-9]+', '-', 'g')), ''), 'article')
   || case when p_id ~* '[a-f0-9]{12}(\?|$)' then '-' || lower(substring(p_id from '([a-fA-F0-9]{12})(?:\?|$)')) else '' end;
$$;
update public.news_articles set status = case when published then 'published' else 'draft' end,
 source = 'legacy', slug = public.news_slug(title, coalesce(nullif(id,''),external_url));
-- Abort rather than silently changing an existing public URL on a collision.
alter table public.news_articles alter column slug set not null;
alter table public.news_articles add constraint news_articles_slug_key unique(slug);
create index news_articles_editorial_idx on public.news_articles(status,date desc,admin_id);

create function public.prepare_news_article() returns trigger language plpgsql set search_path = '' as $$
begin
 if tg_op = 'INSERT' then
   new.slug := coalesce(nullif(new.slug,''), public.news_slug(new.title, new.id) || '-' || left(new.admin_id::text,8));
   new.created_by := auth.uid();
 else
   if new.id <> old.id or new.admin_id <> old.admin_id or new.slug <> old.slug or new.source <> old.source then
     raise exception 'No se puede cambiar la identidad ni el origen de la noticia.';
   end if;
   if old.status = 'archived' and new.status = 'published' then raise exception 'Restaura primero la noticia a borrador.'; end if;
   new.created_by := old.created_by;
   new.created_at := old.created_at;
   new.version := old.version + 1;
 end if;
 new.updated_by := auth.uid();
 new.published := new.status = 'published';
 if new.status = 'published' then
   if length(trim(new.title)) = 0 or length(trim(new.excerpt)) = 0 then raise exception 'El título y el resumen son obligatorios para publicar.'; end if;
   if new.kind = 'internal' and length(trim(new.body)) = 0 then raise exception 'Escribe el contenido antes de publicar.'; end if;
   if new.kind = 'external' and (new.external_url is null or new.external_url !~ '^https?://[^[:space:]]+$') then raise exception 'Indica un enlace externo válido.'; end if;
 end if;
 return new;
end;
$$;
create trigger prepare_news_article before insert or update on public.news_articles for each row execute function public.prepare_news_article();

create function public.audit_news_article() returns trigger language plpgsql security definer set search_path = '' as $$
declare b jsonb; a jsonb;
begin
 if tg_op = 'UPDATE' then b := (to_jsonb(old) - 'body') || jsonb_build_object('body_hash',md5(old.body)); end if;
 a := (to_jsonb(new) - 'body') || jsonb_build_object('body_hash',md5(new.body));
 insert into public.backoffice_audit(entity,entity_id,actor_id,action,before_data,after_data)
 values('news_articles',new.admin_id::text,auth.uid(),tg_op,b,a);
 return new;
end;
$$;
create trigger news_article_audit after insert or update on public.news_articles for each row execute function public.audit_news_article();
create policy news_admin_read on public.news_articles for select to authenticated using(public.is_admin());
-- Writes use a version-checked RPC, never unrestricted authenticated table writes.
create function public.admin_save_news(p_admin_id uuid, p_version integer, p_data jsonb)
returns public.news_articles language plpgsql security definer set search_path = '' as $$
declare r public.news_articles; cats text[];
begin
 if not public.is_admin() then raise exception 'No autorizado.'; end if;
 if p_admin_id is not null then
   select * into r from public.news_articles where admin_id=p_admin_id for update;
   if not found then raise exception 'Noticia no encontrada.'; end if;
   if r.version is distinct from p_version then raise exception 'Otra persona ha modificado esta noticia. Abre la versión actual antes de guardar.'; end if;
 end if;
 if length(coalesce(p_data->>'title','')) > 250 or length(coalesce(p_data->>'excerpt','')) > 1000 or length(coalesce(p_data->>'body','')) > 100000 then raise exception 'El contenido supera el límite permitido.'; end if;
 cats := array(select jsonb_array_elements_text(p_data->'categories'));
 if p_admin_id is null then
   insert into public.news_articles(id,title,excerpt,date,read_time,image,categories,external_url,lang,status,kind,body,image_alt)
   values(extensions.gen_random_uuid()::text,p_data->>'title',p_data->>'excerpt',(p_data->>'date')::timestamptz,
    p_data->>'read_time',p_data->>'image',cats,nullif(p_data->>'external_url',''),p_data->>'lang',p_data->>'status',p_data->>'kind',p_data->>'body',p_data->>'image_alt') returning * into r;
 else
   update public.news_articles set title=p_data->>'title',excerpt=p_data->>'excerpt',date=(p_data->>'date')::timestamptz,
    read_time=p_data->>'read_time',image=p_data->>'image',categories=cats,external_url=nullif(p_data->>'external_url',''),
    lang=p_data->>'lang',status=p_data->>'status',kind=p_data->>'kind',body=p_data->>'body',image_alt=p_data->>'image_alt'
   where admin_id=p_admin_id returning * into r;
 end if;
 return r;
end;
$$;
revoke all on function public.admin_save_news(uuid,integer,jsonb) from public,anon;
grant execute on function public.admin_save_news(uuid,integer,jsonb) to authenticated;

-- Idempotent insertion handles both ID and URL conflicts without republishing.
create function public.import_news(p_articles jsonb, p_source text default 'rss') returns integer
language plpgsql security definer set search_path = '' as $$
declare a jsonb; n integer := 0; added integer;
begin
 if p_source not in ('rss','csv','legacy') then raise exception 'Invalid source'; end if;
 for a in select value from jsonb_array_elements(p_articles) loop
  insert into public.news_articles(id,title,excerpt,date,read_time,image,categories,external_url,lang,status,source)
  values(a->>'id',a->>'title',a->>'excerpt',(a->>'date')::timestamptz,a->>'read_time',a->>'image',
   array(select jsonb_array_elements_text(a->'categories')),a->>'external_url',a->>'lang','draft',p_source)
  on conflict do nothing;
  get diagnostics added = row_count; n := n + added;
 end loop;
 return n;
end;
$$;
revoke all on function public.import_news(jsonb,text) from public,anon,authenticated;
grant execute on function public.import_news(jsonb,text) to service_role;

create table public.news_sync_runs (
 id uuid primary key default extensions.gen_random_uuid(),
 started_at timestamptz not null default now(), finished_at timestamptz,
 status text not null default 'running' check(status in ('running','success','failed')),
 read_count integer not null default 0, created_count integer not null default 0,
 skipped_count integer not null default 0, error text,
 actor_id uuid
);
alter table public.news_sync_runs enable row level security;
revoke all on public.news_sync_runs from anon,authenticated;
grant select on public.news_sync_runs to authenticated;
grant all on public.news_sync_runs to service_role;
create policy news_sync_admin_read on public.news_sync_runs for select to authenticated using(public.is_admin());
create function public.claim_news_sync(p_actor uuid default null) returns uuid
language plpgsql security definer set search_path = '' as $$
declare run_id uuid;
begin
 perform pg_advisory_xact_lock(6090612);
 update public.news_sync_runs set status='failed',finished_at=now(),error='La ejecución caducó. Puede reintentarse.' where status='running' and started_at < now()-interval '10 minutes';
 if exists(select 1 from public.news_sync_runs where status='running') then raise exception 'Ya hay una sincronización en curso.'; end if;
 insert into public.news_sync_runs(actor_id) values(p_actor) returning id into run_id;
 return run_id;
end;
$$;
revoke all on function public.claim_news_sync(uuid) from public,anon,authenticated;
grant execute on function public.claim_news_sync(uuid) to service_role;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
 values('news-images','news-images',false,5242880,array['image/webp']) on conflict(id) do nothing;
create policy news_images_admin_insert on storage.objects for insert to authenticated with check(bucket_id='news-images' and public.is_admin());
create policy news_images_read on storage.objects for select to anon,authenticated using(
 bucket_id='news-images' and (public.is_admin() or exists(
 select 1 from public.news_articles n where n.published and n.image='/api/news/images/' || storage.objects.name
 ))
);
