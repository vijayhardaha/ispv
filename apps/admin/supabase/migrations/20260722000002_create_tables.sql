CREATE TABLE public.categories (
  id           uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  slug         text NOT NULL UNIQUE,
  value        text NOT NULL UNIQUE,
  label        text NOT NULL,
  color        text NOT NULL,
  description  text,
  seo_title       text,
  seo_description text
);

CREATE TABLE public.locations (
  id           uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  slug         text NOT NULL UNIQUE,
  value        text NOT NULL UNIQUE,
  label        text NOT NULL UNIQUE,
  description  text,
  seo_title       text,
  seo_description text
);

CREATE TABLE public.videos (
  id                uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  ig_url            text NOT NULL UNIQUE,
  submitted_tags    text,
  submitted_category text,
  submitted_state   text,
  submitted_city    text,
  category          text REFERENCES public.categories(value),
  state             text,
  city              text,
  tags              text[],
  description       text,
  thumbnail_url     text,
  ig_post_date      timestamptz,
  view_count        integer DEFAULT 0,
  created_at        timestamptz DEFAULT NOW(),
  updated_at        timestamptz DEFAULT NOW(),
  status            text NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft', 'pending_review', 'published', 'rejected')),
  enriched_by       uuid REFERENCES auth.users(id)
);
