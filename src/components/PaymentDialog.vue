<template>
  <el-dialog
    v-model="dialogVisible"
    title="确认支付"
    width="500px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="!paying"
  >
    <div class="payment-content">
      <!-- 支付前：显示订单信息 -->
      <div v-if="!paying && !paymentSuccess" class="order-summary">
        <!-- 商品列表 -->
        <div class="items-list">
          <div class="items-header">商品清单</div>
          <div class="item-row" v-for="item in items" :key="item.id">
            <img :src="item.image" :alt="item.name" class="item-image" />
            <div class="item-info">
              <div class="item-name">{{ item.name }}</div>
              <div class="item-detail">
                <span class="item-price">¥{{ item.price.toLocaleString() }}</span>
                <span class="item-quantity">× {{ item.quantity }}</span>
              </div>
            </div>
            <div class="item-subtotal">
              ¥{{ (item.price * item.quantity).toLocaleString() }}
            </div>
          </div>
        </div>

        <el-divider />

        <div class="summary-item">
          <span class="label">商品数量：</span>
          <span class="value">{{ itemCount }} 件</span>
        </div>
        <div class="summary-item">
          <span class="label">订单金额：</span>
          <span class="value total">¥{{ totalAmount.toLocaleString() }}</span>
        </div>
        <el-divider />
        <div class="payment-methods">
          <div class="method-title">支付方式</div>
          <el-radio-group v-model="paymentMethod" class="method-group">
            <el-radio label="alipay" border>
              <span class="method-label">支付宝</span>
            </el-radio>
            <el-radio label="wechat" border>
              <span class="method-label">微信支付</span>
            </el-radio>
            <el-radio label="bank" border>
              <span class="method-label">银行卡</span>
            </el-radio>
          </el-radio-group>
        </div>
      </div>

      <!-- 支付中：显示加载动画 -->
      <div v-else-if="paying" class="payment-loading">
        <el-icon class="loading-icon" :size="60">
          <Loading />
        </el-icon>
        <p class="loading-text">支付处理中，请稍候...</p>
        <p class="loading-hint">请勿关闭此窗口</p>
      </div>

      <!-- 支付成功：显示成功提示 -->
      <div v-else-if="paymentSuccess" class="payment-success">
        <el-icon class="success-icon" :size="80">
          <SuccessFilled />
        </el-icon>
        <p class="success-text">支付成功！</p>
        <p class="success-hint">即将跳转到订单详情页...</p>
      </div>
    </div>

    <template #footer>
      <div v-if="!paying && !paymentSuccess" class="dialog-footer">
        <el-button @click="handleCancel" :disabled="paying">取消</el-button>
        <el-button type="primary" @click="handlePayment" :loading="paying">
          确认支付 ¥{{ totalAmount.toLocaleString() }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Loading, SuccessFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useOrderStore } from '../stores/order'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  items: {
    type: Array,
    default: () => []
  },
  itemCount: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    default: 0
  },
  orderId: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'paymentSuccess'])

const orderStore = useOrderStore()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const paymentMethod = ref('alipay')
const paying = ref(false)
const paymentSuccess = ref(false)

// 重置状态
const resetState = () => {
  paying.value = false
  paymentSuccess.value = false
  paymentMethod.value = 'alipay'
}

// 监听弹窗关闭，重置状态
watch(dialogVisible, (newValue) => {
  if (!newValue) {
    setTimeout(resetState, 300) // 延迟重置，避免关闭动画时看到状态变化
  }
})

const handleCancel = () => {
  dialogVisible.value = false
}

const handlePayment = async () => {
  if (!props.orderId) {
    ElMessage.error('订单ID不存在，无法支付')
    return
  }

  paying.value = true

  try {
    // 调用真实的支付API
    await orderStore.payOrder(props.orderId)

    paying.value = false
    paymentSuccess.value = true

    // 显示成功状态1.5秒后触发跳转
    setTimeout(() => {
      dialogVisible.value = false
      emit('paymentSuccess', props.orderId)
    }, 1500)
  } catch (error) {
    console.error('支付失败:', error)
    paying.value = false
    dialogVisible.value = false
  }
}
</script>

<style scoped>
.payment-content {
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* 订单摘要样式 */
.order-summary {
  padding: 20px 0;
}

/* 商品列表样式 */
.items-list {
  margin-bottom: 20px;
}

.items-header {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
}

.item-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  margin-bottom: 12px;
}

.item-row:last-child {
  margin-bottom: 0;
}

.item-image {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
  background-color: #fff;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-detail {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.item-price {
  color: #f56c6c;
  font-weight: 500;
}

.item-quantity {
  color: #909399;
}

.item-subtotal {
  font-size: 15px;
  font-weight: 600;
  color: #f56c6c;
  white-space: nowrap;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  font-size: 16px;
}

.summary-item .label {
  color: #606266;
}

.summary-item .value {
  font-weight: 500;
  color: #303133;
}

.summary-item .value.total {
  font-size: 24px;
  font-weight: 700;
  color: #f56c6c;
}

/* 支付方式样式 */
.payment-methods {
  margin-top: 20px;
}

.method-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 16px;
}

.method-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.method-group :deep(.el-radio) {
  margin-right: 0;
  width: 100%;
}

.method-group :deep(.el-radio.is-bordered) {
  padding: 12px 20px;
  border-radius: 6px;
}

.method-label {
  font-size: 15px;
}

/* 加载动画样式 */
.payment-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.loading-icon {
  color: #409EFF;
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  margin-top: 20px;
  font-size: 18px;
  font-weight: 500;
  color: #303133;
}

.loading-hint {
  margin-top: 8px;
  font-size: 14px;
  color: #909399;
}

/* 支付成功样式 */
.payment-success {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.success-icon {
  color: #67C23A;
  animation: scaleIn 0.5s ease-out;
}

@keyframes scaleIn {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}

.success-text {
  margin-top: 20px;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.success-hint {
  margin-top: 8px;
  font-size: 14px;
  color: #909399;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
