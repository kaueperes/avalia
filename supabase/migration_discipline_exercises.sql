-- Vincula exercises à disciplines
ALTER TABLE exercises
  ADD COLUMN IF NOT EXISTS discipline_id UUID REFERENCES disciplines(id) ON DELETE SET NULL;
