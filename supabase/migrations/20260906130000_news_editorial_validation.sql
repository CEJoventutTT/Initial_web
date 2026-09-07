-- Older reconstructed schemas may grant authenticated users table writes.
revoke insert,update,delete,truncate,references,trigger on public.news_articles from anon,authenticated;
-- Validate at the database boundary too, including privileged RPC callers.
create function public.validate_news_article() returns trigger language plpgsql set search_path = '' as $$
begin
 if length(new.title)>250 or length(new.excerpt)>1000 or length(new.body)>100000
   or length(new.image)>2000 or length(new.image_alt)>300 or length(new.read_time)>50
   or length(coalesce(new.external_url,''))>2000 then raise exception 'El contenido supera el límite permitido.'; end if;
 if new.external_url is not null and (new.external_url !~ '^https?://[^[:space:]]+$' or new.external_url ~ '^https?://[^/]*@') then raise exception 'Indica un enlace externo válido.'; end if;
 if new.image <> '' and not (
   new.image ~ '^/[a-zA-Z0-9/_ .-]+$' and new.image !~ '^//'
   or new.image ~ '^https?://[^[:space:]]+$' and new.image !~ '^https?://[^/]*@'
 ) then raise exception 'Indica una imagen válida.'; end if;
 return new;
end;
$$;
create trigger validate_news_article before insert or update on public.news_articles for each row execute function public.validate_news_article();
