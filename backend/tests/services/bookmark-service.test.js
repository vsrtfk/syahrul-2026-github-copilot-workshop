import { describe, test, expect, jest } from '@jest/globals';
import { getBookmarks, isBookmarked, toggleBookmark } from '../../src/services/bookmark-service.js';

function mockDb(queryImpl) {
  return { query: jest.fn(queryImpl) };
}

describe('bookmark-service', () => {
  test('toggleBookmark creates bookmark when not bookmarked', async () => {
    let call = 0;
    const db = mockDb((sql) => {
      call += 1;
      if (call === 1) {
        return { rows: [{ id: 'pr-1' }], rowCount: 1 };
      }
      if (call === 2) {
        return { rows: [], rowCount: 0 };
      }
      if (sql.startsWith('INSERT INTO bookmarks')) {
        return { rows: [], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    });

    const result = await toggleBookmark(db, 'pr', 'pr-1');

    expect(result).toEqual({ itemType: 'PR', itemId: 'pr-1', bookmarked: true });
  });

  test('toggleBookmark removes bookmark when already bookmarked', async () => {
    let call = 0;
    const db = mockDb(() => {
      call += 1;
      if (call === 1) {
        return { rows: [{ id: 'po-1' }], rowCount: 1 };
      }
      if (call === 2) {
        return { rows: [{ id: 'bm-1' }], rowCount: 1 };
      }
      return { rows: [], rowCount: 1 };
    });

    const result = await toggleBookmark(db, 'PO', 'po-1');

    expect(result).toEqual({ itemType: 'PO', itemId: 'po-1', bookmarked: false });
  });

  test('toggleBookmark rejects unsupported item type', async () => {
    const db = mockDb(() => ({ rows: [], rowCount: 0 }));

    await expect(toggleBookmark(db, 'XX', 'id-1')).rejects.toMatchObject({
      message: 'itemType and itemId are required',
      statusCode: 422,
    });
  });

  test('toggleBookmark rejects missing item', async () => {
    const db = mockDb(() => ({ rows: [], rowCount: 0 }));

    await expect(toggleBookmark(db, 'GR', 'missing')).rejects.toMatchObject({
      message: 'Item not found',
      statusCode: 422,
    });
  });

  test('isBookmarked returns true when bookmark exists', async () => {
    const db = mockDb(() => ({ rows: [{ id: 'bm-1' }], rowCount: 1 }));

    await expect(isBookmarked(db, 'PR', 'pr-1')).resolves.toBe(true);
  });

  test('getBookmarks maps PR, PO, and GR details', async () => {
    const db = mockDb(() => ({
      rows: [
        {
          id: 'bm-pr',
          item_type: 'PR',
          item_id: 'pr-1',
          created_at: '2026-01-01T00:00:00.000Z',
          pr_number: 'PR-2026-0001',
          pr_title: 'Requisition title',
          po_number: null,
          gr_number: null,
        },
        {
          id: 'bm-po',
          item_type: 'PO',
          item_id: 'po-1',
          created_at: '2026-01-01T00:01:00.000Z',
          pr_number: null,
          pr_title: null,
          po_number: 'PO-2026-0001',
          gr_number: null,
        },
        {
          id: 'bm-gr',
          item_type: 'GR',
          item_id: 'gr-1',
          created_at: '2026-01-01T00:02:00.000Z',
          pr_number: null,
          pr_title: null,
          po_number: null,
          gr_number: 'GR-2026-0001',
        },
      ],
      rowCount: 3,
    }));

    const result = await getBookmarks(db);

    expect(result).toEqual([
      {
        id: 'bm-pr',
        itemType: 'PR',
        itemId: 'pr-1',
        createdAt: '2026-01-01T00:00:00.000Z',
        prNumber: 'PR-2026-0001',
        prTitle: 'Requisition title',
        poNumber: null,
        grNumber: null,
      },
      {
        id: 'bm-po',
        itemType: 'PO',
        itemId: 'po-1',
        createdAt: '2026-01-01T00:01:00.000Z',
        prNumber: null,
        prTitle: null,
        poNumber: 'PO-2026-0001',
        grNumber: null,
      },
      {
        id: 'bm-gr',
        itemType: 'GR',
        itemId: 'gr-1',
        createdAt: '2026-01-01T00:02:00.000Z',
        prNumber: null,
        prTitle: null,
        poNumber: null,
        grNumber: 'GR-2026-0001',
      },
    ]);
  });
});
