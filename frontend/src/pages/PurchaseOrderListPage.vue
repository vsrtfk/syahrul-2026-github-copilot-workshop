<template>
  <section>
    <div class="page-header">
      <div class="page-header-left">
        <RouterLink to="/" class="back-btn" title="Back to Dashboard">&#8592;</RouterLink>
        <div>
          <h2>Purchase Orders</h2>
          <p class="muted">All purchase order records</p>
        </div>
      </div>
    </div>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

    <div class="card-panel">
      <table>
        <thead>
          <tr>
            <th>Bookmark</th>
            <th>PO Number</th>
            <th>Vendor</th>
            <th>Status</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in items" :key="item.id">
            <td>
              <button type="button" class="bookmark-btn" @click="handleToggle(item.id)">
                {{ bookmarkedIds.has(item.id) ? '★' : '☆' }}
              </button>
            </td>
            <td><RouterLink :to="`/purchase-orders/${item.id}`">{{ item.poNumber }}</RouterLink></td>
            <td>{{ item.vendorName }}</td>
            <td>
              <span class="status-badge" :class="item.status.toLowerCase()">{{ item.status }}</span>
            </td>
            <td>{{ item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { api } from '../api';

const items = ref([]);
const errorMessage = ref('');
const bookmarkedIds = ref(new Set());

async function loadBookmarks() {
  const states = await Promise.all(
    items.value.map(async (item) => {
      const result = await api.isBookmarked('PO', item.id);
      return { id: item.id, isBookmarked: result.data?.isBookmarked };
    })
  );

  bookmarkedIds.value = new Set(states.filter((state) => state.isBookmarked).map((state) => state.id));
}

async function handleToggle(itemId) {
  try {
    const response = await api.toggleBookmark('PO', itemId);
    if (response?.data?.bookmarked) {
      bookmarkedIds.value.add(itemId);
    } else {
      bookmarkedIds.value.delete(itemId);
    }
    bookmarkedIds.value = new Set(bookmarkedIds.value);
  } catch (error) {
    errorMessage.value = error.message;
  }
}

onMounted(async () => {
  try {
    const payload = await api.listPurchaseOrders();
    items.value = payload.items || [];
    await loadBookmarks();
  } catch (error) {
    errorMessage.value = error.message;
  }
});
</script>
