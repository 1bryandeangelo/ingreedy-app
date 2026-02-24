-- Run this in your Supabase SQL editor (Dashboard → SQL Editor → New Query)
-- This creates the pantry_items table and sets up Row Level Security

-- Create the pantry_items table
CREATE TABLE IF NOT EXISTS pantry_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  quantity_amount NUMERIC DEFAULT 1,
  quantity_unit TEXT DEFAULT 'count',
  expiration_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE pantry_items ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own items
CREATE POLICY "Users can view own pantry items"
  ON pantry_items
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own items
CREATE POLICY "Users can insert own pantry items"
  ON pantry_items
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own items
CREATE POLICY "Users can update own pantry items"
  ON pantry_items
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own items
CREATE POLICY "Users can delete own pantry items"
  ON pantry_items
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create an index for faster lookups
CREATE INDEX idx_pantry_items_user_id ON pantry_items(user_id);
