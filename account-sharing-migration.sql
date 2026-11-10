-- Additive migration: run after existing Forma collaboration migrations.
begin;
create table if not exists public.forma_invites (
 board_id uuid not null references public.forma_boards(id) on delete cascade,
 email text not null check(email=lower(trim(email)) and length(email)<=254),
 role text not null check(role in ('viewer','editor')),
 primary key(board_id,email)
);
alter table public.forma_invites enable row level security;
drop policy if exists invites_owner_read on public.forma_invites;
create policy invites_owner_read on public.forma_invites for select to authenticated using(public.forma_is_owner(board_id));
drop policy if exists invites_owner_delete on public.forma_invites;
create policy invites_owner_delete on public.forma_invites for delete to authenticated using(public.forma_is_owner(board_id));
revoke all on public.forma_invites from anon, authenticated;
grant select,delete on public.forma_invites to authenticated;
create or replace function public.forma_invite_email(b uuid,address text,access_role text) returns void
language plpgsql security definer set search_path='' as $$
declare normalized text:=lower(trim(address));
begin
 if auth.uid() is null or not public.forma_is_owner(b) then raise exception 'Owner permission required'; end if;
 if access_role is null or access_role not in ('viewer','editor') then raise exception 'Invalid role'; end if;
 if normalized is null or length(normalized)>254 or normalized !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then raise exception 'Enter a valid email'; end if;
 -- Serialize owner invitation writes and bound pending entries per board.
 perform 1 from public.forma_boards where id=b for update;
 if (select count(*) from public.forma_invites where board_id=b)>=100 and not exists(select 1 from public.forma_invites where board_id=b and email=normalized) then raise exception 'Remove a pending invite before adding another'; end if;
 insert into public.forma_invites(board_id,email,role) values(b,normalized,access_role)
 on conflict(board_id,email) do update set role=excluded.role;
end $$;
create or replace function public.forma_claim_invites() returns void
language plpgsql security definer set search_path='' as $$
declare verified_email text;
begin
 if auth.uid() is null then raise exception 'Sign in required'; end if;
 select lower(email) into verified_email from auth.users where id=auth.uid() and email_confirmed_at is not null;
 if verified_email is null then return; end if;
 -- Delete/return atomically: revocation cannot race a later stale claim.
 with claimed as (delete from public.forma_invites where email=verified_email returning board_id,email,role)
 insert into public.forma_members(board_id,user_id,email,role)
 select board_id,auth.uid(),email,role from claimed
 where not public.forma_is_owner(board_id)
 on conflict(board_id,user_id) do update set role=excluded.role,email=excluded.email;
end $$;
revoke all on function public.forma_invite_email(uuid,text,text),public.forma_claim_invites() from public,anon;
grant execute on function public.forma_invite_email(uuid,text,text),public.forma_claim_invites() to authenticated;
commit;
