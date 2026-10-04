-- Mobile group-flow RPCs and profile visibility for fellow group members.
create or replace function public.create_group(
  group_name text,
  group_budget numeric default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_group_id uuid;
  current_user_id uuid;
begin
  current_user_id := (select auth.uid());
  if current_user_id is null then raise exception 'Not authenticated'; end if;
  if trim(group_name) = '' then raise exception 'Group name cannot be empty'; end if;

  insert into public.groups (name, created_by, budget)
  values (trim(group_name), current_user_id, group_budget)
  returning id into new_group_id;

  insert into public.group_members (group_id, user_id)
  values (new_group_id, current_user_id);

  return new_group_id;
end;
$$;

revoke execute on function public.create_group(text, numeric) from public;
grant execute on function public.create_group(text, numeric) to authenticated;

create or replace function public.join_group_by_code(join_code_input text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_group_id uuid;
  current_user_id uuid;
begin
  current_user_id := (select auth.uid());
  if current_user_id is null then raise exception 'Not authenticated'; end if;

  select id into target_group_id
  from public.groups
  where join_code = upper(trim(join_code_input));

  if target_group_id is null then raise exception 'Group not found'; end if;

  insert into public.group_members (group_id, user_id)
  values (target_group_id, current_user_id)
  on conflict (group_id, user_id) do nothing;

  return target_group_id;
end;
$$;

revoke execute on function public.join_group_by_code(text) from public;
grant execute on function public.join_group_by_code(text) to authenticated;

create or replace function private.shares_group_with(other_user_id uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.group_members mine
    join public.group_members theirs on mine.group_id = theirs.group_id
    where mine.user_id = (select auth.uid())
      and theirs.user_id = other_user_id
  );
$$;

revoke execute on function private.shares_group_with(uuid) from public;
grant execute on function private.shares_group_with(uuid) to authenticated;

drop policy if exists "Group members can view member profiles" on public.profiles;
create policy "Group members can view member profiles"
on public.profiles
for select
to authenticated
using (
  id = (select auth.uid())
  or (select private.shares_group_with(id))
);
