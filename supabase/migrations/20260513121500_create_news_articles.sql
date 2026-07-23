create table if not exists public.news_articles (
  id text primary key,
  title text not null,
  excerpt text not null,
  date timestamptz not null,
  read_time text not null,
  image text not null,
  categories text[] not null default array['news']::text[],
  external_url text not null unique,
  lang text not null check (lang in ('es', 'en', 'ca')),
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint news_articles_categories_allowed check (
    categories <@ array['training', 'championships', 'events', 'news']::text[]
    and array_length(categories, 1) is not null
  )
);

create index if not exists news_articles_published_date_idx
  on public.news_articles (published, date desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_news_articles_updated_at on public.news_articles;
create trigger set_news_articles_updated_at
before update on public.news_articles
for each row
execute function public.set_updated_at();

alter table public.news_articles enable row level security;

drop policy if exists "Published news are publicly readable" on public.news_articles;
create policy "Published news are publicly readable"
on public.news_articles
for select
to anon, authenticated
using (published = true);

revoke all on table public.news_articles from anon, authenticated;
grant select on table public.news_articles to anon, authenticated;
grant all on table public.news_articles to service_role;
