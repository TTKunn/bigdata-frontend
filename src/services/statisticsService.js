/**
 * 销售统计服务类
 * 封装销售统计相关的API调用和数据转换逻辑
 */

import { apiService } from './api.js'

const API_BASE_URL = 'http://localhost:8080/api'

export class StatisticsService {
  constructor() {
    this.eventSource = null
    this.listeners = new Map()
  }
  /**
   * 获取总销售额统计
   * @returns {Promise<object>} 总销售额统计数据
   */
  async getTotalSales() {
    try {
      console.log('正在获取总销售额统计')

      const response = await apiService.get('/statistics/total-sales')

      console.log('总销售额统计获取成功:', response)

      return this.transformTotalSalesData(response)
    } catch (error) {
      console.error('获取总销售额统计失败:', error)
      throw new Error('获取总销售额统计失败，请稍后重试')
    }
  }

  /**
   * 获取当日销售额统计
   * @param {string} date - 统计日期，格式：yyyyMMdd（可选，默认当天）
   * @returns {Promise<object>} 当日销售额统计数据
   */
  async getDailySales(date = '') {
    try {
      console.log('正在获取当日销售额统计:', date || '今天')

      const params = date ? { date } : {}
      const response = await apiService.get('/statistics/daily-sales', params)

      console.log('当日销售额统计获取成功:', response)

      return this.transformDailySalesData(response)
    } catch (error) {
      console.error('获取当日销售额统计失败:', error)
      throw new Error('获取当日销售额统计失败，请稍后重试')
    }
  }

  /**
   * 获取当日订单数量统计
   * @param {string} date - 统计日期，格式：yyyyMMdd（可选，默认当天）
   * @returns {Promise<object>} 当日订单数量统计数据
   */
  async getDailyOrders(date = '') {
    try {
      console.log('正在获取当日订单数量统计:', date || '今天')

      const params = date ? { date } : {}
      const response = await apiService.get('/statistics/daily-orders', params)

      console.log('当日订单数量统计获取成功:', response)

      return this.transformDailyOrdersData(response)
    } catch (error) {
      console.error('获取当日订单数量统计失败:', error)
      throw new Error('获取当日订单数量统计失败，请稍后重试')
    }
  }

  /**
   * 获取最畅销商品排行榜
   * @param {number} limit - 返回数量限制，范围：1-20，默认：3
   * @returns {Promise<object>} 商品排行榜数据
   */
  async getTopProducts(limit = 3) {
    try {
      console.log('正在获取最畅销商品排行榜:', limit)

      const response = await apiService.get('/statistics/top-products', { limit })

      console.log('最畅销商品排行榜获取成功:', response)

      return this.transformTopProductsData(response)
    } catch (error) {
      console.error('获取最畅销商品排行榜失败:', error)
      throw new Error('获取最畅销商品排行榜失败，请稍后重试')
    }
  }

  /**
   * 转换总销售额统计数据
   * @param {object} data - 后端数据
   * @returns {object} 转换后的前端数据
   */
  transformTotalSalesData(data) {
    return {
      totalSales: data.totalSales || 0,
      completedOrders: data.completedOrders || 0,
      lastUpdateTime: data.lastUpdateTime
    }
  }

  /**
   * 转换当日销售额统计数据
   * @param {object} data - 后端数据
   * @returns {object} 转换后的前端数据
   */
  transformDailySalesData(data) {
    return {
      date: data.date,
      dailySales: data.dailySales || 0,
      orderCount: data.orderCount || 0,
      averageOrderValue: data.averageOrderValue || 0,
      lastUpdateTime: data.lastUpdateTime
    }
  }

  /**
   * 转换当日订单数量统计数据
   * @param {object} data - 后端数据
   * @returns {object} 转换后的前端数据
   */
  transformDailyOrdersData(data) {
    return {
      date: data.date,
      orderCount: data.orderCount || 0,
      lastUpdateTime: data.lastUpdateTime
    }
  }

  /**
   * 转换最畅销商品排行榜数据
   * @param {object} data - 后端数据
   * @returns {object} 转换后的前端数据
   */
  transformTopProductsData(data) {
    return {
      products: data.topProducts || [],
      lastUpdateTime: data.lastUpdateTime
    }
  }

  /**
   * 格式化金额显示（元）
   * @param {number} amount - 金额
   * @returns {string} 格式化后的金额字符串
   */
  formatAmount(amount) {
    if (!amount || amount === 0) {
      return '¥0.00'
    }

    // 如果金额大于等于1万，显示为 xx.x万
    if (amount >= 10000) {
      const wan = (amount / 10000).toFixed(1)
      return `¥${wan}万`
    }

    // 否则显示为 ¥xx.xx
    return `¥${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  /**
   * 格式化数字显示
   * @param {number} num - 数字
   * @returns {string} 格式化后的数字字符串
   */
  formatNumber(num) {
    if (!num || num === 0) {
      return '0'
    }

    return num.toLocaleString('zh-CN')
  }

  /**
   * 获取过去七天销售额统计
   * @returns {Promise<object>} 七天销售额统计数据
   */
  async getSevenDaysSales() {
    try {
      console.log('正在获取过去七天销售额统计')

      const response = await apiService.get('/statistics/seven-days-sales')

      console.log('过去七天销售额统计获取成功:', response)

      return response
    } catch (error) {
      console.error('获取过去七天销售额统计失败:', error)
      throw new Error('获取过去七天销售额统计失败，请稍后重试')
    }
  }

  /**
   * 获取过去七天订单数统计
   * @returns {Promise<object>} 七天订单数统计数据
   */
  async getSevenDaysOrders() {
    try {
      console.log('正在获取过去七天订单数统计')

      const response = await apiService.get('/statistics/seven-days-orders')

      console.log('过去七天订单数统计获取成功:', response)

      return response
    } catch (error) {
      console.error('获取过去七天订单数统计失败:', error)
      throw new Error('获取过去七天订单数统计失败，请稍后重试')
    }
  }

  /**
   * 建立SSE连接，实时接收统计数据更新
   * @param {Function} onUpdate - 数据更新回调函数
   * @param {Function} onError - 错误回调函数
   * @returns {EventSource} EventSource实例
   */
  connectSSE(onUpdate, onError) {
    // 如果已有连接，先关闭
    if (this.eventSource) {
      this.disconnectSSE()
    }

    try {
      const url = `${API_BASE_URL}/statistics/stream`
      console.log('正在建立SSE连接:', url)

      this.eventSource = new EventSource(url)

      // 监听连接成功事件
      this.eventSource.addEventListener('connected', (event) => {
        const data = JSON.parse(event.data)
        console.log('SSE连接成功:', data)
      })

      // 监听统计数据更新事件
      this.eventSource.addEventListener('statistics-update', (event) => {
        const updateEvent = JSON.parse(event.data)
        console.log('收到统计数据更新:', updateEvent)

        if (onUpdate) {
          onUpdate(updateEvent)
        }
      })

      // 监听错误
      this.eventSource.onerror = (error) => {
        console.error('SSE连接错误:', error)
        if (onError) {
          onError(error)
        }
      }

      return this.eventSource
    } catch (error) {
      console.error('建立SSE连接失败:', error)
      if (onError) {
        onError(error)
      }
      throw error
    }
  }

  /**
   * 断开SSE连接
   */
  disconnectSSE() {
    if (this.eventSource) {
      console.log('正在断开SSE连接')
      this.eventSource.close()
      this.eventSource = null
    }
  }

  /**
   * 检查SSE连接状态
   * @returns {boolean} 是否已连接
   */
  isSSEConnected() {
    return this.eventSource !== null && this.eventSource.readyState === EventSource.OPEN
  }
}

// 创建单例实例
export const statisticsService = new StatisticsService()
