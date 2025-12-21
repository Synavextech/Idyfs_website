-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create profiles table
create table public.profiles (
  id uuid references auth.users(id) on delete cascade not null primary key,
  email text,
  full_name text,
  bio text,
  avatar_url text,
  role text default 'user',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Create policies for profiles
create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

create policy "Users can insert their own profile." on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on public.profiles
  for update using (auth.uid() = id);

-- Create trigger for new user creation
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create blogs table
create table public.blogs (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  content text not null,
  author_id uuid references public.profiles(id) on delete set null,
  image_url text,
  created_at timestamptz default now()
);

-- Enable RLS on blogs
alter table public.blogs enable row level security;

-- Policies for blogs
create policy "Blogs are viewable by everyone." on public.blogs
  for select using (true);

create policy "Admins can insert blogs." on public.blogs
  for insert with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can update blogs." on public.blogs
  for update using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can delete blogs." on public.blogs
  for delete using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Create comments table
create table public.comments (
  id uuid default uuid_generate_v4() primary key,
  blog_id uuid references public.blogs(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz default now()
);

-- Enable RLS on comments
alter table public.comments enable row level security;

-- Policies for comments
create policy "Comments are viewable by everyone." on public.comments
  for select using (true);

create policy "Authenticated users can create comments." on public.comments
  for insert with check (auth.role() = 'authenticated');

create policy "Users can delete own comments." on public.comments
  for delete using (auth.uid() = user_id);

-- Create subscriptions table
create table public.subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  plan_name text not null,
  status text default 'active' not null,
  start_date timestamptz,
  end_date timestamptz,
  payment_id text,
  amount text,
  created_at timestamptz default now()
);

-- Enable RLS on subscriptions
alter table public.subscriptions enable row level security;

-- Policies for subscriptions
create policy "Users can view own subscriptions." on public.subscriptions
  for select using (auth.uid() = user_id);

-- Only service role or Edge Functions should probably manage subscriptions technically,
-- but we can allow users to "insert" if we trust the client flow or verify later.
-- Ideally, webhook handlers (service role) manage this. 
-- For now, let's allow authenticated users to view.

-- Create certificates table
create table public.certificates (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  limit_id text,
  issue_date timestamptz default now(),
  certificate_code text unique,
  download_url text,
  created_at timestamptz default now()
);

-- Enable RLS on certificates
alter table public.certificates enable row level security;

-- Policies for certificates
create policy "Users can view own certificates." on public.certificates
  for select using (auth.uid() = user_id);

create policy "Service interaction." on public.certificates
  for all using ( auth.uid() = user_id ); -- Need to refine this for generation flow

-- Create events table
create table public.events (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text not null,
  date timestamptz not null,
  location text,
  images text[] default '{}',
  price numeric default 0,
  created_at timestamptz default now()
);

-- Enable RLS on events
alter table public.events enable row level security;

-- Policies for events
create policy "Events are viewable by everyone." on public.events
  for select using (true);

create policy "Admins can manage events." on public.events
  for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Create bookings table
create table public.bookings (
  id uuid default uuid_generate_v4() primary key,
  event_id uuid references public.events(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  payment_status text default 'pending',
  payment_id text,
  amount numeric,
  created_at timestamptz default now()
);

-- Enable RLS on bookings
alter table public.bookings enable row level security;

-- Policies for bookings
create policy "Users can view own bookings." on public.bookings
  for select using (auth.uid() = user_id);

create policy "Users can insert own bookings." on public.bookings
  for insert with check (auth.uid() = user_id);

create policy "Admins can manage all bookings." on public.bookings
  for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Storage bucket for events (Note: Might require manual UI confirmation or dashboard setup in some environments, but this is the SQL)
-- insert into storage.buckets (id, name, public)
-- values ('event-media', 'event-media', true)
-- on conflict (id) do nothing;

-- Storage policies for event-media bucket
create policy "Media is viewable by everyone." on storage.objects
  for select using (bucket_id = 'event-media');

create policy "Admins can upload media." on storage.objects
  for insert with check (
    bucket_id = 'event-media' AND
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can update media." on storage.objects
  for update using (
    bucket_id = 'event-media' AND
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can delete media." on storage.objects
  for delete using (
    bucket_id = 'event-media' AND
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

