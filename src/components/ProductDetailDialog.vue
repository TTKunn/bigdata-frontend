<template>
  <el-dialog
    v-model="dialogVisible"
    width="900px"
    :before-close="handleClose"
    destroy-on-close
  >
    <div v-if="product" class="product-detail">
      <el-row :gutter="24">
        <el-col :xs="24" :md="12">
          <div class="product-image-section">
            <img :src="product.image" :alt="product.name" class="main-image" />
          </div>
        </el-col>

        <el-col :xs="24" :md="12">
          <div class="product-info-section">
            <h2 class="product-title">{{ product.name }}</h2>

            <div class="price-section">
              <span class="price-label">价格：</span>
              <span class="price">¥{{ product.price.toLocaleString() }}</span>
            </div>

            <el-divider />

            <div class="info-item">
              <span class="label">库存：</span>
              <span class="stock-value">
                {{ product.stock > 0 ? `${product.stock} 件` : '已售罄' }}
              </span>
            </div>

            <div class="info-item">
              <span class="label">商品编号：</span>
              <span class="value">{{ product.id.toString().padStart(8, '0') }}</span>
            </div>

            <el-divider />

            <div class="description-section">
              <h3 class="section-title">商品描述</h3>
              <p class="description">{{ product.description }}</p>
            </div>

            <el-divider />

            <div class="quantity-section">
              <span class="label">数量：</span>
              <el-input-number
                v-model="quantity"
                :min="1"
                :max="Math.min(product.stock, 99)"
                :disabled="product.stock === 0"
              />
            </div>

            <div class="action-buttons">
              <el-button
                type="primary"
                size="large"
                :icon="ShoppingCartIcon"
                @click="handleAddToCart"
                :disabled="product.stock === 0"
                class="add-cart-btn"
              >
                加入购物车
              </el-button>
            </div>
          </div>
        </el-col>
      </el-row>

      <el-divider />

      <div class="product-details-section">
        <h3 class="section-title">详细信息</h3>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="商品分类">{{ product.category }}</el-descriptions-item>
          <el-descriptions-item label="商品编号">{{ product.id.toString().padStart(8, '0') }}</el-descriptions-item>
          <el-descriptions-item label="库存状态">
            <el-tag :type="product.stock > 50 ? 'success' : product.stock > 0 ? 'warning' : 'danger'">
              {{ product.stock > 0 ? '有货' : '缺货' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="销售价格">¥{{ product.price.toLocaleString() }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </div>

    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { ShoppingCart as ShoppingCartIcon } from '@element-plus/icons-vue'
import { useCartStore } from '../stores/cart'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  product: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue'])

const cartStore = useCartStore()
const dialogVisible = ref(props.modelValue)
const quantity = ref(1)

watch(() => props.modelValue, (newVal) => {
  dialogVisible.value = newVal
  if (newVal) {
    quantity.value = 1
  }
})

watch(dialogVisible, (newVal) => {
  emit('update:modelValue', newVal)
})

const handleClose = () => {
  dialogVisible.value = false
}

const handleAddToCart = () => {
  if (props.product && props.product.stock > 0) {
    for (let i = 0; i < quantity.value; i++) {
      cartStore.addToCart(props.product)
    }
    ElMessage.success(`已添加 ${quantity.value} 件 ${props.product.name} 到购物车`)
    quantity.value = 1
    // 添加成功后关闭弹窗
    handleClose()
  }
}
</script>

<style scoped>
.product-detail {
  padding: 12px 0;
}

.product-image-section {
  position: relative;
  width: 100%;
  padding-top: 100%;
  background-color: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
}

.main-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.category-tag {
  position: absolute;
  top: 16px;
  right: 16px;
}

.product-info-section {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.product-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.price-section {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.price-label {
  font-size: 16px;
  color: #606266;
}

.price {
  font-size: 32px;
  font-weight: 700;
  color: #f56c6c;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 16px;
}

.info-item .label {
  color: #606266;
  font-weight: 500;
}

.info-item .value {
  color: #303133;
}

.stock-value {
  font-size: 18px;
  font-weight: 500;
  color: #303133;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 12px 0;
}

.description-section {
  margin: 3px 0;
}

.description {
  font-size: 15px;
  line-height: 1.8;
  color: #606266;
  margin: 0;
}

.quantity-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 12px 0;
}

.quantity-section .label {
  font-size: 16px;
  color: #606266;
  font-weight: 500;
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-top: 10px;
}

.add-cart-btn,
.buy-now-btn {
  flex: 1;
}

.product-details-section {
  margin-top: 24px;
}

@media (max-width: 768px) {
  .product-image-section {
    margin-bottom: 24px;
  }

  .action-buttons {
    flex-direction: column;
  }

  .add-cart-btn,
  .buy-now-btn {
    width: 100%;
  }
}
</style>
