-- Fix RLS policies for orders table
-- This allows the database trigger to query orders table to generate order_number

-- First, ensure RLS is enabled on orders table
ALTER TABLE IF EXISTS orders ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies on orders table to start fresh
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'orders' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON orders';
    END LOOP;
END $$;

-- Policy 1: Allow INSERT for anon and authenticated users (for checkout)
CREATE POLICY "Allow insert on orders"
ON orders
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Policy 2: Allow SELECT for anon and authenticated users
-- This is critical for .select() after insert to work
CREATE POLICY "Allow select on orders"
ON orders
FOR SELECT
TO anon, authenticated
USING (true);

-- Policy 3: Allow UPDATE for authenticated users (for admin updates)
CREATE POLICY "Allow update on orders"
ON orders
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Fix order_items table RLS
ALTER TABLE IF EXISTS order_items ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies on order_items table
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'order_items' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON order_items';
    END LOOP;
END $$;

-- Policy for order_items: Allow INSERT
CREATE POLICY "Allow insert on order_items"
ON order_items
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Policy for order_items: Allow SELECT
CREATE POLICY "Allow select on order_items"
ON order_items
FOR SELECT
TO anon, authenticated
USING (true);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON orders TO anon, authenticated;
GRANT ALL ON order_items TO anon, authenticated;

-- Ensure the tables have proper permissions
ALTER TABLE orders OWNER TO postgres;
ALTER TABLE order_items OWNER TO postgres;

-- If you have a trigger function that generates order_number, make sure it uses SECURITY DEFINER
-- This allows the function to bypass RLS when querying orders table
-- Example (run this in Supabase SQL Editor if you have such a trigger):
/*
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    SELECT COALESCE(MAX(order_number), 0) + 1 INTO NEW.order_number
    FROM orders;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
*/

