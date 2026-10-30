-- Run once in your Supabase SQL editor.
create table public.forma_boards (
 id uuid primary key default gen_random_uuid(), owner uuid not null references auth.users(id),
 document jsonb not null, revision integer not null default 1,
 updated_at timestamptz not null default now()
);
create table public.forma_members (
 board_id uuid not null references public.forma_boards(id) on delete cascade,
 user_id uuid not null references auth.users(id), email text not null,
 role text not null check(role in ('viewer','editor')), primary key(board_id,user_id)
);
create table public.forma_requests (
 board_id uuid not null references public.forma_boards(id) on delete cascade,
 user_id uuid not null references auth.users(id), email text not null,
 primary key(board_id,user_id)
);
create function public.forma_is_owner(b uuid) returns boolean language sql stable security definer set search_path=public
as $$ select exists(select 1 from forma_boards where id=b and owner=auth.uid()) $$;
create function public.forma_has_access(b uuid, edit boolean default false) returns boolean language sql stable security definer set search_path=public
as $$ select exists(select 1 from forma_boards where id=b and owner=auth.uid()) or exists(select 1 from forma_members where board_id=b and user_id=auth.uid() and (not edit or role='editor')) $$;
alter table public.forma_boards enable row level security;
alter table public.forma_members enable row level security;
alter table public.forma_requests enable row level security;
create policy boards_read on public.forma_boards for select to authenticated using(public.forma_has_access(id));
create policy boards_create on public.forma_boards for insert to authenticated with check(owner=auth.uid());
-- All document updates use the version checked RPC below; direct updates stay disabled.
create policy members_read on public.forma_members for select to authenticated using(user_id=auth.uid() or public.forma_is_owner(board_id));
create policy requests_read on public.forma_requests for select to authenticated using(user_id=auth.uid() or public.forma_is_owner(board_id));
create policy requests_create on public.forma_requests for insert to authenticated with check(user_id=auth.uid() and email=auth.jwt()->>'email');
create policy requests_remove on public.forma_requests for delete to authenticated using(public.forma_is_owner(board_id) or user_id=auth.uid());
create function public.forma_save(b uuid, expected integer, doc jsonb) returns integer language plpgsql security definer set search_path=public as $$
declare next_revision integer;
begin
 if not public.forma_has_access(b,true) then raise exception 'Editor permission required'; end if;
 if pg_column_size(doc)>20000000 then raise exception 'Board is too large for online sync'; end if;
 update forma_boards set document=doc,revision=revision+1,updated_at=now() where id=b and revision=expected returning revision into next_revision;
 if next_revision is null then raise exception 'Another person changed this board. Reload the shared version before retrying.'; end if;
 return next_revision;
end $$;
create function public.forma_approve(b uuid, person uuid, access_role text) returns void language plpgsql security definer set search_path=public as $$
begin
 if not public.forma_is_owner(b) then raise exception 'Owner permission required'; end if;
 if access_role not in ('viewer','editor') then raise exception 'Invalid role'; end if;
 insert into forma_members(board_id,user_id,email,role) select b,person,email,access_role from forma_requests where board_id=b and user_id=person
 on conflict(board_id,user_id) do update set role=excluded.role;
 delete from forma_requests where board_id=b and user_id=person;
end $$;
create function public.forma_revoke(b uuid, person uuid) returns void language plpgsql security definer set search_path=public as $$
begin
 if not public.forma_is_owner(b) then raise exception 'Owner permission required'; end if;
 delete from forma_members where board_id=b and user_id=person;
end $$;
revoke all on function public.forma_is_owner(uuid), public.forma_has_access(uuid,boolean), public.forma_save(uuid,integer,jsonb), public.forma_approve(uuid,uuid,text), public.forma_revoke(uuid,uuid) from public, anon;
grant execute on function public.forma_is_owner(uuid), public.forma_has_access(uuid,boolean), public.forma_save(uuid,integer,jsonb), public.forma_approve(uuid,uuid,text), public.forma_revoke(uuid,uuid) to authenticated;
grant select,insert on public.forma_boards to authenticated;
grant select on public.forma_members to authenticated;
grant select,insert,delete on public.forma_requests to authenticated;
