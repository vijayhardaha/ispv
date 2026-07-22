-- Seed default categories
INSERT INTO public.categories (id, label, color, description) VALUES
  ('marches', 'Marches', 'yellow', 'Organised marches and processions'),
  ('rallies', 'Rallies', 'black', 'Public rallies and gatherings'),
  ('candlelight', 'Candlelight', 'blue', 'Candlelight vigils and peaceful night protests'),
  ('art', 'Art', 'red', 'Protest art, murals, and creative expression'),
  ('youth', 'Youth', 'green', 'Student and youth-led actions'),
  ('press', 'Press', 'white', 'Press conferences and media interactions')
ON CONFLICT (id) DO NOTHING;

-- Seed default states
INSERT INTO public.states (name) VALUES
  ('Andhra Pradesh'),
  ('Arunachal Pradesh'),
  ('Assam'),
  ('Bihar'),
  ('Chhattisgarh'),
  ('Goa'),
  ('Gujarat'),
  ('Haryana'),
  ('Himachal Pradesh'),
  ('Jharkhand'),
  ('Karnataka'),
  ('Kerala'),
  ('Madhya Pradesh'),
  ('Maharashtra'),
  ('Manipur'),
  ('Meghalaya'),
  ('Mizoram'),
  ('Nagaland'),
  ('Odisha'),
  ('Punjab'),
  ('Rajasthan'),
  ('Sikkim'),
  ('Tamil Nadu'),
  ('Telangana'),
  ('Tripura'),
  ('Uttar Pradesh'),
  ('Uttarakhand'),
  ('West Bengal'),
  ('Delhi'),
  ('Chandigarh')
ON CONFLICT (name) DO NOTHING;
