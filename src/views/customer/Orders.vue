<template>
  <div class="orders-container">
    <div class="page-header">
      <h2>我的订单</h2>
    </div>

    <el-card v-if="orders.length === 0" class="empty-orders">
      <el-empty description="暂无订单">
        <el-button type="primary" @click="goToHome">去购物</el-button>
      </el-empty>
    </el-card>

    <div v-else class="orders-list">
      <el-card v-for="order in orders" :key="order.id" class="order-card">
        <div class="order-header">
          <div class="order-info">
            <span class="order-number">订单号：{{ order.orderNumber }}</span>
            <span class="order-date">下单时间：{{ order.createTime }}</span>
          </div>
          <el-tag :type="getStatusType(order.status)">
            {{ order.status }}
          </el-tag>
        </div>

        <el-divider />

        <div class="order-items compact" v-if="order.items && order.items.length > 0">
          <div class="order-item">
            <img :src="order.items[0].image" :alt="order.items[0].name" class="item-image" />
            <div class="item-info">
              <div class="item-name">{{ order.items[0].name }}</div>
              <div class="item-price">¥{{ order.items[0].price.toLocaleString() }}  × {{ order.items[0].quantity }}</div>
            </div>
            <div class="more-items" v-if="order.items.length > 1">
              等 {{ order.items.length - 1 }} 件商品
            </div>
          </div>
        </div>
        <div class="order-items-summary" v-else>
          <span class="items-count">共 {{ order.itemCount || 0 }} 件商品</span>
        </div>

        <el-divider />

        <div class="order-footer new-style">
          <div class="left">
            共 {{ getOrderCount(order) }} 件商品，合计： <span class="amount">¥{{ order.totalAmount.toLocaleString() }}</span>
          </div>
          <div class="right">
            <el-button
              v-if="order.status === '未支付'"
              type="danger"
              plain
              @click="handlePay(order)"
            >
              立即支付
            </el-button>
            <el-button
              v-if="order.status === '未支付'"
              plain
              @click="handleCancel(order)"
            >
              取消订单
            </el-button>
            <el-button
              plain
              @click="handleViewDetail(order)"
            >
              查看详情
            </el-button>
          </div>
        </div>
      </el-card>

      <!-- 分页组件 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[5, 10, 20, 50]"
          :total="totalOrders"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useOrderStore } from '../../stores/order'

const router = useRouter()
const orderStore = useOrderStore()

// 分页相关状态
const currentPage = ref(1)
const pageSize = ref(10)

// 从 store 获取订单列表和总数
const orders = computed(() => orderStore.orders)
const totalOrders = computed(() => orderStore.totalOrders)

// 页面加载时获取订单列表
onMounted(async () => {
  await fetchOrders()
})

// 获取订单列表
const fetchOrders = async () => {
  try {
    await orderStore.fetchOrders({
      page: currentPage.value,
      size: pageSize.value
    })
  } catch (error) {
    console.error('获取订单列表失败:', error)
  }
}

// 分页事件处理
const handleSizeChange = async (newSize) => {
  pageSize.value = newSize
  currentPage.value = 1
  await fetchOrders()
}

const handleCurrentChange = async (newPage) => {
  currentPage.value = newPage
  await fetchOrders()
  // 滚动到页面顶部
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const goToHome = () => {
  router.push('/customer/home')
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

const handlePay = async (order) => {
  try {
    await ElMessageBox.confirm(
      `确定要支付订单 ${order.orderNumber} 吗？`,
      '确认支付',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }
    )

    // 调用支付API
    await orderStore.payOrder(order.id)

    // 刷新订单列表
    await fetchOrders()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('支付订单失败:', error)
    }
  }
}

const handleViewDetail = (order) => {
  // 跳转到订单详情页
  router.push(`/customer/orders/${order.id}`)
}

const handleCancel = async (order) => {
  try {
    await ElMessageBox.confirm(
      `确定要取消订单 ${order.orderNumber} 吗？`,
      '取消订单',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // 调用取消订单API
    await orderStore.cancelOrder(order.id)

    // 刷新订单列表
    await fetchOrders()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消订单失败:', error)
    }
  }
}

const getOrderCount = (order) => {
  if (order.items && order.items.length > 0) {
    return order.items.reduce((sum, it) => sum + it.quantity, 0)
  }
  return order.itemCount || 0
}
</script>

<style scoped>
.orders-container {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h2 {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
}

.empty-orders {
  padding: 60px 0;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.order-card {
  transition: all 0.12s;
  padding: 8px;
  border-radius: 6px;
}

.order-card:hover {
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 4px;
  padding: 3px 0;
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.order-number {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.order-date {
  font-size: 13px;
  color: #909399;
}

.order-items {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 4px 0;
}

.order-item {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 4px;
  background: #fcfcfc;
  border-radius: 6px;
  margin: 0;
}

.item-image {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
  background-color: #f5f5f5;
}

.item-info {
  flex: 1;
  min-width: 0;
  padding: 0;
}

.item-name {
  font-size: 13px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 1px;
  line-height: 1.15;
}

.item-price {
  font-size: 12px;
  color: #909399;
  margin-top: 0;
}

.more-items {
  color: #909399;
  font-size: 12px;
  margin-left: 6px;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}

.left {
  color: #606266;
  font-size: 12px;
}

.left .amount {
  font-weight: 700;
  color: #f56c6c;
  margin-left: 4px;
  font-size: 15px;
}

/* Reduce spacing of dividers inside order cards */
.order-card .el-divider {
  margin: 4px 0;
}

.order-actions {
  display: flex;
  gap: 8px;
}

/* 订单商品摘要样式 */
.order-items-summary {
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  text-align: center;
}

.items-count {
  color: #606266;
  font-size: 14px;
}

/* 分页样式 */
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e8e8e8;
}
</style>
