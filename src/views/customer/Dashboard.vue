<template>
  <div class="dashboard-container">
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

    <!-- 畅销商品排行榜 -->
    <div class="ranking-section">
      <div class="section-header">
        <h2>今日畅销商品排行榜 TOP3</h2>
      </div>

      <el-row :gutter="20" v-loading="rankingLoading">
        <el-col :xs="24" :sm="12" :md="8" v-for="(product, index) in topProducts" :key="product.productId">
          <el-card class="product-card ranking-card" shadow="hover">
            <div class="rank-badge">
              <span class="rank-number">{{ index + 1 }}</span>
            </div>
            <div class="product-image">
              <img :src="product.imageUrl || 'http://localhost:8080/api/images/placeholder.png'" :alt="product.productName" />
            </div>
            <div class="product-info">
              <h3 class="product-name">{{ product.productName }}</h3>
              <div class="product-stats">
                <div class="stat-row">
                  <span class="label">销售数量</span>
                  <span class="value sales">{{ product.totalSales }} 件</span>
                </div>
                <div class="stat-row">
                  <span class="label">排名</span>
                  <span class="value rank">第 {{ product.rank }} 名</span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 七天销售数据图表 -->
    <div class="chart-section">
      <div class="section-header">
        <h2>七天销售数据</h2>
      </div>
      <el-card>
        <div ref="salesChartRef" class="chart-container"></div>
      </el-card>
    </div>

    <!-- 七天订单数统计图表 -->
    <div class="chart-section">
      <div class="section-header">
        <h2>七天订单数统计</h2>
      </div>
      <el-card>
        <div ref="ordersChartRef" class="chart-container"></div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ShoppingCart as ShoppingCartIcon, User as UserIcon, Money as MoneyIcon } from '@element-plus/icons-vue'
import { statisticsService } from '../../services/statisticsService'
import * as echarts from 'echarts'

// 销售统计数据
const statsLoading = ref(false)
const totalSales = ref(0)
const dailySales = ref(0)
const dailyOrderCount = ref(0)

// 畅销商品排行榜数据
const rankingLoading = ref(false)
const topProducts = ref([])

// 图表引用
const salesChartRef = ref(null)
const ordersChartRef = ref(null)
let salesChartInstance = null
let ordersChartInstance = null

// 格式化总销售额显示
const formattedTotalSales = computed(() => {
  return statisticsService.formatAmount(totalSales.value)
})

// 格式化当日销售额显示
const formattedDailySales = computed(() => {
  return statisticsService.formatAmount(dailySales.value)
})

// 格式化金额显示（用于排行榜）
const formatAmount = (amount) => {
  return statisticsService.formatAmount(amount)
}

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
  } finally {
    statsLoading.value = false
  }
}

// 获取畅销商品排行榜
const fetchTopProducts = async () => {
  rankingLoading.value = true
  try {
    const data = await statisticsService.getTopProducts(3)
    topProducts.value = data.products || []
    console.log('畅销商品排行榜获取成功:', topProducts.value)
  } catch (error) {
    console.error('获取畅销商品排行榜失败:', error)
  } finally {
    rankingLoading.value = false
  }
}

// 初始化销售额图表
const initSalesChart = async () => {
  if (!salesChartRef.value) return

  try {
    // 获取七天销售数据
    const sevenDaysData = await statisticsService.getSevenDaysSales()

    // 初始化echarts实例
    salesChartInstance = echarts.init(salesChartRef.value)

    // 处理数据
    const dates = sevenDaysData.dailySales.map(item => {
      const dateStr = item.date
      return `${dateStr.substring(4, 6)}/${dateStr.substring(6, 8)}`
    })
    const salesData = sevenDaysData.dailySales.map(item => item.sales)

    // 配置图表选项
    const option = {
      title: {
        text: '过去七天销售额趋势',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 600
        }
      },
      tooltip: {
        trigger: 'axis',
        formatter: (params) => {
          const param = params[0]
          return `${param.name}<br/>销售额: ¥${param.value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: dates,
        axisLabel: {
          fontSize: 12
        }
      },
      yAxis: {
        type: 'value',
        name: '销售额（元）',
        axisLabel: {
          formatter: (value) => {
            if (value >= 10000) {
              return (value / 10000).toFixed(1) + '万'
            }
            return value
          }
        }
      },
      series: [
        {
          name: '销售额',
          type: 'bar',
          data: salesData,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#83bff6' },
              { offset: 0.5, color: '#188df0' },
              { offset: 1, color: '#188df0' }
            ])
          },
          emphasis: {
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#2378f7' },
                { offset: 0.7, color: '#2378f7' },
                { offset: 1, color: '#83bff6' }
              ])
            }
          }
        }
      ]
    }

    salesChartInstance.setOption(option)

    // 响应式调整
    window.addEventListener('resize', () => {
      salesChartInstance?.resize()
    })
  } catch (error) {
    console.error('初始化销售额图表失败:', error)
  }
}

// 初始化订单数图表
const initOrdersChart = async () => {
  if (!ordersChartRef.value) return

  try {
    // 获取七天订单数据
    const sevenDaysData = await statisticsService.getSevenDaysOrders()

    // 初始化echarts实例
    ordersChartInstance = echarts.init(ordersChartRef.value)

    // 处理数据
    const dates = sevenDaysData.dailyOrders.map(item => {
      const dateStr = item.date
      return `${dateStr.substring(4, 6)}/${dateStr.substring(6, 8)}`
    })
    const ordersData = sevenDaysData.dailyOrders.map(item => item.orderCount)

    // 配置图表选项
    const option = {
      title: {
        text: '过去七天订单数趋势',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 600
        }
      },
      tooltip: {
        trigger: 'axis',
        formatter: (params) => {
          const param = params[0]
          return `${param.name}<br/>订单数: ${param.value}`
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: dates,
        axisLabel: {
          fontSize: 12
        }
      },
      yAxis: {
        type: 'value',
        name: '订单数（单）',
        minInterval: 1
      },
      series: [
        {
          name: '订单数',
          type: 'bar',
          data: ordersData,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#fbc2eb' },
              { offset: 0.5, color: '#a6c1ee' },
              { offset: 1, color: '#a6c1ee' }
            ])
          },
          emphasis: {
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#f093fb' },
                { offset: 0.7, color: '#f093fb' },
                { offset: 1, color: '#fbc2eb' }
              ])
            }
          }
        }
      ]
    }

    ordersChartInstance.setOption(option)

    // 响应式调整
    window.addEventListener('resize', () => {
      ordersChartInstance?.resize()
    })
  } catch (error) {
    console.error('初始化订单数图表失败:', error)
  }
}

// 更新销售额图表数据
const updateSalesChart = async () => {
  if (!salesChartInstance) return

  try {
    const sevenDaysData = await statisticsService.getSevenDaysSales()

    const dates = sevenDaysData.dailySales.map(item => {
      const dateStr = item.date
      return `${dateStr.substring(4, 6)}/${dateStr.substring(6, 8)}`
    })
    const salesData = sevenDaysData.dailySales.map(item => item.sales)

    salesChartInstance.setOption({
      xAxis: {
        data: dates
      },
      series: [
        {
          data: salesData
        }
      ]
    })
  } catch (error) {
    console.error('更新销售额图表失败:', error)
  }
}

// 更新订单数图表数据
const updateOrdersChart = async () => {
  if (!ordersChartInstance) return

  try {
    const sevenDaysData = await statisticsService.getSevenDaysOrders()

    const dates = sevenDaysData.dailyOrders.map(item => {
      const dateStr = item.date
      return `${dateStr.substring(4, 6)}/${dateStr.substring(6, 8)}`
    })
    const ordersData = sevenDaysData.dailyOrders.map(item => item.orderCount)

    ordersChartInstance.setOption({
      xAxis: {
        data: dates
      },
      series: [
        {
          data: ordersData
        }
      ]
    })
  } catch (error) {
    console.error('更新订单数图表失败:', error)
  }
}

// 处理SSE数据更新
const handleSSEUpdate = (updateEvent) => {
  console.log('处理SSE更新事件:', updateEvent)

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
    case 'seven_days_sales':
      // 更新销售额图表
      updateSalesChart()
      break
    case 'seven_days_orders':
      // 更新订单数图表
      updateOrdersChart()
      break
    case 'top_products':
      // 更新畅销商品排行榜
      fetchTopProducts()
      break
  }
}

// 组件挂载时获取数据
onMounted(async () => {
  // 获取初始统计数据
  await fetchStatistics()

  // 获取畅销商品排行榜
  await fetchTopProducts()

  // 初始化图表
  await initSalesChart()
  await initOrdersChart()

  // 建立SSE连接
  statisticsService.connectSSE(
    handleSSEUpdate,
    (error) => {
      console.error('SSE连接错误:', error)
    }
  )
})

// 组件卸载时清理
onUnmounted(() => {
  // 断开SSE连接
  statisticsService.disconnectSSE()

  // 销毁图表实例
  if (salesChartInstance) {
    salesChartInstance.dispose()
    salesChartInstance = null
  }

  if (ordersChartInstance) {
    ordersChartInstance.dispose()
    ordersChartInstance = null
  }

  // 移除resize监听
  window.removeEventListener('resize', () => {
    salesChartInstance?.resize()
    ordersChartInstance?.resize()
  })
})
</script>

<style scoped>
.dashboard-container {
  max-width: 1400px;
  margin: 0 auto;
}

/* 模块容器样式 */
.dashboard-section,
.ranking-section,
.chart-section {
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

/* 图表容器样式 */
.chart-container {
  width: 100%;
  height: 400px;
}

/* 畅销商品排行榜样式 */
.ranking-card {
  position: relative;
  margin-bottom: 20px;
  transition: all 0.3s;
}

.ranking-card:hover {
  transform: translateY(-4px);
}

.rank-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 10;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 24px;
  color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.ranking-card:nth-child(1) .rank-badge {
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
}

.ranking-card:nth-child(2) .rank-badge {
  background: linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 100%);
}

.ranking-card:nth-child(3) .rank-badge {
  background: linear-gradient(135deg, #CD7F32 0%, #B8860B 100%);
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
  margin-bottom: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f5f7fa;
  border-radius: 6px;
}

.stat-row .label {
  font-size: 14px;
  color: #909399;
}

.stat-row .value {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.stat-row .value.sales {
  color: #f56c6c;
  font-size: 18px;
}

.stat-row .value.rank {
  color: #409eff;
}
</style>
