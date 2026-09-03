<template>
  <section>
    <div class="page-header">
      <div class="page-header-left">
        <RouterLink to="/" class="back-btn" title="Back to Dashboard">&#8592;</RouterLink>
        <div>
          <h2>Bookmarks</h2>
          <p class="muted">Saved PR, PO, and GR items</p>
        </div>
      </div>
    </div>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

    <div class="card-panel" v-if="items.length === 0">
      <p class="muted">No bookmarks</p>
    </div>

    <div class="card-panel" v-else>
      <table>
        <thead>
          <tr>
            <th>Type</th>
            <th>Reference</th>
            <th>Details</th>
            <th>Bookmarked At</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in items" :key="item.id">
            <td>{{ item.itemType }}</td>
            <td>
              <RouterLink v-if="detailPath(item)" :to="detailPath(item)">
                {{ getReference(item) }}
              </RouterLink>
              <span v-else>{{ getReference(item) }}</span>
            </td>
            <td>{{ getDetails(item) }}</td>
            <td>{{ item.createdAt ? new Date(item.createdAt).toLocaleString() : '-' }}</td>
            <td>
              <button type="button" class="bookmark-btn" @click="removeBookmark(item)">
                ★
              </button>
            </td>
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

function detailPath(item) {
  if (item.itemType === 'PR') {
    return `/requisitions/${item.itemId}`;
  }
  if (item.itemType === 'PO') {
    return `/purchase-orders/${item.itemId}`;
  }
  return '';
}

function getReference(item) {
  return item.prNumber || item.poNumber || item.grNumber || item.itemId;
}

function getDetails(item) {
  if (item.itemType === 'PR') {
    return item.prTitle || '-';
  }
  if (item.itemType === 'PO') {
    return item.poNumber || '-';
  }
  return item.grNumber || '-';
}

async function loadBookmarks() {
  const payload = await api.getBookmarks();
  items.value = payload.items || [];
}

async function removeBookmark(item) {
  try {
    await api.toggleBookmark(item.itemType, item.itemId);
    items.value = items.value.filter((bookmarked) => bookmarked.id !== item.id);
  } catch (error) {
    errorMessage.value = error.message;
  }
}

onMounted(async () => {
  try {
    await loadBookmarks();
  } catch (error) {
    errorMessage.value = error.message;
  }
});
</script>
