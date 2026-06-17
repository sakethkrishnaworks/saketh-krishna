-- Run this in the Supabase SQL editor to create the tables used by the app.

create table if not exists cookbooks (
  id text primary key,
  title text not null,
  description text,
  price numeric not null,
  image text,
  category text,
  features text[],
  pdfUrl text,
  tag text,
  oldPrice numeric
);

create table if not exists events (
  id text primary key,
  title text not null,
  description text,
  date text,
  month text,
  time text,
  tag text,
  image text,
  joined int default 0,
  tagColor text
);

create table if not exists dietPlans (
  id text primary key,
  title text not null,
  description text,
  price numeric,
  period text,
  image text,
  badge text,
  popular boolean default false
);

create table if not exists subscribers (
  id text primary key,
  email text unique not null,
  date text,
  status text
);

create table if not exists admins (
  user_id text primary key,
  email text unique not null,
  role text
);
