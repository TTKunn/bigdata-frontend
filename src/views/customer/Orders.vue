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

        <div class="order-items compact">
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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()

// 模拟的订单数据源（将来会从后端获取）
const mockOrders = [
  {
    id: 1,
    orderNumber: 'ORD202601060001',
    createTime: '2026-01-06 14:30:25',
    status: '未支付',
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
  },
  {
    id: 2,
    orderNumber: 'ORD202601050015',
    createTime: '2026-01-05 10:15:42',
    status: '已支付',
    totalAmount: 16798,
    items: [
      {
        id: 3,
        name: 'MacBook Pro 14',
        price: 15999,
        quantity: 1,
        image: 'https://via.placeholder.com/80x80?text=MacBook+Pro+14'
      },
      {
        id: 4,
        name: 'Magic Mouse',
        price: 599,
        quantity: 1,
        image: 'https://via.placeholder.com/80x80?text=Magic+Mouse'
      }
    ]
  },
  {
    id: 3,
    orderNumber: 'ORD202601040032',
    createTime: '2026-01-04 16:45:18',
    status: '已完成',
    totalAmount: 7998,
    items: [
      {
        id: 5,
        name: 'iPad Air',
        price: 4799,
        quantity: 1,
        image: 'https://via.placeholder.com/80x80?text=iPad+Air'
      },
      {
        id: 6,
        name: 'Apple Watch Series 9',
        price: 3199,
        quantity: 1,
        image: 'https://via.placeholder.com/80x80?text=Apple+Watch+S9'
      }
    ]
  }
]

// 分页相关状态
const currentPage = ref(1)
const pageSize = ref(10)
const totalOrders = ref(mockOrders.length)

// 计算当前页显示的订单
const orders = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return mockOrders.slice(start, end)
})

// 分页事件处理
const handleSizeChange = (newSize) => {
  pageSize.value = newSize
  currentPage.value = 1
}

const handleCurrentChange = (newPage) => {
  currentPage.value = newPage
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

const handlePay = (order) => {
  ElMessage.info('跳转到支付页面...')
}


const handleViewDetail = (order) => {
  // 跳转到订单详情页
  router.push(`/customer/orders/${order.id}`)
}

const handleCancel = (order) => {
  ElMessage.info(`已取消订单: ${order.orderNumber}`)
  order.status = '已取消'
}

const getOrderCount = (order) => {
  return order.items.reduce((sum, it) => sum + it.quantity, 0)
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

/* 分页样式 */
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e8e8e8;
}
</style>
