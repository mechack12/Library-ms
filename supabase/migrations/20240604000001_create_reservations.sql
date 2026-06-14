-- Migration: create reservations table
create extension if not exists "uuid-ossp";

create table if not exists reservations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  book_id uuid references books(id) not null,
  status varchar(20) not null default 'pending',
  created_at timestamp with time zone default timezone('utc', now()),
  updated_at timestamp with time zone default timezone('utc', now())
);
