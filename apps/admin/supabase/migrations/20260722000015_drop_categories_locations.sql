-- Categories and locations are now hardcoded in the frontend.
-- Videos store category/location as plain text columns, so dropping these tables is safe.

DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.locations CASCADE;
