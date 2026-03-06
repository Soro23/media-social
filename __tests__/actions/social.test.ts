import {
  toggleFavoriteAction,
  addCommentAction,
  deleteCommentAction,
  reportCommentAction,
  upsertRatingAction,
} from '@/app/actions/social';
import { createSessionClient, createAdminClient } from '@/lib/appwrite/server';
import { revalidatePath } from 'next/cache';

// ---- Mocks ----

jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }));

jest.mock('isomorphic-dompurify', () => ({
  __esModule: true,
  default: { sanitize: jest.fn((content: string) => content) },
}));

jest.mock('node-appwrite', () => {
  class AppwriteException extends Error {
    code: number;
    constructor(message: string, code = 500) {
      super(message);
      this.name = 'AppwriteException';
      this.code = code;
    }
  }
  return {
    ID: { unique: jest.fn(() => 'generated-id') },
    Query: {
      equal: jest.fn((...args: unknown[]) => ({ equal: args })),
      greaterThanEqual: jest.fn((...args: unknown[]) => ({ gte: args })),
      limit: jest.fn((n: number) => ({ limit: n })),
      orderDesc: jest.fn((f: string) => ({ orderDesc: f })),
    },
    AppwriteException,
  };
});

jest.mock('@/lib/appwrite/server', () => ({
  createSessionClient: jest.fn(),
  createAdminClient: jest.fn(),
}));

// ---- Helpers ----

function makeDatabases() {
  return {
    listDocuments: jest.fn(),
    getDocument: jest.fn(),
    createDocument: jest.fn(),
    updateDocument: jest.fn(),
    deleteDocument: jest.fn(),
  };
}

function makeFormData(entries: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(entries)) fd.append(k, v);
  return fd;
}

const MOCK_USER = { $id: 'user-123' };

const mockedCreateSessionClient = createSessionClient as jest.MockedFunction<typeof createSessionClient>;
const mockedCreateAdminClient = createAdminClient as jest.MockedFunction<typeof createAdminClient>;
const mockedRevalidatePath = revalidatePath as jest.Mock;

let db: ReturnType<typeof makeDatabases>;
let account: { get: jest.Mock };

beforeEach(() => {
  jest.clearAllMocks();

  db = makeDatabases();
  account = { get: jest.fn().mockResolvedValue(MOCK_USER) };

  mockedCreateSessionClient.mockResolvedValue({ account, databases: db } as never);
  mockedCreateAdminClient.mockReturnValue({ account, databases: db, users: {} } as never);
});

// ============================
// toggleFavoriteAction
// ============================

describe('toggleFavoriteAction', () => {
  it('returns error when not authenticated', async () => {
    account.get.mockRejectedValue(new Error('No session'));

    const result = await toggleFavoriteAction('item-123');

    expect(result).toEqual({ success: false, error: expect.stringContaining('iniciar sesión') });
  });

  it('removes existing favorite and decrements favorite_count', async () => {
    db.listDocuments.mockResolvedValueOnce({ total: 1, documents: [{ $id: 'fav-doc' }] });
    db.deleteDocument.mockResolvedValueOnce({});
    db.getDocument.mockResolvedValueOnce({ favorite_count: 3 });
    db.updateDocument.mockResolvedValueOnce({});

    const result = await toggleFavoriteAction('item-123');

    expect(db.deleteDocument).toHaveBeenCalledWith(expect.any(String), expect.any(String), 'fav-doc');
    expect(db.updateDocument).toHaveBeenCalledWith(
      expect.any(String), expect.any(String), 'item-123', { favorite_count: 2 },
    );
    expect(result).toEqual({ success: true, data: { isFavorite: false } });
  });

  it('does not decrement favorite_count below 0', async () => {
    db.listDocuments.mockResolvedValueOnce({ total: 1, documents: [{ $id: 'fav-doc' }] });
    db.deleteDocument.mockResolvedValueOnce({});
    db.getDocument.mockResolvedValueOnce({ favorite_count: 0 });
    db.updateDocument.mockResolvedValueOnce({});

    await toggleFavoriteAction('item-123');

    expect(db.updateDocument).toHaveBeenCalledWith(
      expect.any(String), expect.any(String), 'item-123', { favorite_count: 0 },
    );
  });

  it('creates new favorite and increments favorite_count', async () => {
    db.listDocuments.mockResolvedValueOnce({ total: 0, documents: [] });
    db.createDocument.mockResolvedValueOnce({});
    db.getDocument.mockResolvedValueOnce({ favorite_count: 2 });
    db.updateDocument.mockResolvedValueOnce({});

    const result = await toggleFavoriteAction('item-123');

    expect(db.createDocument).toHaveBeenCalledWith(
      expect.any(String), expect.any(String), expect.any(String),
      expect.objectContaining({ user_id: MOCK_USER.$id, item_id: 'item-123' }),
    );
    expect(db.updateDocument).toHaveBeenCalledWith(
      expect.any(String), expect.any(String), 'item-123', { favorite_count: 3 },
    );
    expect(result).toEqual({ success: true, data: { isFavorite: true } });
  });

  it('tolerates item not found when updating stats', async () => {
    db.listDocuments.mockResolvedValueOnce({ total: 0, documents: [] });
    db.createDocument.mockResolvedValueOnce({});
    db.getDocument.mockRejectedValueOnce(new Error('Not found'));

    const result = await toggleFavoriteAction('item-123');

    expect(result).toEqual({ success: true, data: { isFavorite: true } });
  });
});

// ============================
// addCommentAction
// ============================

describe('addCommentAction', () => {
  it('returns error when not authenticated', async () => {
    account.get.mockRejectedValue(new Error('No session'));

    const result = await addCommentAction(makeFormData({ content: 'Hello', itemId: 'item-123' }));

    expect(result).toEqual({ success: false, error: expect.stringContaining('iniciar sesión') });
  });

  it('returns validation error for empty content', async () => {
    const result = await addCommentAction(makeFormData({ content: '', itemId: 'item-123' }));
    expect(result.success).toBe(false);
  });

  it('returns validation error for content over 2000 characters', async () => {
    const result = await addCommentAction(makeFormData({ content: 'a'.repeat(2001), itemId: 'item-123' }));
    expect(result.success).toBe(false);
  });

  it('returns validation error for missing itemId', async () => {
    const result = await addCommentAction(makeFormData({ content: 'Hello', itemId: '' }));
    expect(result.success).toBe(false);
  });

  it('returns rate limit error at 10 comments per minute', async () => {
    // checkCommentRateLimit → 10 recent comments
    db.listDocuments.mockResolvedValueOnce({ total: 10, documents: [] });

    const result = await addCommentAction(makeFormData({ content: 'Hello', itemId: 'item-123' }));

    expect(result).toEqual({ success: false, error: expect.stringContaining('rápido') });
    expect(db.createDocument).not.toHaveBeenCalled();
  });

  it('creates comment with denormalized user data', async () => {
    db.listDocuments.mockResolvedValueOnce({ total: 0, documents: [] }); // rate limit ok
    db.getDocument.mockResolvedValueOnce({ username: 'testuser', avatar_url: 'https://avatar.url' }); // profile
    db.createDocument.mockResolvedValueOnce({ $id: 'new-comment' }); // create comment
    db.getDocument.mockResolvedValueOnce({ comment_count: 5 }); // item for count update
    db.updateDocument.mockResolvedValueOnce({});

    const result = await addCommentAction(makeFormData({ content: 'Great anime!', itemId: 'item-123' }));

    expect(db.createDocument).toHaveBeenCalledWith(
      expect.any(String), expect.any(String), expect.any(String),
      expect.objectContaining({
        user_id: MOCK_USER.$id,
        item_id: 'item-123',
        content: 'Great anime!',
        username: 'testuser',
        avatar_url: 'https://avatar.url',
      }),
    );
    expect(result).toEqual({ success: true, data: { id: 'new-comment' } });
  });

  it('uses fallback username when profile not found', async () => {
    db.listDocuments.mockResolvedValueOnce({ total: 0, documents: [] });
    db.getDocument.mockRejectedValueOnce(new Error('Not found')); // profile missing
    db.createDocument.mockResolvedValueOnce({ $id: 'comment-id' });
    db.getDocument.mockRejectedValueOnce(new Error('Not found')); // item missing too

    const result = await addCommentAction(makeFormData({ content: 'Hello', itemId: 'item-123' }));

    expect(db.createDocument).toHaveBeenCalledWith(
      expect.any(String), expect.any(String), expect.any(String),
      expect.objectContaining({ username: 'usuario' }),
    );
    expect(result.success).toBe(true);
  });

  it('increments comment_count on the item', async () => {
    db.listDocuments.mockResolvedValueOnce({ total: 0, documents: [] });
    db.getDocument.mockResolvedValueOnce({ username: 'u', avatar_url: null });
    db.createDocument.mockResolvedValueOnce({ $id: 'c' });
    db.getDocument.mockResolvedValueOnce({ comment_count: 4 });
    db.updateDocument.mockResolvedValueOnce({});

    await addCommentAction(makeFormData({ content: 'Hi', itemId: 'item-123' }));

    expect(db.updateDocument).toHaveBeenCalledWith(
      expect.any(String), expect.any(String), 'item-123', { comment_count: 5 },
    );
  });
});

// ============================
// deleteCommentAction
// ============================

describe('deleteCommentAction', () => {
  it('returns error when not authenticated', async () => {
    account.get.mockRejectedValue(new Error('No session'));

    const result = await deleteCommentAction('comment-123');

    expect(result).toEqual({ success: false, error: expect.any(String) });
  });

  it('returns error when comment not found', async () => {
    db.getDocument.mockRejectedValueOnce(new Error('Not found'));

    const result = await deleteCommentAction('comment-123');

    expect(result).toEqual({ success: false, error: expect.stringContaining('encontrado') });
  });

  it('returns error when user is not the comment owner', async () => {
    db.getDocument.mockResolvedValueOnce({ user_id: 'other-user', item_id: 'item-123' });

    const result = await deleteCommentAction('comment-123');

    expect(result).toEqual({ success: false, error: expect.any(String) });
    expect(db.deleteDocument).not.toHaveBeenCalled();
  });

  it('deletes comment and decrements comment_count', async () => {
    db.getDocument.mockResolvedValueOnce({ user_id: MOCK_USER.$id, item_id: 'item-123' });
    db.deleteDocument.mockResolvedValueOnce({});
    db.getDocument.mockResolvedValueOnce({ comment_count: 3 });
    db.updateDocument.mockResolvedValueOnce({});

    const result = await deleteCommentAction('comment-123');

    expect(db.deleteDocument).toHaveBeenCalledWith(
      expect.any(String), expect.any(String), 'comment-123',
    );
    expect(db.updateDocument).toHaveBeenCalledWith(
      expect.any(String), expect.any(String), 'item-123', { comment_count: 2 },
    );
    expect(mockedRevalidatePath).toHaveBeenCalledWith('/', 'layout');
    expect(result).toEqual({ success: true, data: undefined });
  });

  it('does not decrement comment_count below 0', async () => {
    db.getDocument.mockResolvedValueOnce({ user_id: MOCK_USER.$id, item_id: 'item-123' });
    db.deleteDocument.mockResolvedValueOnce({});
    db.getDocument.mockResolvedValueOnce({ comment_count: 0 });
    db.updateDocument.mockResolvedValueOnce({});

    await deleteCommentAction('comment-123');

    expect(db.updateDocument).toHaveBeenCalledWith(
      expect.any(String), expect.any(String), 'item-123', { comment_count: 0 },
    );
  });
});

// ============================
// reportCommentAction
// ============================

describe('reportCommentAction', () => {
  it('returns error when not authenticated', async () => {
    account.get.mockRejectedValue(new Error('No session'));

    const result = await reportCommentAction(makeFormData({ commentId: 'comment-123' }));

    expect(result.success).toBe(false);
  });

  it('returns error when already reported', async () => {
    db.listDocuments.mockResolvedValueOnce({ total: 1, documents: [{ $id: 'r' }] });

    const result = await reportCommentAction(makeFormData({ commentId: 'comment-123' }));

    expect(result).toEqual({ success: false, error: expect.stringContaining('Ya has reportado') });
    expect(db.createDocument).not.toHaveBeenCalled();
  });

  it('creates report with reason', async () => {
    db.listDocuments.mockResolvedValueOnce({ total: 0, documents: [] });
    db.createDocument.mockResolvedValueOnce({ $id: 'report-id' });

    const result = await reportCommentAction(makeFormData({ commentId: 'comment-123', reason: 'spam' }));

    expect(db.createDocument).toHaveBeenCalledWith(
      expect.any(String), expect.any(String), expect.any(String),
      expect.objectContaining({
        reporter_id: MOCK_USER.$id,
        comment_id: 'comment-123',
        reason: 'spam',
      }),
    );
    expect(result).toEqual({ success: true, data: undefined });
  });

  it('creates report with null reason when not provided', async () => {
    db.listDocuments.mockResolvedValueOnce({ total: 0, documents: [] });
    db.createDocument.mockResolvedValueOnce({});

    await reportCommentAction(makeFormData({ commentId: 'comment-123' }));

    expect(db.createDocument).toHaveBeenCalledWith(
      expect.any(String), expect.any(String), expect.any(String),
      expect.objectContaining({ reason: null }),
    );
  });
});

// ============================
// upsertRatingAction
// ============================

describe('upsertRatingAction', () => {
  it('returns error when not authenticated', async () => {
    account.get.mockRejectedValue(new Error('No session'));

    const result = await upsertRatingAction(makeFormData({ itemId: 'item-123', score: '8' }));

    expect(result.success).toBe(false);
  });

  it.each([['0'], ['11'], ['invalid'], ['']])(
    'returns validation error for score "%s"',
    async (score) => {
      const result = await upsertRatingAction(makeFormData({ itemId: 'item-123', score }));
      expect(result.success).toBe(false);
    },
  );

  it('creates new rating and updates item stats', async () => {
    db.listDocuments.mockResolvedValueOnce({ total: 0, documents: [] }); // no existing rating
    db.createDocument.mockResolvedValueOnce({});
    db.listDocuments.mockResolvedValueOnce({ total: 1, documents: [{ score: 8 }] }); // all ratings
    db.updateDocument.mockResolvedValueOnce({});

    const result = await upsertRatingAction(makeFormData({ itemId: 'item-123', score: '8' }));

    expect(db.createDocument).toHaveBeenCalledWith(
      expect.any(String), expect.any(String), expect.any(String),
      expect.objectContaining({ user_id: MOCK_USER.$id, item_id: 'item-123', score: 8 }),
    );
    expect(db.updateDocument).toHaveBeenCalledWith(
      expect.any(String), expect.any(String), 'item-123',
      { avg_rating: 8, rating_count: 1 },
    );
    expect(result).toEqual({ success: true, data: { score: 8 } });
  });

  it('updates existing rating and recalculates item stats', async () => {
    db.listDocuments.mockResolvedValueOnce({
      total: 1, documents: [{ $id: 'rating-doc', score: 6 }],
    });
    db.updateDocument.mockResolvedValueOnce({}); // update rating
    db.listDocuments.mockResolvedValueOnce({
      total: 2, documents: [{ score: 9 }, { score: 7 }],
    });
    db.updateDocument.mockResolvedValueOnce({}); // update item

    const result = await upsertRatingAction(makeFormData({ itemId: 'item-123', score: '9' }));

    expect(db.updateDocument).toHaveBeenNthCalledWith(
      1, expect.any(String), expect.any(String), 'rating-doc', { score: 9 },
    );
    expect(db.updateDocument).toHaveBeenNthCalledWith(
      2, expect.any(String), expect.any(String), 'item-123',
      { avg_rating: 8, rating_count: 2 },
    );
    expect(result).toEqual({ success: true, data: { score: 9 } });
  });

  it('rounds avg_rating to one decimal place', async () => {
    db.listDocuments.mockResolvedValueOnce({ total: 0, documents: [] });
    db.createDocument.mockResolvedValueOnce({});
    db.listDocuments.mockResolvedValueOnce({
      total: 3, documents: [{ score: 7 }, { score: 8 }, { score: 9 }], // avg = 8.0
    });
    db.updateDocument.mockResolvedValueOnce({});

    await upsertRatingAction(makeFormData({ itemId: 'item-123', score: '9' }));

    expect(db.updateDocument).toHaveBeenCalledWith(
      expect.any(String), expect.any(String), 'item-123',
      { avg_rating: 8, rating_count: 3 },
    );
  });

  it('handles decimal averages correctly', async () => {
    db.listDocuments.mockResolvedValueOnce({ total: 0, documents: [] });
    db.createDocument.mockResolvedValueOnce({});
    db.listDocuments.mockResolvedValueOnce({
      total: 2, documents: [{ score: 7 }, { score: 8 }], // avg = 7.5
    });
    db.updateDocument.mockResolvedValueOnce({});

    await upsertRatingAction(makeFormData({ itemId: 'item-123', score: '8' }));

    expect(db.updateDocument).toHaveBeenCalledWith(
      expect.any(String), expect.any(String), 'item-123',
      { avg_rating: 7.5, rating_count: 2 },
    );
  });
});
