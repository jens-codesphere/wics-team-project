CREATE TABLE "public"."group_members" (
  "group_id"  uuid                     NOT NULL,
  "user_id"   uuid                     NOT NULL,
  "joined_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "group_members_pkey" PRIMARY KEY (group_id, user_id)
);

ALTER TABLE "public"."group_members"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."groups" (
  "id"         uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "name"       text                     NOT NULL,
  "created_by" uuid                     NOT NULL,
  "budget"     numeric(10,2),
  "created_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "groups_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."groups"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."outing_plans" (
  "id"             uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "group_id"       uuid                     NOT NULL,
  "place_id"       uuid                     NOT NULL,
  "score"          numeric(5,2),
  "travel_time"    integer,
  "estimated_cost" numeric(10,2),
  "ai_explanation" text,
  "created_at"     timestamp with time zone DEFAULT now(),
  CONSTRAINT "outing_plans_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."outing_plans"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."places" (
  "id"              uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "google_place_id" text                     NOT NULL,
  "name"            text                     NOT NULL,
  "address"         text,
  "latitude"        double precision,
  "longitude"       double precision,
  "price_level"     integer,
  "categories"      text[]                   DEFAULT '{}'::text[],
  "created_at"      timestamp with time zone DEFAULT now(),
  CONSTRAINT "places_google_place_id_key" UNIQUE (google_place_id),
  CONSTRAINT "places_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."places"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."profiles" (
  "id"             uuid                     NOT NULL,
  "display_name"   text                     NOT NULL,
  "budget"         numeric(10,2),
  "interests"      text[]                   DEFAULT '{}'::text[],
  "transportation" text,
  "created_at"     timestamp with time zone DEFAULT now(),
  CONSTRAINT "profiles_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."profiles"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."votes" (
  "id"             uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "outing_plan_id" uuid                     NOT NULL,
  "user_id"        uuid                     NOT NULL,
  "vote"           boolean                  NOT NULL,
  "created_at"     timestamp with time zone DEFAULT now(),
  CONSTRAINT "votes_outing_plan_id_user_id_key" UNIQUE (outing_plan_id, user_id),
  CONSTRAINT "votes_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."votes"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."group_members"
  ADD CONSTRAINT "group_members_group_id_fkey" FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE;

ALTER TABLE "public"."outing_plans"
  ADD CONSTRAINT "outing_plans_group_id_fkey" FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE;

ALTER TABLE "public"."outing_plans"
  ADD CONSTRAINT "outing_plans_place_id_fkey" FOREIGN KEY (place_id) REFERENCES public.places(id) ON DELETE CASCADE;

ALTER TABLE "public"."profiles"
  ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE "public"."group_members"
  ADD CONSTRAINT "group_members_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE "public"."groups"
  ADD CONSTRAINT "groups_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE "public"."votes"
  ADD CONSTRAINT "votes_outing_plan_id_fkey" FOREIGN KEY (outing_plan_id) REFERENCES public.outing_plans(id) ON DELETE CASCADE;

ALTER TABLE "public"."votes"
  ADD CONSTRAINT "votes_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."group_members" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."group_members" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."group_members" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."group_members" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."groups" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."groups" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."groups" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."groups" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."outing_plans" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."outing_plans" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."outing_plans" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."outing_plans" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."places" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."places" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."places" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."places" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."profiles" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."profiles" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."profiles" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."profiles" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."votes" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."votes" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."votes" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."votes" TO "service_role";

