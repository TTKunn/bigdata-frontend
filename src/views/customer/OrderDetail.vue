<template>
  <div class="order-detail-container">
    <div class="page-header">
      <el-button :icon="ArrowLeftIcon" @click="goBack">返回</el-button>
      <h2>订单详情</h2>
    </div>

    <el-card class="order-info-card">
      <template #header>
        <div class="card-header">
          <span>订单信息</span>
          <div class="header-actions">
            <el-tag :type="getStatusType(order.status)" size="large">
              {{ order.status }}
            </el-tag>
            <el-button
              v-if="order.status === '已支付'"
              type="success"
              size="small"
              @click="handleConfirmDelivery"
            >
              确认收货
            </el-button>
          </div>
        </div>
      </template>

      <div class="info-section">
        <div class="info-row">
          <div class="info-item">
            <span class="label">订单号：</span>
            <span class="value">{{ order.orderNumber }}</span>
          </div>
          <div class="info-item">
            <span class="label">下单时间：</span>
            <span class="value">{{ order.createTime }}</span>
          </div>
          <div class="info-item">
            <span class="label">支付时间：</span>
            <span class="value">{{ order.payTime || '-' }}</span>
          </div>
        </div>
      </div>
    </el-card>

    <el-card class="items-card">
      <template #header>
        <div class="card-header">
          <span>商品清单</span>
        </div>
      </template>

      <el-table :data="order.items" style="width: 100%">
        <el-table-column label="商品信息" min-width="300">
          <template #default="{ row }">
            <div class="product-info">
              <img :src="row.image" :alt="row.name" class="product-image" />
              <span class="product-name">{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="单价" width="150" align="right">
          <template #default="{ row }">
            <span class="price">¥{{ row.price.toLocaleString() }}</span>
          </template>
        </el-table-column>

        <el-table-column label="数量" width="120" align="center">
          <template #default="{ row }">
            <span>{{ row.quantity }}</span>
          </template>
        </el-table-column>

        <el-table-column label="小计" width="150" align="right">
          <template #default="{ row }">
            <span class="subtotal">¥{{ (row.price * row.quantity).toLocaleString() }}</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card class="summary-card">
      <div class="summary-content">
        <div class="summary-row">
          <span class="label">商品总数：</span>
          <span class="value">{{ getTotalQuantity() }} 件</span>
        </div>
        <div class="summary-row">
          <span class="label">运费：</span>
          <span class="value">¥0.00</span>
        </div>
        <el-divider />
        <div class="summary-row total">
          <span class="label">订单总额：</span>
          <span class="value">¥{{ order.totalAmount.toLocaleString() }}</span>
        </div>
      </div>
    </el-card>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft as ArrowLeftIcon } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

// 模拟订单数据（实际应从后端获取）
const order = ref({
  id: 1,
  orderNumber: 'ORD' + Date.now(),
  createTime: new Date().toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }),
  payTime: new Date().toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }),
  status: '已支付',
  totalAmount: 9798,
  items: [
    {
      id: 1,
      name: 'iPhone 15 Pro',
      price: 7999,
      quantity: 1,
      image: 'https://via.placeholder.com/80x80?text=iPhone+15+Pro'
    },
    {
      id: 2,
      name: 'AirPods Pro',
      price: 1899,
      quantity: 1,
      image: 'https://via.placeholder.com/80x80?text=AirPods+Pro'
    }
  ]
})

const goBack = () => {
  router.push('/customer/orders')
}

const getStatusType = (status) => {
  const statusMap = {
    '未支付': 'warning',
    '已支付': 'primary',
    '已完成': 'success',
    '已取消': 'danger'
  }
  return statusMap[status] || 'info'
}

const getTotalQuantity = () => {
  return order.value.items.reduce((sum, item) => sum + item.quantity, 0)
}


const handleConfirmDelivery = () => {
  ElMessageBox.confirm(
    '确认已收到商品？',
    '确认收货',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--success',
    }
  )
    .then(() => {
      ElMessage.success('确认收货成功！')
      order.value.status = '已完成'
    })
    .catch(() => {
      ElMessage.info('已取消确认收货')
    })
}

onMounted(() => {
  // 实际应根据路由参数从后端获取订单详情
  const orderId = route.params.id
  console.log('订单ID:', orderId)
})
</script>

<style scoped>
.order-detail-container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.page-header h2 {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.order-info-card,
.items-card,
.summary-card {
  margin-bottom: 20px;
}

.info-section {
  padding: 20px 0;
}

.info-row {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 32px;
  font-size: 15px;
}

.info-item {
  display: flex;
  align-items: center;
}

.info-item .label {
  min-width: 80px;
  color: #606266;
  font-weight: 500;
}


.info-row .value {
  color: #303133;
}

.product-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.product-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  background-color: #f5f5f5;
}

.product-name {
  font-size: 15px;
  font-weight: 500;
  color: #303133;
}

.price {
  font-size: 15px;
  color: #f56c6c;
}

.subtotal {
  font-size: 16px;
  font-weight: 600;
  color: #f56c6c;
}

.summary-content {
  padding: 20px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  font-size: 15px;
}

.summary-row:last-child {
  margin-bottom: 0;
}

.summary-row .label {
  color: #606266;
}

.summary-row .value {
  color: #303133;
  font-weight: 500;
}

.summary-row.total {
  margin-top: 16px;
  font-size: 18px;
}

.summary-row.total .value {
  font-size: 24px;
  font-weight: 700;
  color: #f56c6c;
}

</style>
