-- Catalogue administrator access setup.
-- Run this manually in Supabase SQL Editor after reviewing existing policies.
-- The catalogue workspace already exists; do not create another workspace row.

select policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename = 'workspace_members'
order by policyname;

create or replace function public.is_catalog_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.workspace_members
    where workspace_id =
      '00000000-0000-0000-0000-000000000002'::uuid
      and user_id = auth.uid()
      and role = 'admin'
  );
$$;

grant execute on function public.is_catalog_admin() to authenticated;

alter table public.workspace_members
enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'workspace_members'
      and policyname = 'Users can read their own workspace memberships'
  ) then
    execute 'create policy "Users can read their own workspace memberships"
      on public.workspace_members
      for select
      to authenticated
      using (user_id = auth.uid())';
  end if;
end
$$;

-- Manual administrator registration after each Google account logs in once:
-- 1. Open https://mworkroom.github.io/ngcatalogue/#/admin.
-- 2. Log in with the Google account.
-- 3. In Supabase Dashboard, open Authentication > Users.
-- 4. Copy the authenticated user UUID.
-- 5. Insert the membership row below with the copied UUID.

insert into public.workspace_members (
  workspace_id,
  user_id,
  role
)
values (
  '00000000-0000-0000-0000-000000000002',
  'AUTH_USER_UUID_HERE',
  'admin'
);
