<template>
  <div class="home-container">
    <!-- 数据面板模块 -->
    <div class="dashboard-section">
      <div class="section-header">
        <h2>数据面板</h2>
      </div>

      <el-row :gutter="20" class="stats-row">
        <el-col :xs="24" :sm="12" :md="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <el-icon class="stat-icon orders"><ShoppingCartIcon /></el-icon>
              <div class="stat-info">
                <div class="stat-value">128</div>
                <div class="stat-label">订单总数</div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :xs="24" :sm="12" :md="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <el-icon class="stat-icon products"><BoxIcon /></el-icon>
              <div class="stat-info">
                <div class="stat-value">8</div>
                <div class="stat-label">商品总数</div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :xs="24" :sm="12" :md="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <el-icon class="stat-icon users"><UserIcon /></el-icon>
              <div class="stat-info">
                <div class="stat-value">456</div>
                <div class="stat-label">用户总数</div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :xs="24" :sm="12" :md="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <el-icon class="stat-icon revenue"><MoneyIcon /></el-icon>
              <div class="stat-info">
                <div class="stat-value">¥98.5万</div>
                <div class="stat-label">总销售额</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 商品列表模块 -->
    <div class="products-section">
      <div class="section-header">
        <h2>商品列表</h2>
      </div>

      <el-row :gutter="20">
      <el-col
        v-for="product in products"
        :key="product.id"
        :xs="24"
        :sm="12"
        :md="8"
        :lg="6"
      >
        <el-card class="product-card" shadow="hover">
          <div class="product-image">
            <img :src="product.image" :alt="product.name" />
            <el-tag class="category-tag" type="info" size="small">
              {{ product.category }}
            </el-tag>
          </div>

          <div class="product-info">
            <h3 class="product-name">{{ product.name }}</h3>
            <p class="product-description">{{ product.description }}</p>

            <div class="product-footer">
              <div class="price-section">
                <span class="price">¥{{ product.price.toLocaleString() }}</span>
                <span class="stock">库存: {{ product.stock }}</span>
              </div>

              <el-button
                type="primary"
                :icon="ShoppingCartIcon"
                @click="handleViewDetail(product)"
                :disabled="product.stock === 0"
              >
                {{ product.stock > 0 ? '加入购物车' : '已售罄' }}
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 分页组件 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[8, 16, 24, 32]"
        :total="totalProducts"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    </div>

    <ProductDetailDialog
      v-model="detailDialogVisible"
      :product="selectedProduct"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { ShoppingCart as ShoppingCartIcon, Box as BoxIcon, User as UserIcon, Money as MoneyIcon } from '@element-plus/icons-vue'
import { useCartStore } from '../../stores/cart'
import { products as mockProducts } from '../../mock/products'
import ProductDetailDialog from '../../components/ProductDetailDialog.vue'

const cartStore = useCartStore()
const detailDialogVisible = ref(false)
const selectedProduct = ref(null)

// 分页相关状态
const currentPage = ref(1)
const pageSize = ref(8)
const totalProducts = ref(mockProducts.length)

// 计算当前页显示的商品
const products = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return mockProducts.slice(start, end)
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

const handleAddToCart = (product) => {
  if (product.stock > 0) {
    cartStore.addToCart(product)
    ElMessage.success(`${product.name} 已加入购物车`)
  }
}

const handleViewDetail = (product) => {
  selectedProduct.value = product
  detailDialogVisible.value = true
}
</script>

<style scoped>
.home-container {
  max-width: 1400px;
  margin: 0 auto;
}

/* 模块容器样式 */
.dashboard-section,
.products-section {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.section-header {
  margin-bottom: 20px;
}

.section-header h2 {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0;
  padding-bottom: 12px;
  border-bottom: 2px solid #e8e8e8;
}

.product-card {
  margin-bottom: 20px;
  transition: all 0.3s;
}

.product-card:hover {
  transform: translateY(-4px);
}

.product-image {
  position: relative;
  width: 100%;
  padding-top: 100%;
  overflow: hidden;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.product-image img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.category-tag {
  position: absolute;
  top: 12px;
  right: 12px;
}

.product-info {
  padding: 16px 0 0;
}

.product-name {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-description {
  font-size: 14px;
  color: #606266;
  margin-bottom: 16px;
  height: 40px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.product-footer {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.price-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price {
  font-size: 24px;
  font-weight: 700;
  color: #f56c6c;
}

.stock {
  font-size: 14px;
  color: #909399;
}

.el-button {
  width: 100%;
}

/* 数据面板样式 */
.stats-row {
  margin: 0;
}

.stat-card {
  margin-bottom: 20px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: #fff;
}

.stat-icon.orders {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.products {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.users {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon.revenue {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
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
