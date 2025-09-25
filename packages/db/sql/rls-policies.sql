-- Supabase RLS Policies for KhaledAun.com
-- This file contains Row Level Security policies for the database tables

-- Enable RLS on the tables
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Post table
-- Policy: Admins can perform any action on posts
CREATE POLICY "Admins can do everything on posts" ON posts
  FOR ALL
  TO authenticated
  USING (
    (auth.jwt() ->> 'role') = 'admin' 
    OR (auth.jwt() ->> 'app_metadata')::json ->> 'role' = 'admin'
    OR (auth.jwt() ->> 'user_metadata')::json ->> 'role' = 'admin'
  );

-- Policy: Editors can create and update posts, but not delete
CREATE POLICY "Editors can create and update posts" ON posts
  FOR INSERT, UPDATE
  TO authenticated
  USING (
    (auth.jwt() ->> 'role') = 'editor'
    OR (auth.jwt() ->> 'app_metadata')::json ->> 'role' = 'editor'
    OR (auth.jwt() ->> 'user_metadata')::json ->> 'role' = 'editor'
  );

-- Policy: Authenticated users can only read published posts
CREATE POLICY "Authenticated users can read published posts" ON posts
  FOR SELECT
  TO authenticated
  USING (status = 'PUBLISHED');

-- Policy for anonymous users (public) - can only read published posts
CREATE POLICY "Anonymous users can read published posts" ON posts
  FOR SELECT
  TO anon
  USING (status = 'PUBLISHED');

-- RLS Policies for Lead table
-- Policy: Only admins and ops can read leads
CREATE POLICY "Admins and ops can read leads" ON leads
  FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() ->> 'role') IN ('admin', 'ops')
    OR (auth.jwt() ->> 'app_metadata')::json ->> 'role' IN ('admin', 'ops')
    OR (auth.jwt() ->> 'user_metadata')::json ->> 'role' IN ('admin', 'ops')
  );

-- Policy: Only admins can modify leads
CREATE POLICY "Admins can modify leads" ON leads
  FOR INSERT, UPDATE, DELETE
  TO authenticated
  USING (
    (auth.jwt() ->> 'role') = 'admin'
    OR (auth.jwt() ->> 'app_metadata')::json ->> 'role' = 'admin'
    OR (auth.jwt() ->> 'user_metadata')::json ->> 'role' = 'admin'
  );

-- Create a function to help with testing (optional - for development)
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
BEGIN
  -- Try different locations where role might be stored
  RETURN COALESCE(
    auth.jwt() ->> 'role',
    (auth.jwt() ->> 'app_metadata')::json ->> 'role',
    (auth.jwt() ->> 'user_metadata')::json ->> 'role',
    'user'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT USAGE ON SCHEMA auth TO anon;