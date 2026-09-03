CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID PRIMARY KEY,
  item_type VARCHAR(2) NOT NULL CHECK (item_type IN ('PR', 'PO', 'GR')),
  item_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (item_type, item_id)
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_item_type ON bookmarks(item_type);
CREATE INDEX IF NOT EXISTS idx_bookmarks_created_at ON bookmarks(created_at DESC);

CREATE OR REPLACE FUNCTION delete_bookmarks_for_pr() RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM bookmarks WHERE item_type = 'PR' AND item_id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION delete_bookmarks_for_po() RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM bookmarks WHERE item_type = 'PO' AND item_id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION delete_bookmarks_for_gr() RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM bookmarks WHERE item_type = 'GR' AND item_id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_delete_bookmarks_for_pr ON purchase_requisitions;
CREATE TRIGGER trg_delete_bookmarks_for_pr
AFTER DELETE ON purchase_requisitions
FOR EACH ROW EXECUTE FUNCTION delete_bookmarks_for_pr();

DROP TRIGGER IF EXISTS trg_delete_bookmarks_for_po ON purchase_orders;
CREATE TRIGGER trg_delete_bookmarks_for_po
AFTER DELETE ON purchase_orders
FOR EACH ROW EXECUTE FUNCTION delete_bookmarks_for_po();

DROP TRIGGER IF EXISTS trg_delete_bookmarks_for_gr ON goods_receipts;
CREATE TRIGGER trg_delete_bookmarks_for_gr
AFTER DELETE ON goods_receipts
FOR EACH ROW EXECUTE FUNCTION delete_bookmarks_for_gr();
