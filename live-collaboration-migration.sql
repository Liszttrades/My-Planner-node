-- Run once after collaboration.sql. Existing boards, memberships and revision
-- checks remain in place. Safe to rerun; no board data is reset.
begin;

alter table public.forma_boards add column if not exists card_activity jsonb not null default '{}'::jsonb;
-- The browser can create boards, but cannot forge activity metadata.
revoke insert on public.forma_boards from public,anon,authenticated;
grant insert(owner,document) on public.forma_boards to authenticated;

-- Realtime events carry a revision, not the full board or embedded images.
create table if not exists public.forma_live_revisions (
 board_id uuid primary key references public.forma_boards(id) on delete cascade,
 revision integer not null
);
create table if not exists public.forma_live_people (
 board_id uuid not null references public.forma_boards(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 name text not null,
 card_id text,
 seen_at timestamptz not null,
 primary key (board_id,user_id)
);
alter table public.forma_live_revisions enable row level security;
alter table public.forma_live_people enable row level security;
revoke all on public.forma_live_revisions,public.forma_live_people from public,anon,authenticated;
grant select on public.forma_live_revisions,public.forma_live_people to authenticated;
drop policy if exists forma_live_revision_read on public.forma_live_revisions;
create policy forma_live_revision_read on public.forma_live_revisions for select to authenticated
 using (public.forma_has_access(board_id));
drop policy if exists forma_live_people_read on public.forma_live_people;
create policy forma_live_people_read on public.forma_live_people for select to authenticated
 using (public.forma_has_access(board_id) and seen_at > now() - interval '45 seconds');

create or replace function public.forma_live_name() returns text language sql stable
 set search_path='' as $$
 select left(coalesce(nullif(trim(auth.jwt()->'user_metadata'->>'full_name'),''),
                      nullif(trim(auth.jwt()->'user_metadata'->>'name'),''),
                      nullif(split_part(auth.jwt()->>'email','@',1),''),'Collaborator'),48)
$$;
create or replace function public.forma_live_heartbeat(b uuid, card text) returns void
 language plpgsql security definer set search_path='' as $$
begin
 if not public.forma_has_access(b) then raise exception 'Board access required'; end if;
 insert into public.forma_live_people(board_id,user_id,name,card_id,seen_at)
 values (b,auth.uid(),public.forma_live_name(),
         case when card ~ '^[a-zA-Z0-9_-]{1,128}$' and public.forma_has_access(b,true) then card end, now())
 on conflict (board_id,user_id) do update
 set name=excluded.name,card_id=excluded.card_id,seen_at=excluded.seen_at
 where public.forma_live_people.card_id is distinct from excluded.card_id
    or public.forma_live_people.seen_at < now() - interval '4 seconds';
end $$;
create or replace function public.forma_stamp_card_activity() returns trigger
 language plpgsql security definer set search_path='' as $$
declare previous jsonb;
begin
 if new.document->'nodes' is not distinct from old.document->'nodes' then return new; end if;
 if jsonb_typeof(new.document->'nodes') is distinct from 'array'
    or jsonb_array_length(new.document->'nodes')>2000 then raise exception 'Invalid board cards'; end if;
 previous := case when jsonb_typeof(old.document->'nodes')='array' then old.document->'nodes' else '[]'::jsonb end;
 with before_cards as (
  select value->>'id' as id,value from jsonb_array_elements(previous)
 ), after_cards as (
  select value->>'id' as id,value from jsonb_array_elements(new.document->'nodes')
 )
 select coalesce(jsonb_object_agg(n.id,
  case when n.value is distinct from o.value and auth.uid() is not null then
   jsonb_build_object('user_id',auth.uid(),'name',public.forma_live_name(),'at',now(),
                      'kind',case when o.id is null then 'added' else 'updated' end)
  else old.card_activity->n.id end
 ),'{}'::jsonb) into new.card_activity
 from after_cards n left join before_cards o on o.id=n.id
 where n.id ~ '^[a-zA-Z0-9_-]{1,128}$'
   and ((n.value is distinct from o.value and auth.uid() is not null) or old.card_activity ? n.id);
 return new;
end $$;
create or replace function public.forma_signal_revision() returns trigger
 language plpgsql security definer set search_path='' as $$
begin
 insert into public.forma_live_revisions(board_id,revision) values(new.id,new.revision)
 on conflict (board_id) do update set revision=excluded.revision;
 return null;
end $$;
revoke all on function public.forma_live_name(),public.forma_live_heartbeat(uuid,text),
 public.forma_stamp_card_activity(),public.forma_signal_revision() from public,anon,authenticated;
grant execute on function public.forma_live_heartbeat(uuid,text) to authenticated;
drop trigger if exists forma_stamp_card_activity on public.forma_boards;
create trigger forma_stamp_card_activity before update of document on public.forma_boards
 for each row execute function public.forma_stamp_card_activity();
drop trigger if exists forma_signal_revision on public.forma_boards;
create trigger forma_signal_revision after insert or update of revision on public.forma_boards
 for each row execute function public.forma_signal_revision();
do $$
begin
 if not exists (select 1 from pg_catalog.pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='forma_live_revisions') then
  alter publication supabase_realtime add table public.forma_live_revisions;
 end if;
 if not exists (select 1 from pg_catalog.pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='forma_live_people') then
  alter publication supabase_realtime add table public.forma_live_people;
 end if;
end $$;
commit;
