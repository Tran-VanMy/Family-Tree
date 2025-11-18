TRUNCATE TABLE relations, parent_child, marriages, persons, families, users RESTART IDENTITY CASCADE;

-- ============================================================
-- SEED.SQL — SAMPLE DATA FOR FAMILY TREE (WITH POSITIONS)
-- ============================================================

-- =======================
-- 1. USER ADMIN
-- =======================
INSERT INTO users (email, password_hash, username)
VALUES (
  'admin@gmail.com',
  '$2a$10$CwTycUXWue0Thq9StjUM0uJ8qjN4Jr2dZSmHgwlHGhEqTG3OCfS8.',
  'Admin'
);

-- =======================
-- 2. FAMILIES (branches)
-- =======================
INSERT INTO families (owner_id, name, description)
VALUES 
(1, 'default families', 'Main root branch'),
(1, 'Branch A', 'Nhánh phụ A'),
(1, 'Branch B', 'Nhánh phụ B');

-- =======================
-- 3. PERSONS WITH POSITIONS
-- =======================
-- FAMILY TREE LAYOUT (classic top-down):
--                Ông A (1) — Bà A (2)
--             /        |         \
--         Bác B(3)   Cô C(4)     Bố D(5)—Mẹ D(6)
--                                  |–––––––––––––––|
--                 -------------------------------------------------
--                 |                     |                     |
--             Anh E(7)              Chị F(8)              Em G(9)
--                                            Em H(10)
--                 |––––––|
--              Con I(11)  Con J(12)

-- Vị trí được đặt thủ công theo layout đẹp

INSERT INTO persons (family_id, name, gender, birth_date, notes, position_x, position_y)
VALUES
-- Top generation
(1, 'Ông A', 'Nam', '1940-01-01', 'Tổ tiên', 600, 50),
(1, 'Bà A', 'Nữ', '1945-01-01', '', 750, 50),

-- Children of A
(1, 'Bác B', 'Nam', '1965-01-01', '', 350, 200),
(1, 'Cô C', 'Nữ', '1967-01-01', '', 600, 200),
(1, 'Bố D', 'Nam', '1970-01-01', '', 850, 200),
(1, 'Mẹ D', 'Nữ', '1972-01-01', '', 1000, 200),

-- Children of D
(1, 'Anh E', 'Nam', '1995-01-01', '', 700, 400),
(1, 'Chị F', 'Nữ', '1992-01-01', '', 850, 400),
(1, 'Em G', 'Nam', '2000-01-01', '', 1000, 400),
(1, 'Em H', 'Nữ', '2002-01-01', '', 1150, 400),

-- Children of E
(1, 'Con I', 'Nam', '2015-01-01', '', 650, 600),
(1, 'Con J', 'Nữ', '2018-01-01', '', 750, 600),

-- Other lineage (separate cluster)
(1, 'Ông K', 'Nam', '1938-01-01', '', 150, 50),
(1, 'Bà K', 'Nữ', '1942-01-01', '', 250, 50),
(1, 'Chú L', 'Nam', '1975-01-01', '', 150, 200),
(1, 'Cậu M', 'Nam', '1980-01-01', '', 250, 200),
(1, 'Dì N', 'Nữ', '1982-01-01', '', 350, 200),
(1, 'Anh O', 'Nam', '1998-01-01', '', 150, 400),
(1, 'Chị P', 'Nữ', '1999-01-01', '', 250, 400),
(1, 'Anh Q', 'Nam', '1996-01-01', '', 350, 400);

-- =======================
-- 4. HÔN NHÂN
-- =======================
INSERT INTO marriages (spouse1_id, spouse2_id, start_date, status, note)
VALUES
(1, 2, '1960-01-01', 'Kết hôn', ''),
(5, 6, '1990-01-01', 'Kết hôn', '');

-- =======================
-- 5. QUAN HỆ CHA – MẸ – CON
-- =======================
INSERT INTO parent_child (parent_id, child_id, relationship)
VALUES
-- Ông / Bà → B, C, D
(1, 3, 'Con ruột'), (2, 3, 'Con ruột'),
(1, 4, 'Con ruột'), (2, 4, 'Con ruột'),
(1, 5, 'Con ruột'), (2, 5, 'Con ruột'),

-- Bố D → E, F, G, H
(5, 7, 'Con ruột'), (6, 7, 'Con ruột'),
(5, 8, 'Con ruột'), (6, 8, 'Con ruột'),
(5, 9, 'Con ruột'), (6, 9, 'Con ruột'),
(5, 10, 'Con ruột'), (6, 10, 'Con ruột'),

-- E → I, J
(7, 11, 'Con ruột'),
(7, 12, 'Con ruột');

-- =======================
-- 6. QUAN HỆ KHÁC (RELATIONS)
-- =======================
INSERT INTO relations (person1_id, person2_id, relationship)
VALUES
-- Siblings
(7, 8, 'Anh em'),
(8, 7, 'Chị em'),
(9,10, 'Anh em'),
(10,9, 'Chị em'),

-- Step siblings
(7, 9, 'Anh kế'),
(8, 9, 'Chị kế'),

-- Relatives
(3, 15, 'Họ hàng'),
(4, 16, 'Họ hàng'),
(7, 18, 'Họ hàng'),

-- Other
(17, 20, 'Em kế'),
(18, 19, 'Anh em');
