import { getBookmarks, isBookmarked, toggleBookmark } from '../services/bookmark-service.js';

export default async function bookmarkRoutes(fastify) {
  fastify.post('/api/bookmarks/toggle', async (request, reply) => {
    try {
      const { itemType, itemId } = request.body || {};
      const data = await toggleBookmark(fastify.db, itemType, itemId);
      return { success: true, data };
    } catch (error) {
      if (error.statusCode) {
        reply.code(error.statusCode);
        return { message: error.message };
      }

      throw error;
    }
  });

  fastify.get('/api/bookmarks', async () => {
    const items = await getBookmarks(fastify.db);
    return { success: true, items };
  });

  fastify.get('/api/bookmarks/check/:itemType/:itemId', async (request, reply) => {
    try {
      const bookmarked = await isBookmarked(
        fastify.db,
        request.params.itemType,
        request.params.itemId
      );
      return { success: true, data: { isBookmarked: bookmarked } };
    } catch (error) {
      if (error.statusCode) {
        reply.code(error.statusCode);
        return { message: error.message };
      }

      throw error;
    }
  });
}
