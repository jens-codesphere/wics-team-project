-- Voting/final-plan support for the mobile MVP.
alter table public.outing_plans add column if not exists is_final boolean not null default false;
alter table public.outing_plans add column if not exists itinerary jsonb;

create or replace function public.prepare_outing_plans(group_id_input uuid, places_input jsonb)
returns setof uuid language plpgsql security definer set search_path = '' as $$
declare item jsonb; place_uuid uuid; plan_uuid uuid;
begin
  if not exists(select 1 from public.group_members where group_id=group_id_input and user_id=(select auth.uid())) then raise exception 'Not a group member'; end if;
  delete from public.votes where outing_plan_id in (select id from public.outing_plans where group_id=group_id_input and is_final=false);
  delete from public.outing_plans where group_id=group_id_input and is_final=false;
  for item in select * from jsonb_array_elements(places_input) loop
    insert into public.places(google_place_id,name,address,latitude,longitude,price_level,categories)
    values ('demo:'||(item->>'id'), item->>'name', item->>'address', nullif(item->>'latitude','')::double precision, nullif(item->>'longitude','')::double precision, null, coalesce(array(select jsonb_array_elements_text(item->'categories')),'{}'))
    on conflict (google_place_id) do update set name=excluded.name,address=excluded.address,latitude=excluded.latitude,longitude=excluded.longitude,categories=excluded.categories
    returning id into place_uuid;
    insert into public.outing_plans(group_id,place_id,score,travel_time,estimated_cost,ai_explanation)
    values(group_id_input,place_uuid,(item->>'score')::numeric,(item->>'travelTimeMinutes')::integer,(item->>'estimatedCost')::numeric,item->>'explanation') returning id into plan_uuid;
    return next plan_uuid;
  end loop;
end $$;
revoke execute on function public.prepare_outing_plans(uuid,jsonb) from public;
grant execute on function public.prepare_outing_plans(uuid,jsonb) to authenticated;

create or replace function public.cast_outing_vote(plan_id_input uuid, vote_input boolean)
returns void language plpgsql security definer set search_path='' as $$
declare uid uuid := (select auth.uid()); gid uuid;
begin
 select group_id into gid from public.outing_plans where id=plan_id_input;
 if not exists(select 1 from public.group_members where group_id=gid and user_id=uid) then raise exception 'Not a group member'; end if;
 insert into public.votes(outing_plan_id,user_id,vote) values(plan_id_input,uid,vote)
 on conflict(outing_plan_id,user_id) do update set vote=excluded.vote, created_at=now();
end $$;
revoke execute on function public.cast_outing_vote(uuid,boolean) from public;
grant execute on function public.cast_outing_vote(uuid,boolean) to authenticated;

create or replace function public.finalize_group_plan(group_id_input uuid)
returns uuid language plpgsql security definer set search_path='' as $$
declare winner uuid;
begin
 if not exists(select 1 from public.group_members where group_id=group_id_input and user_id=(select auth.uid())) then raise exception 'Not a group member'; end if;
 select op.id into winner from public.outing_plans op left join public.votes v on v.outing_plan_id=op.id and v.vote=true
 where op.group_id=group_id_input group by op.id,op.score order by count(v.id) desc, op.score desc nulls last limit 1;
 if winner is null then raise exception 'No plans to finalize'; end if;
 update public.outing_plans set is_final=(id=winner) where group_id=group_id_input;
 return winner;
end $$;
revoke execute on function public.finalize_group_plan(uuid) from public;
grant execute on function public.finalize_group_plan(uuid) to authenticated;

create or replace function public.save_plan_itinerary(plan_id_input uuid, itinerary_input jsonb)
returns void language plpgsql security definer set search_path='' as $$
declare gid uuid;
begin
 select group_id into gid from public.outing_plans where id=plan_id_input;
 if not exists(select 1 from public.group_members where group_id=gid and user_id=(select auth.uid())) then raise exception 'Not a group member'; end if;
 update public.outing_plans set itinerary=itinerary_input where id=plan_id_input;
end $$;
revoke execute on function public.save_plan_itinerary(uuid,jsonb) from public;
grant execute on function public.save_plan_itinerary(uuid,jsonb) to authenticated;
