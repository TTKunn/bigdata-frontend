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

            <!-- 品牌信息 -->
            <div v-if="product.brand" class="brand-section">
              <el-tag type="success" size="small">{{ product.brand }}</el-tag>
            </div>

            <div class="price-section">
              <span class="price-label">价格：</span>
              <span class="price">¥{{ product.price.toLocaleString() }}</span>
              <!-- 显示成本价（如果存在） -->
              <span v-if="product.cost" class="cost-price">
                (成本: ¥{{ product.cost.toLocaleString() }})
              </span>
            </div>

            <el-divider />

            <div class="info-item">
              <span class="label">库存：</span>
              <span class="stock-value">
                {{ getStockDisplay(product) }}
              </span>
            </div>

            <div class="info-item">
              <span class="label">商品编号：</span>
              <span class="value">{{ product.id }}</span>
            </div>


            <!-- 商品标签 -->
            <div v-if="product.tags && product.tags.length > 0" class="info-item">
              <span class="label">标签：</span>
              <div class="tags-container">
                <el-tag
                  v-for="tag in product.tags"
                  :key="tag"
                  type="info"
                  size="small"
                  class="tag-item"
                >
                  {{ tag }}
                </el-tag>
              </div>
            </div>

            <el-divider />

            <div class="description-section">
              <h3 class="section-title">商品描述</h3>
              <p class="description">{{ product.description || '暂无描述' }}</p>
            </div>

            <!-- 商品规格参数 -->
            <div v-if="product.spec && Object.keys(product.spec).length > 0" class="spec-section">
              <el-divider />
              <h3 class="section-title">规格参数</h3>
              <el-descriptions :column="1" size="small" border>
                <el-descriptions-item
                  v-for="(value, key) in product.spec"
                  :key="key"
                  :label="key"
                >
                  {{ value }}
                </el-descriptions-item>
              </el-descriptions>
            </div>

            <el-divider />

            <div class="quantity-section">
              <span class="label">数量：</span>
              <el-input-number
                v-model="quantity"
                :min="1"
                :max="Math.min(product.stock || 0, 99)"
                :disabled="(product.stock || 0) === 0"
              />
            </div>

            <div class="action-buttons">
              <el-button
                type="primary"
                size="large"
                :icon="ShoppingCartIcon"
                @click="handleAddToCart"
                :disabled="(product.stock || 0) === 0"
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
import { productService } from '../services/productService'

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

// 获取库存显示文本
const getStockDisplay = (product) => {
  const stock = product.stock || 0
  if (stock > 0) {
    return `${stock} 件`
  }
  return '已售罄'
}

// 获取状态标签类型
const getStatusTagType = (status) => {
  return productService.getStatusTagType(status || 'ACTIVE')
}

// 获取状态文本
const getStatusText = (status) => {
  return productService.getStatusText(status || 'ACTIVE')
}

const handleAddToCart = async () => {
  if (props.product && (props.product.stock || 0) > 0) {
    // 一次性添加指定数量的商品
    await cartStore.addToCart(props.product, quantity.value)
    // 成功消息由cartStore内部处理
    quantity.value = 1
    // 添加成功后关闭弹窗
    handleClose()
  } else {
    ElMessage.warning('商品库存不足，无法添加到购物车')
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

/* 品牌信息样式 */
.brand-section {
  margin: 8px 0;
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

.cost-price {
  font-size: 14px;
  color: #909399;
  margin-left: 12px;
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

/* 标签容器样式 */
.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  margin: 0;
}

/* 规格参数样式 */
.spec-section {
  margin-top: 16px;
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
