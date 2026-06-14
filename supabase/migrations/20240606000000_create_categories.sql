-- Migration: create categories table and link to books table
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamp with time zone DEFAULT timezone('utc', now())
);

-- Seed initial categories based on current books
INSERT INTO public.categories (name, description) VALUES
  ('Architecture', 'Studies of structural design, patterns, and built environments.'),
  ('Philosophy', 'Investigations into the fundamental nature of knowledge, reality, and existence.'),
  ('Computer Science', 'Theory, design, development, and application of software and systems.'),
  ('Mathematics', 'Study of numbers, quantities, shapes, and patterns.'),
  ('Physics', 'Study of matter, energy, space, and time.'),
  ('Literature', 'Written works, especially those considered of superior or lasting artistic merit.'),
  ('History', 'Study of past events, particularly in human affairs.'),
  ('Biology', 'Study of living organisms and life processes.'),
  ('Art', 'Expression or application of human creative skill and imagination.'),
  ('Other', 'Miscellaneous categories.')
ON CONFLICT (name) DO NOTHING;

-- Establish foreign key relationship so PostgREST can resolve joins
ALTER TABLE public.books
  ADD CONSTRAINT fk_books_category
  FOREIGN KEY (category)
  REFERENCES public.categories(name)
  ON UPDATE CASCADE;
