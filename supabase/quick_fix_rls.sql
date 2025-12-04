-- Quick fix for 403 error on orders table
-- Run this in Supabase SQL Editor

-- Step 1: Drop all existing policies on orders table
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'orders' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.orders';
    END LOOP;
END $$;

-- Step 2: Create new policies that allow insert and select
CREATE POLICY "orders_insert_policy"
ON public.orders
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "orders_select_policy"
ON public.orders
FOR SELECT
TO anon, authenticated
USING (true);

-- Step 3: Fix order_items table RLS
-- Drop all existing policies on order_items table
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'order_items' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.order_items';
    END LOOP;
END $$;

-- Create policies for order_items
CREATE POLICY "order_items_insert_policy"
ON public.order_items
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "order_items_select_policy"
ON public.order_items
FOR SELECT
TO anon, authenticated
USING (true);

-- Step 4: Grant permissions
GRANT INSERT, SELECT ON public.orders TO anon, authenticated;
GRANT INSERT, SELECT ON public.order_items TO anon, authenticated;

