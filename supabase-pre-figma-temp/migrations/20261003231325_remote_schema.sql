SET local check_function_bodies = off;

CREATE SCHEMA "private";

CREATE OR REPLACE FUNCTION private.is_group_creator (
  group_id_input uuid
)
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
    select exists (
        select 1
        from public.groups
        where id = group_id_input
          and created_by = (select auth.uid())
    );
$function$;

CREATE OR REPLACE FUNCTION private.is_group_member (
  group_id_input uuid
)
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
    select exists (
        select 1
        from public.group_members
        where group_id = group_id_input
          and user_id = (select auth.uid())
    );
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    new.raw_user_meta_data ->> 'display_name'
  );

  return new;
end;
$function$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

CREATE POLICY "Group creators can add members" ON "public"."group_members"
  FOR INSERT
  TO "authenticated"
  WITH CHECK (( SELECT private.is_group_creator(group_members.group_id) AS is_group_creator));

CREATE POLICY "Group creators can remove members" ON "public"."group_members"
  FOR DELETE
  TO "authenticated"
  USING ((EXISTS ( SELECT 1
   FROM public.groups
  WHERE ((groups.id = group_members.group_id) AND (groups.created_by = auth.uid())))));

CREATE POLICY "Members can view group membership" ON "public"."group_members"
  FOR SELECT
  TO "authenticated"
  USING (((user_id = ( SELECT auth.uid() AS uid)) OR ( SELECT private.is_group_member(group_members.group_id) AS is_group_member)));

CREATE POLICY "Group creators can delete groups" ON "public"."groups"
  FOR DELETE
  TO "authenticated"
  USING ((created_by = auth.uid()));

CREATE POLICY "Group creators can update groups" ON "public"."groups"
  FOR UPDATE
  TO "authenticated"
  USING ((created_by = auth.uid()))
  WITH CHECK ((created_by = auth.uid()));

CREATE POLICY "Group members can view groups" ON "public"."groups"
  FOR SELECT
  TO "authenticated"
  USING (((EXISTS ( SELECT 1
   FROM public.group_members
  WHERE ((group_members.group_id = groups.id) AND (group_members.user_id = auth.uid())))) OR (created_by = auth.uid())));

CREATE POLICY "Users can create groups" ON "public"."groups"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((created_by = auth.uid()));

CREATE POLICY "Group members can view outing plans" ON "public"."outing_plans"
  FOR SELECT
  TO "authenticated"
  USING ((EXISTS ( SELECT 1
   FROM public.group_members
  WHERE ((group_members.group_id = outing_plans.group_id) AND (group_members.user_id = auth.uid())))));

CREATE POLICY "Anyone can view places" ON "public"."places"
  FOR SELECT
  TO "authenticated"
  USING (true);

CREATE POLICY "Users can insert their own profile" ON "public"."profiles"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((id = auth.uid()));

CREATE POLICY "Users can update their own profile" ON "public"."profiles"
  FOR UPDATE
  TO "authenticated"
  USING ((id = auth.uid()))
  WITH CHECK ((id = auth.uid()));

CREATE POLICY "Users can view their own profile" ON "public"."profiles"
  FOR SELECT
  TO "authenticated"
  USING ((id = auth.uid()));

CREATE POLICY "Group members can view votes" ON "public"."votes"
  FOR SELECT
  TO "authenticated"
  USING ((EXISTS ( SELECT 1
   FROM (public.outing_plans op
     JOIN public.group_members gm ON ((gm.group_id = op.group_id)))
  WHERE ((op.id = votes.outing_plan_id) AND (gm.user_id = auth.uid())))));

CREATE POLICY "Users can create their own votes" ON "public"."votes"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((user_id = auth.uid()));

CREATE POLICY "Users can update their own votes" ON "public"."votes"
  FOR UPDATE
  TO "authenticated"
  USING ((user_id = auth.uid()))
  WITH CHECK ((user_id = auth.uid()));

REVOKE ALL ON FUNCTION "private"."is_group_creator"(uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "private"."is_group_creator"(uuid) TO "authenticated";

REVOKE ALL ON FUNCTION "private"."is_group_member"(uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "private"."is_group_member"(uuid) TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."handle_new_user"() TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."handle_new_user"() FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."handle_new_user"() TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."handle_new_user"() TO "service_role";

GRANT USAGE ON SCHEMA "private" TO "authenticated";

