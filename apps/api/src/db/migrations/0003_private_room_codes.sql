ALTER TABLE rooms ADD COLUMN IF NOT EXISTS join_code VARCHAR(32);

UPDATE rooms
SET join_code = 'ROOM-' || upper(substr(md5(id::text), 1, 8))
WHERE join_code IS NULL;

ALTER TABLE rooms ALTER COLUMN join_code SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS rooms_join_code_unique ON rooms(join_code);
