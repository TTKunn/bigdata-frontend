<template>
  <div class="cart-container">
    <div class="page-header">
      <h2>购物车</h2>
    </div>

    <el-card v-if="cartStore.items.length === 0" class="empty-cart">
      <el-empty description="购物车是空的">
        <el-button type="primary" @click="goToHome">去购物</el-button>
      </el-empty>
    </el-card>

    <div v-else class="cart-content">
      <el-card class="cart-items">
        <el-table ref="tableRef" :data="cartStore.items" style="width: 100%" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55" :selectable="() => true" />

          <el-table-column label="商品信息" min-width="300">
            <template #default="{ row }">
              <div class="product-info">
                <img :src="row.image" :alt="row.name" class="product-image" />
                <span class="product-name">{{ row.name }}</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="单价" width="150">
            <template #default="{ row }">
              <span class="price">¥{{ row.price.toLocaleString() }}</span>
            </template>
          </el-table-column>

          <el-table-column label="数量" width="180">
            <template #default="{ row }">
              <el-input-number
                v-model="row.quantity"
                :min="1"
                :max="99"
                @change="handleQuantityChange(row.id, row.quantity)"
              />
            </template>
          </el-table-column>

          <el-table-column label="小计" width="150">
            <template #default="{ row }">
              <span class="subtotal">¥{{ (row.price * row.quantity).toLocaleString() }}</span>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="120">
            <template #default="{ row }">
              <el-button
                type="danger"
                :icon="DeleteIcon"
                link
                @click="handleRemove(row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <el-card class="cart-summary">
        <div class="summary-content">
          <div class="summary-left">
            <el-button type="text" @click="goToHome">继续购物</el-button>
            <el-button type="text" @click="handleClearCart" class="clear-btn">清空购物车</el-button>
            <span class="selected-count">已选中 {{ cartStore.totalCount }} 件</span>
          </div>

          <div class="summary-right">
            <div class="total-label">合计： <span class="value total-price">¥{{ cartStore.totalPrice.toLocaleString() }}</span></div>
            <el-button
              type="primary"
              size="large"
              class="checkout-btn"
              :disabled="!cartStore.hasSelected"
              @click="handleCheckout"
            >
              去结算
            </el-button>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 支付弹窗 -->
    <PaymentDialog
      v-model="showPaymentDialog"
      :items="cartStore.selectedItems"
      :item-count="cartStore.totalCount"
      :total-amount="cartStore.totalPrice"
      @payment-success="handlePaymentSuccess"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete as DeleteIcon } from '@element-plus/icons-vue'
import { useCartStore } from '../../stores/cart'
import PaymentDialog from '../../components/PaymentDialog.vue'

const router = useRouter()
const cartStore = useCartStore()
const tableRef = ref(null)
const isSyncing = ref(false)  // 标志位，防止循环触发
const showPaymentDialog = ref(false)

const goToHome = () => {
  router.push('/customer/home')
}

// 同步表格选中状态（从 Store 同步到表格）
const syncTableSelection = () => {
  if (!tableRef.value || isSyncing.value) return

  isSyncing.value = true
  nextTick(() => {
    // 先清空表格选中状态
    tableRef.value.clearSelection()
    // 根据 Store 中的 selected 状态重新设置
    cartStore.items.forEach(item => {
      if (item.selected) {
        tableRef.value.toggleRowSelection(item, true)
      }
    })
    isSyncing.value = false
  })
}

// 初始化表格选中状态
onMounted(() => {
  syncTableSelection()
})

// 监听购物车商品变化，同步选中状态
watch(
  () => cartStore.items.map(item => ({ id: item.id, selected: item.selected })),
  () => {
    if (!isSyncing.value) {
      syncTableSelection()
    }
  },
  { deep: true }
)

// 处理表格选中状态变化（从表格同步到 Store）
const handleSelectionChange = (selectedRows) => {
  if (isSyncing.value) return

  const selectedIds = new Set(selectedRows.map(row => row.id))

  // 更新每个商品的选中状态
  cartStore.items.forEach(item => {
    const shouldBeSelected = selectedIds.has(item.id)
    if (item.selected !== shouldBeSelected) {
      cartStore.toggleItemSelection(item.id)
    }
  })
}

const handleQuantityChange = (productId, quantity) => {
  cartStore.updateQuantity(productId, quantity)
}

const handleRemove = (item) => {
  ElMessageBox.confirm(
    `确定要从购物车中删除 ${item.name} 吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    cartStore.removeFromCart(item.id)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handleClearCart = () => {
  ElMessageBox.confirm(
    '确定要清空购物车吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    cartStore.clearCart()
    ElMessage.success('购物车已清空')
  }).catch(() => {})
}

const handleCheckout = () => {
  // 检查是否有选中的商品
  if (!cartStore.hasSelected) {
    ElMessage.warning('请至少选择一件商品')
    return
  }

  // 打开支付弹窗
  showPaymentDialog.value = true
}

const handlePaymentSuccess = () => {
  // 支付成功后，清空选中的商品
  cartStore.clearSelected()

  // 生成订单ID（实际应由后端生成）
  const orderId = Date.now()

  ElMessage.success('订单支付成功！')

  // 跳转到订单详情页
  router.push(`/customer/orders/${orderId}`)
}
</script>

<style scoped>
.cart-container {
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

.empty-cart {
  padding: 60px 0;
}

.cart-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: stretch;
}

.cart-items {
  width: 100%;
}

.product-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.product-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
  background-color: #f5f5f5;
}

.product-name {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.price {
  font-size: 16px;
  color: #f56c6c;
}

.subtotal {
  font-size: 18px;
  font-weight: 600;
  color: #f56c6c;
}

.cart-container {
  padding-bottom: 120px;
}

.cart-summary {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 40px);
  max-width: 1400px;
  border-radius: 6px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  background: #fff;
}

.summary-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  gap: 16px;
}

.summary-left {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #606266;
}

.selected-count {
  color: #303133;
  font-weight: 500;
}

.summary-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.total-label {
  font-size: 18px;
  color: #606266;
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 16px;
}

.summary-row .label {
  color: #606266;
}

.summary-row .value {
  font-weight: 500;
  color: #303133;
}

.total-price {
  font-size: 22px;
  font-weight: 700;
  color: #f56c6c;
}

.checkout-btn {
  min-width: 140px;
  height: 44px;
}
</style>
