import { v4 as uuidv4 } from 'uuid';

const ITEM_TYPES = new Set(['PR', 'PO', 'GR']);

function normalizeItemType(itemType) {
  if (typeof itemType !== 'string') {
    return null;
  }
  const normalized = itemType.toUpperCase();
  return ITEM_TYPES.has(normalized) ? normalized : null;
}

async function validateItemExists(db, itemType, itemId) {
  const lookupByType = {
    PR: 'SELECT id FROM purchase_requisitions WHERE id = $1',
    PO: 'SELECT id FROM purchase_orders WHERE id = $1',
    GR: 'SELECT id FROM goods_receipts WHERE id = $1',
  };

  const { rowCount } = await db.query(lookupByType[itemType], [itemId]);
  return rowCount > 0;
}

function validationError(message) {
  const err = new Error(message);
  err.statusCode = 422;
  return err;
}

export async function isBookmarked(db, itemType, itemId) {
  const normalizedType = normalizeItemType(itemType);
  if (!normalizedType || !itemId) {
    throw validationError('itemType and itemId are required');
  }

  const result = await db.query(
    `SELECT id FROM bookmarks WHERE item_type = $1 AND item_id = $2`,
    [normalizedType, itemId]
  );

  return result.rowCount > 0;
}

export async function toggleBookmark(db, itemType, itemId) {
  const normalizedType = normalizeItemType(itemType);
  if (!normalizedType || !itemId) {
    throw validationError('itemType and itemId are required');
  }

  const itemExists = await validateItemExists(db, normalizedType, itemId);
  if (!itemExists) {
    throw validationError('Item not found');
  }

  const existing = await db.query(
    `SELECT id FROM bookmarks WHERE item_type = $1 AND item_id = $2`,
    [normalizedType, itemId]
  );

  if (existing.rowCount > 0) {
    await db.query(`DELETE FROM bookmarks WHERE item_type = $1 AND item_id = $2`, [normalizedType, itemId]);
    return { itemType: normalizedType, itemId, bookmarked: false };
  }

  await db.query(
    `INSERT INTO bookmarks (id, item_type, item_id) VALUES ($1, $2, $3)`,
    [uuidv4(), normalizedType, itemId]
  );

  return { itemType: normalizedType, itemId, bookmarked: true };
}

export async function getBookmarks(db) {
  const { rows } = await db.query(
    `SELECT
      b.id,
      b.item_type,
      b.item_id,
      b.created_at,
      pr.pr_number,
      pr.title AS pr_title,
      po.po_number,
      gr.gr_number
     FROM bookmarks b
     LEFT JOIN purchase_requisitions pr
       ON b.item_type = 'PR' AND pr.id = b.item_id
     LEFT JOIN purchase_orders po
       ON b.item_type = 'PO' AND po.id = b.item_id
     LEFT JOIN goods_receipts gr
       ON b.item_type = 'GR' AND gr.id = b.item_id
     ORDER BY b.created_at DESC`
  );

  return rows.map((row) => ({
    id: row.id,
    itemType: row.item_type,
    itemId: row.item_id,
    createdAt: row.created_at,
    prNumber: row.pr_number || null,
    prTitle: row.pr_title || null,
    poNumber: row.po_number || null,
    grNumber: row.gr_number || null,
  }));
}
