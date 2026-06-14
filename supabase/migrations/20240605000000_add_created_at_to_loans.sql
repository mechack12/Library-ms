-- Migration: add created_at column to loans if missing
ALTER TABLE loans
  ADD COLUMN IF NOT EXISTS created_at timestamp with time zone default timezone('utc', now());

-- Also ensure updated_at column exists
ALTER TABLE loans
  ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone default timezone('utc', now());
