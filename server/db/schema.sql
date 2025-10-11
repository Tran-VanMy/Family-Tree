-- ===============================================
-- DATABASE SCHEMA: FAMILY TREE APP
-- ===============================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===============================================
-- USERS TABLE
-- ===============================================
-- Stores authentication and basic profile info
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  username VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ===============================================
-- FAMILY TREES TABLE
-- ===============================================
-- Each user can own multiple family trees
CREATE TABLE IF NOT EXISTS family_trees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ===============================================
-- PERSONS TABLE
-- ===============================================
-- Each person belongs to a specific family tree
CREATE TABLE IF NOT EXISTS persons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tree_id UUID NOT NULL REFERENCES family_trees(id) ON DELETE CASCADE,
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

-- ===============================================
-- RELATION TYPES ENUM
-- ===============================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'relation_type') THEN
    CREATE TYPE relation_type AS ENUM (
      'parent_child',
      'spouse',
      'sibling',
      'custom'
    );
  END IF;
END$$;

-- ===============================================
-- RELATIONS TABLE
-- ===============================================
-- Describes how two persons in the same tree are related
CREATE TABLE IF NOT EXISTS relations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tree_id UUID NOT NULL REFERENCES family_trees(id) ON DELETE CASCADE,
  source_id UUID NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
  target_id UUID NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
  type relation_type NOT NULL,
  label TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT unique_relation UNIQUE (source_id, target_id, type)
);

-- ===============================================
-- INDEXES (for performance)
-- ===============================================
CREATE INDEX IF NOT EXISTS idx_persons_tree_id ON persons(tree_id);
CREATE INDEX IF NOT EXISTS idx_relations_tree_id ON relations(tree_id);
CREATE INDEX IF NOT EXISTS idx_family_trees_owner_id ON family_trees(owner_id);

-- ===============================================
-- DONE
-- ===============================================
