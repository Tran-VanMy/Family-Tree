-- Insert sample persons
INSERT INTO persons (name, birth_date, position_x, position_y)
VALUES
('Nguyen Van A', '1950-01-01', 400, 20),
('Tran Thi B', '1952-03-15', 600, 20),
('Nguyen Van C', '1975-06-10', 350, 180),
('Nguyen Thi D', '1978-09-05', 650, 180)
ON CONFLICT DO NOTHING;

-- Create relations (parent -> child)
INSERT INTO relations (source_id, target_id, type, label)
SELECT p1.id, p3.id, 'parent_child', 'cha' FROM persons p1, persons p3 WHERE p1.name = 'Nguyen Van A' AND p3.name = 'Nguyen Van C'
ON CONFLICT DO NOTHING;

INSERT INTO relations (source_id, target_id, type, label)
SELECT p2.id, p3.id, 'parent_child', 'mẹ' FROM persons p2, persons p3 WHERE p2.name = 'Tran Thi B' AND p3.name = 'Nguyen Van C'
ON CONFLICT DO NOTHING;

INSERT INTO relations (source_id, target_id, type, label)
SELECT p1.id, p4.id, 'parent_child', 'cha' FROM persons p1, persons p4 WHERE p1.name = 'Nguyen Van A' AND p4.name = 'Nguyen Thi D'
ON CONFLICT DO NOTHING;

-- spouse
INSERT INTO relations (source_id, target_id, type, label)
SELECT p1.id, p2.id, 'spouse', 'vợ/chồng' FROM persons p1, persons p2 WHERE p1.name='Nguyen Van A' AND p2.name='Tran Thi B'
ON CONFLICT DO NOTHING;
