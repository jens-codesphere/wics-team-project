SET local check_function_bodies = off;

ALTER TABLE "public"."groups"
  ADD COLUMN "join_code" text;

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

CREATE OR REPLACE FUNCTION public.generate_group_join_code()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
begin
    if new.join_code is null then
        new.join_code :=
            upper(
                substr(
                    md5(random()::text || clock_timestamp()::text),
                    1,
                    6
                )
            );
    end if;

    return new;
end;
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

ALTER TABLE "public"."groups"
  ADD CONSTRAINT "groups_join_code_key" UNIQUE (join_code);

CREATE TRIGGER set_group_join_code
  BEFORE INSERT ON public.groups
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_group_join_code();

GRANT EXECUTE ON FUNCTION "public"."generate_group_join_code"() TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."generate_group_join_code"() FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."generate_group_join_code"() TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."generate_group_join_code"() TO "service_role";

