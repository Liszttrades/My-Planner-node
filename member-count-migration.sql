-- Run after the original collaboration.sql to add authorized member totals.
create or replace function public.forma_member_count(b uuid) returns integer
language plpgsql stable security definer set search_path=public as $$
begin
 if not public.forma_has_access(b) then raise exception 'Board access required'; end if;
 return 1+(select count(*)::integer from forma_members where board_id=b);
end $$;
revoke all on function public.forma_member_count(uuid) from public, anon;
grant execute on function public.forma_member_count(uuid) to authenticated;
