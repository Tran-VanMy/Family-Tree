-- Insert sample persons
INSERT INTO persons (name, birth_date, death_date, notes, gender, position_x, position_y)
VALUES
('Nguyễn Văn A', '1978-01-01', '2015-01-01', 'Ông', 'Nam', 124.3085740251334, 153.22863619006523),
('Đoàn Thị B', '1970-01-01', '2013-01-01', 'Bà', 'Nữ', 374.60214995954937, 152.90336744512157),
('Trần Hoàng C', '1999-01-01', NULL, NULL, 'Nam', 247.0966325548784, 337.8438025996442),
('Nguyễn Thị D', '2000-01-01', NULL, NULL, 'Nữ', 659.4793419988139, 340.14119930963824),
('Trần Hoàng F', '2015-01-01', NULL, NULL, 'Nam', 364.77629343190347, 546.2706335214351),
('Nguyễn Thị G', '2017-01-01', NULL, NULL, 'Nữ', 118.51928928011841, 543.8024272556654),
('Trần Hoàng E', '2017-01-01', NULL, NULL, 'Nữ', 561.2976492072644, 540.9926018783437),
('Trần Quang H', '2023-01-01', NULL, NULL, 'Nam', 245.60631508832978, 705.0036815960653)
ON CONFLICT DO NOTHING;

-- spouse (vợ/chồng)
INSERT INTO relations (source_id, target_id, type, label)
SELECT p1.id, p2.id, 'spouse', 'Kết Hôn'
FROM persons p1, persons p2
WHERE p1.name = 'Nguyễn Văn A' AND p2.name = 'Đoàn Thị B'
ON CONFLICT DO NOTHING;

INSERT INTO relations (source_id, target_id, type, label)
SELECT p1.id, p2.id, 'spouse', 'Kết Hôn'
FROM persons p1, persons p2
WHERE p1.name = 'Trần Hoàng C' AND p2.name = 'Nguyễn Thị D'
ON CONFLICT DO NOTHING;

INSERT INTO relations (source_id, target_id, type, label)
SELECT p1.id, p2.id, 'spouse', 'Kết Hôn'
FROM persons p1, persons p2
WHERE p1.name = 'Trần Hoàng F' AND p2.name = 'Nguyễn Thị G'
ON CONFLICT DO NOTHING;

-- parent -> child
INSERT INTO relations (source_id, target_id, type, label)
SELECT p1.id, p2.id, 'parent_child', 'Con'
FROM persons p1, persons p2
WHERE p1.name = 'Đoàn Thị B' AND p2.name = 'Trần Hoàng C'
ON CONFLICT DO NOTHING;

INSERT INTO relations (source_id, target_id, type, label)
SELECT p1.id, p2.id, 'parent_child', 'Con'
FROM persons p1, persons p2
WHERE p1.name = 'Nguyễn Thị D' AND p2.name = 'Trần Hoàng E'
ON CONFLICT DO NOTHING;

INSERT INTO relations (source_id, target_id, type, label)
SELECT p1.id, p2.id, 'parent_child', 'Con'
FROM persons p1, persons p2
WHERE p1.name = 'Nguyễn Thị G' AND p2.name = 'Trần Quang H'
ON CONFLICT DO NOTHING;

-- sibling
INSERT INTO relations (source_id, target_id, type, label)
SELECT p1.id, p2.id, 'sibling', 'Chị / Em'
FROM persons p1, persons p2
WHERE p1.name = 'Trần Hoàng F' AND p2.name = 'Trần Hoàng E'
ON CONFLICT DO NOTHING;
