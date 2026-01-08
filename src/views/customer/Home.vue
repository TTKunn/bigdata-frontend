<template>
  <div class="home-container">
    <!-- 数据面板模块 -->
    <div class="dashboard-section">
      <div class="section-header">
        <h2>数据面板</h2>
      </div>

      <el-row :gutter="20" class="stats-row">
        <el-col :xs="24" :sm="12" :md="6">
          <el-card class="stat-card" v-loading="statsLoading">
            <div class="stat-content">
              <el-icon class="stat-icon revenue"><MoneyIcon /></el-icon>
              <div class="stat-info">
                <div class="stat-value">{{ formattedTotalSales }}</div>
                <div class="stat-label">总销售额</div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :xs="24" :sm="12" :md="6">
          <el-card class="stat-card" v-loading="statsLoading">
            <div class="stat-content">
              <el-icon class="stat-icon daily-revenue"><MoneyIcon /></el-icon>
              <div class="stat-info">
                <div class="stat-value">{{ formattedDailySales }}</div>
                <div class="stat-label">当日销售额</div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :xs="24" :sm="12" :md="6">
          <el-card class="stat-card" v-loading="statsLoading">
            <div class="stat-content">
              <el-icon class="stat-icon orders"><ShoppingCartIcon /></el-icon>
              <div class="stat-info">
                <div class="stat-value">{{ dailyOrderCount }}</div>
                <div class="stat-label">当日订单数量</div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :xs="24" :sm="12" :md="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <el-icon class="stat-icon users"><UserIcon /></el-icon>
              <div class="stat-info">
                <div class="stat-value">1</div>
                <div class="stat-label">用户量</div>
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

      <!-- 加载状态 -->
      <div v-if="isLoading" class="loading-container">
        <el-skeleton
          :loading="isLoading"
          animated
          :count="8"
          :rows="4"
          :throttle="500"
        />
      </div>

      <!-- 错误状态 -->
      <div v-else-if="hasError" class="error-container">
        <el-alert
          title="获取商品列表失败"
          :description="error"
          type="error"
          show-icon
          :closable="false"
        />
        <div class="error-actions">
          <el-button type="primary" @click="refreshProducts">
            重新加载
          </el-button>
        </div>
      </div>

      <!-- 商品列表 -->
      <div v-else>
        <el-row :gutter="20" v-if="products.length > 0">
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
                <!-- 品牌标签 -->
                <el-tag
                  v-if="product.brand"
                  class="brand-tag"
                  type="success"
                  size="small"
                >
                  {{ product.brand }}
            </el-tag>
          </div>

          <div class="product-info">
            <h3 class="product-name">{{ product.name }}</h3>
                <p class="product-description">{{ product.description || '暂无描述' }}</p>

            <div class="product-footer">
              <div class="price-section">
                <span class="price">¥{{ product.price.toLocaleString() }}</span>
              </div>

              <el-button
                type="primary"
                :icon="ShoppingCartIcon"
                @click="handleViewDetail(product)"
              >
                    查看详情
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

        <!-- 空状态 -->
        <div v-else class="empty-container">
          <el-empty description="暂无商品数据">
            <el-button type="primary" @click="refreshProducts">
              重新加载
            </el-button>
          </el-empty>
        </div>
      </div>

    <!-- 分页组件 -->
    <div class="pagination-container" v-if="!isLoading && !hasError && totalProducts > 0">
      <el-pagination
        :current-page="currentPage"
        :page-size="pageSize"
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { ShoppingCart as ShoppingCartIcon, Box as BoxIcon, User as UserIcon, Money as MoneyIcon } from '@element-plus/icons-vue'
import { useCartStore } from '../../stores/cart'
import { useProductStore } from '../../stores/product'
import { statisticsService } from '../../services/statisticsService'
import ProductDetailDialog from '../../components/ProductDetailDialog.vue'

const cartStore = useCartStore()
const productStore = useProductStore()
const detailDialogVisible = ref(false)
const selectedProduct = ref(null)

// 销售统计数据
const statsLoading = ref(false)
const totalSales = ref(0)
const dailySales = ref(0)
const dailyOrderCount = ref(0)

// 使用store中的数据
const products = computed(() => productStore.products)
const totalProducts = computed(() => productStore.totalProducts)
const currentPage = computed(() => productStore.currentPage)
const pageSize = computed(() => productStore.pageSize)
const isLoading = computed(() => productStore.isLoading)
const hasError = computed(() => productStore.hasError)
const error = computed(() => productStore.error)

// 格式化总销售额显示
const formattedTotalSales = computed(() => {
  return statisticsService.formatAmount(totalSales.value)
})

// 格式化当日销售额显示
const formattedDailySales = computed(() => {
  return statisticsService.formatAmount(dailySales.value)
})

// 获取销售统计数据
const fetchStatistics = async () => {
  statsLoading.value = true
  try {
    // 并行获取三个统计数据
    const [totalSalesData, dailySalesData, dailyOrdersData] = await Promise.all([
      statisticsService.getTotalSales(),
      statisticsService.getDailySales(),
      statisticsService.getDailyOrders()
    ])

    totalSales.value = totalSalesData.totalSales
    dailySales.value = dailySalesData.dailySales
    dailyOrderCount.value = dailyOrdersData.orderCount

    console.log('销售统计数据获取成功:', {
      totalSales: totalSales.value,
      dailySales: dailySales.value,
      dailyOrderCount: dailyOrderCount.value
    })
  } catch (error) {
    console.error('获取销售统计数据失败:', error)
    // 不显示错误提示，使用默认值0
  } finally {
    statsLoading.value = false
  }
}

// 处理SSE数据更新
const handleSSEUpdate = (updateEvent) => {
  console.log('首页收到SSE更新事件:', updateEvent)

  // 根据事件类型更新对应的数据
  switch (updateEvent.eventType) {
    case 'total_sales':
      if (updateEvent.data.totalSales !== undefined) {
        totalSales.value = updateEvent.data.totalSales
      }
      break
    case 'daily_sales':
      if (updateEvent.data.dailySales !== undefined) {
        dailySales.value = updateEvent.data.dailySales
      }
      if (updateEvent.data.orderCount !== undefined) {
        dailyOrderCount.value = updateEvent.data.orderCount
      }
      break
  }
}

// 组件挂载时获取数据
onMounted(async () => {
  try {
    // 并行获取商品数据和统计数据
    await Promise.all([
      productStore.fetchProducts(1, 8),
      fetchStatistics()
    ])

    // 建立SSE连接
    statisticsService.connectSSE(
      handleSSEUpdate,
      (error) => {
        console.error('首页SSE连接错误:', error)
      }
    )
  } catch (error) {
    ElMessage.error('获取数据失败，请稍后重试')
  }
})

// 分页事件处理
const handleSizeChange = async (newSize) => {
  try {
    await productStore.changePageSize(newSize)
  } catch (error) {
    ElMessage.error('切换页面大小失败')
  }
}

const handleCurrentChange = async (newPage) => {
  try {
    await productStore.goToPage(newPage)
  // 滚动到页面顶部
  window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (error) {
    ElMessage.error('切换页面失败')
  }
}

const handleAddToCart = async (product) => {
  try {
    // 异步添加到购物车，后端同步由cartStore内部处理
    await cartStore.addToCart(product)
    // 成功消息由cartStore内部处理
  } catch (error) {
    // 错误消息由cartStore内部处理
    console.error('添加到购物车失败:', error)
  }
}

const handleViewDetail = async (product) => {
  try {
    // 获取完整的商品详情
    const productDetail = await productStore.fetchProductDetail(product.id)
    selectedProduct.value = productDetail
  detailDialogVisible.value = true
  } catch (error) {
    ElMessage.error('获取商品详情失败')
  }
}

// 刷新商品列表
const refreshProducts = async () => {
  try {
    await productStore.refreshProducts()
  } catch (error) {
    ElMessage.error('刷新商品列表失败')
  }
}

// 组件卸载时清理SSE连接
onUnmounted(() => {
  statisticsService.disconnectSSE()
})
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
  color: #909399;
  margin-bottom: 12px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.4;
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

.stat-icon.daily-revenue {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
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

/* 加载状态样式 */
.loading-container {
  padding: 40px 0;
}

/* 错误状态样式 */
.error-container {
  padding: 40px 20px;
  text-align: center;
}

.error-actions {
  margin-top: 16px;
}

/* 空状态样式 */
.empty-container {
  padding: 60px 20px;
  text-align: center;
}

/* 品牌标签样式 */
.brand-tag {
  position: absolute;
  top: 12px;
  left: 12px;
}
</style>
