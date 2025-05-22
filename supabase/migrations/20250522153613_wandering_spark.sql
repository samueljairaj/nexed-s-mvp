/*
  # Create assistant messages table

  1. New Tables
    - `assistant_messages`
      - `id` (text, primary key)
      - `user_id` (uuid, references profiles.id)
      - `role` (text)
      - `content` (text)
      - `created_at` (timestamptz)
  2. Security
    - Enable RLS on `assistant_messages` table
    - Add policy for authenticated users to read/write their own messages
*/

-- Create assistant_messages table
CREATE TABLE IF NOT EXISTS assistant_messages (
  id text PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) NOT NULL,
  role text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE assistant_messages ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read their own messages"
  ON assistant_messages
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own messages"
  ON assistant_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own messages"
  ON assistant_messages
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own messages"
  ON assistant_messages
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS assistant_messages_user_id_idx ON assistant_messages(user_id);
CREATE INDEX IF NOT EXISTS assistant_messages_created_at_idx ON assistant_messages(created_at);