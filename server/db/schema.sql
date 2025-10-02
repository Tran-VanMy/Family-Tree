-- Extension for UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- persons table
CREATE TABLE IF NOT EXISTS persons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  birth_date DATE,
  death_date DATE,
  avatar_url TEXT,
  notes TEXT,
  gender VARCHAR(10),
  position_x DOUBLE PRECISION,
  position_y DOUBLE PRECISION,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_deleted BOOLEAN DEFAULT FALSE
);

-- enum for relation types
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'relation_type') THEN
    CREATE TYPE relation_type AS ENUM ('parent_child','spouse','sibling','custom');
  END IF;
END$$;

-- relations table
CREATE TABLE IF NOT EXISTS relations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
  target_id UUID NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
  type relation_type NOT NULL,
  label TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT unique_relation UNIQUE (source_id, target_id, type)
);
