<template>
  <section>
    <div class="page-header">
      <div class="page-header-left">
        <RouterLink to="/purchase-orders" class="back-btn" title="Back to Purchase Orders">&#8592;</RouterLink>
        <div>
          <h2>Purchase Order Detail</h2>
          <p class="muted">{{ purchaseOrder?.poNumber || '-' }}</p>
        </div>
      </div>
    </div>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

    <div v-if="purchaseOrder" class="card-panel">
      <div class="form-row">
        <div class="form-group">
          <label>PO Number</label>
          <div>{{ purchaseOrder.poNumber }}</div>
        </div>
        <div class="form-group">
          <label>Vendor</label>
          <div>{{ purchaseOrder.vendorName }}</div>
        </div>
        <div class="form-group">
          <label>Status</label>
          <div>
            <span class="status-badge" :class="purchaseOrder.status.toLowerCase()">
              {{ purchaseOrder.status }}
            </span>
          </div>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Line</th>
            <th>Item</th>
            <th>Qty Ordered</th>
            <th>Qty Received</th>
            <th>UOM</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="line in purchaseOrder.lines || []" :key="line.id">
            <td>{{ line.lineNo }}</td>
            <td>{{ line.itemCode }} - {{ line.itemName }}</td>
            <td>{{ line.qtyOrdered }}</td>
            <td>{{ line.qtyReceived }}</td>
            <td>{{ line.uom }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { api } from '../api';

const route = useRoute();
const purchaseOrder = ref(null);
const errorMessage = ref('');

onMounted(async () => {
  try {
    purchaseOrder.value = await api.getPurchaseOrder(route.params.id);
  } catch (error) {
    errorMessage.value = error.message;
  }
});
</script>
