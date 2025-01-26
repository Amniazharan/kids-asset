-- supabase/migrations/001_initial_schema.sql

-- Enable RLS
alter table auth.users enable row level security;

-- Create profiles table
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  created_at timestamptz default now() not null
);

-- Create asset_categories table
create table asset_categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  user_id uuid references auth.users on delete cascade not null,
  created_at timestamptz default now() not null
);

-- Create children table
create table children (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  user_id uuid references auth.users on delete cascade not null,
  created_at timestamptz default now() not null
);

-- Create assets table
create table assets (
  id uuid default uuid_generate_v4() primary key,
  amount decimal not null,
  category_id uuid references asset_categories on delete cascade not null,
  child_id uuid references children on delete cascade not null,
  created_at timestamptz default now() not null
);

-- Insert default asset categories
create or replace function create_default_categories() 
returns trigger as $$
begin
  insert into asset_categories (name, user_id)
  values 
    ('Emas', NEW.id),
    ('ASB', NEW.id),
    ('Tunai', NEW.id),
    ('SSPN', NEW.id),
    ('Tabung Haji', NEW.id);
  return NEW;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure create_default_categories();

-- RLS Policies
alter table profiles enable row level security;
alter table asset_categories enable row level security;
alter table children enable row level security;
alter table assets enable row level security;

-- Profiles policies
create policy "Users can view own profile"
  on profiles for select
  using ( auth.uid() = id );

-- Asset categories policies
create policy "Users can view own categories"
  on asset_categories for select
  using ( auth.uid() = user_id );

create policy "Users can insert own categories"
  on asset_categories for insert
  with check ( auth.uid() = user_id );

create policy "Users can delete own categories"
  on asset_categories for delete
  using ( auth.uid() = user_id );

-- Children policies
create policy "Users can view own children"
  on children for select
  using ( auth.uid() = user_id );

create policy "Users can insert own children"
  on children for insert
  with check ( auth.uid() = user_id );

create policy "Users can delete own children"
  on children for delete
  using ( auth.uid() = user_id );

-- Assets policies
create policy "Users can view own assets"
  on assets for select
  using ( auth.uid() = (
    select user_id from children where id = assets.child_id
  ));

create policy "Users can insert own assets"
  on assets for insert
  with check ( auth.uid() = (
    select user_id from children where id = child_id
  ));

create policy "Users can delete own assets"
  on assets for delete
  using ( auth.uid() = (
    select user_id from children where id = child_id
  ));