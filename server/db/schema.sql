-- ============================================================
-- SCHEMA.SQL — FULL STRUCTURE FOR FAMILY TREE
-- ============================================================

DROP TABLE IF EXISTS relations CASCADE;
DROP TABLE IF EXISTS parent_child CASCADE;
DROP TABLE IF EXISTS marriages CASCADE;
DROP TABLE IF EXISTS persons CASCADE;
DROP TABLE IF EXISTS families CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ===========================
-- USERS
-- ===========================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ===========================
-- FAMILIES (branch trees)
-- ===========================
CREATE TABLE families (
    family_id SERIAL PRIMARY KEY,
    owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT NOW()
);

-- ===========================
-- PERSONS
-- ===========================
CREATE TABLE persons (
    person_id SERIAL PRIMARY KEY,
    family_id INTEGER NOT NULL REFERENCES families(family_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    gender VARCHAR(20),
    birth_date DATE,
    death_date DATE,
    notes TEXT,
    position_x INTEGER DEFAULT 200,
    position_y INTEGER DEFAULT 200,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ===========================
-- MARRIAGES
-- ===========================
CREATE TABLE marriages (
    marriage_id SERIAL PRIMARY KEY,
    spouse1_id INTEGER NOT NULL REFERENCES persons(person_id) ON DELETE CASCADE,
    spouse2_id INTEGER NOT NULL REFERENCES persons(person_id) ON DELETE CASCADE,
    start_date DATE,
    end_date DATE,
    status VARCHAR(50),
    note VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Improve speed
CREATE INDEX idx_marriages_s1 ON marriages(spouse1_id);
CREATE INDEX idx_marriages_s2 ON marriages(spouse2_id);

-- ===========================
-- PARENT - CHILD RELATION
-- (Only 3 valid types: Con ruột / Con riêng / Con nuôi)
-- ===========================
CREATE TABLE parent_child (
    parent_child_id SERIAL PRIMARY KEY,
    parent_id INTEGER NOT NULL REFERENCES persons(person_id) ON DELETE CASCADE,
    child_id INTEGER NOT NULL REFERENCES persons(person_id) ON DELETE CASCADE,
    relationship VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_parent_child_parent ON parent_child(parent_id);
CREATE INDEX idx_parent_child_child ON parent_child(child_id);

-- ===========================
-- OTHER RELATIONS
-- (Anh em / Chị em / Anh kế / Họ hàng / Em kế ...)
-- ===========================
CREATE TABLE relations (
    relation_id SERIAL PRIMARY KEY,
    person1_id INTEGER NOT NULL REFERENCES persons(person_id) ON DELETE CASCADE,
    person2_id INTEGER NOT NULL REFERENCES persons(person_id) ON DELETE CASCADE,
    relationship VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_relations_person1 ON relations(person1_id);
CREATE INDEX idx_relations_person2 ON relations(person2_id);
