/**
 * 订单数据状态管理 Store
 * 使用Pinia管理订单相关的状态和业务逻辑
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { orderService } from '../services/orderService'
import { ElMessage } from 'element-plus'

export const useOrderStore = defineStore('order', () => {
  // 状态定义
  const orders = ref([])              // 订单列表
  const currentOrder = ref(null)      // 当前查看的订单详情
  const loading = ref(false)          // 加载状态
  const creating = ref(false)         // 创建订单状态
  const error = ref(null)             // 错误信息

  // 分页信息
  const pagination = ref({
    page: 1,          // 当前页
    size: 10,         // 每页大小
    total: 0,         // 总记录数
    totalPages: 0,    // 总页数
    hasNext: false,   // 是否有下一页
    hasPrev: false    // 是否有上一页
  })

  // 筛选条件
  const filters = ref({
    status: ''        // 订单状态筛选
  })

  // 计算属性
  const totalOrders = computed(() => pagination.value.total)
  const hasOrders = computed(() => orders.value.length > 0)
  const isLoading = computed(() => loading.value)
  const isCreating = computed(() => creating.value)
  const hasError = computed(() => !!error.value)

  // 获取订单状态统计
  const orderStats = computed(() => {
    const stats = {
      pending: 0,      // 未支付
      paid: 0,         // 已支付
      completed: 0,    // 已完成
      cancelled: 0     // 已取消
    }

    orders.value.forEach(order => {
      switch (order.status) {
        case '未支付':
          stats.pending++
          break
        case '已支付':
          stats.paid++
          break
        case '已完成':
          stats.completed++
          break
        case '已取消':
          stats.cancelled++
          break
      }
    })

    return stats
  })

  /**
   * 获取订单列表
   * @param {object} params - 查询参数
   * @param {string} params.status - 状态筛选
   * @param {number} params.page - 页码
   * @param {number} params.size - 每页大小
   */
  async function fetchOrders(params = {}) {
    loading.value = true
    error.value = null

    try {
      // 更新筛选条件
      filters.value = {
        status: params.status || filters.value.status
      }

      const queryParams = {
        ...filters.value,
        page: params.page || pagination.value.page,
        size: params.size || pagination.value.size
      }

      console.log('正在获取订单列表:', queryParams)

      const response = await orderService.getOrderList(queryParams)

      // 更新订单列表
      orders.value = response.orders

      // 更新分页信息
      pagination.value = response.pagination

      console.log('订单列表获取成功:', {
        count: response.orders.length,
        pagination: response.pagination
      })

      return response
    } catch (err) {
      error.value = err.message
      console.error('获取订单列表失败:', err)
      ElMessage.error('获取订单列表失败，请稍后重试')
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取订单详情
   * @param {string} orderId - 订单ID
   * @returns {Promise<object>} 订单详情对象
   */
  async function fetchOrderDetail(orderId) {
    if (!orderId) {
      throw new Error('订单ID不能为空')
    }

    loading.value = true
    error.value = null

    try {
      console.log('正在获取订单详情:', orderId)

      const order = await orderService.getOrderDetail(orderId)

      // 更新当前订单详情
      currentOrder.value = order

      console.log('订单详情获取成功:', order.orderNumber)

      return order
    } catch (err) {
      error.value = err.message
      console.error('获取订单详情失败:', err)
      ElMessage.error(err.message || '获取订单详情失败')
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 创建订单
   * @param {string[]} productIds - 商品ID列表
   * @param {string} remark - 订单备注
   * @returns {Promise<object>} 创建的订单信息
   */
  async function createOrder(productIds, remark = '') {
    creating.value = true
    error.value = null

    try {
      console.log('正在创建订单:', { productIds: productIds.length, remark })

      const order = await orderService.createOrder(productIds, remark)

      ElMessage.success('订单创建成功！')

      console.log('订单创建成功:', order.orderNumber)

      return order
    } catch (err) {
      error.value = err.message
      console.error('创建订单失败:', err)
      ElMessage.error(err.message || '创建订单失败')
      throw err
    } finally {
      creating.value = false
    }
  }

  /**
   * 支付订单
   * @param {string} orderId - 订单ID
   * @returns {Promise<object>} 支付结果
   */
  async function payOrder(orderId) {
    try {
      console.log('正在支付订单:', orderId)

      const result = await orderService.payOrder(orderId)

      // 更新订单状态
      if (currentOrder.value && currentOrder.value.id === orderId) {
        currentOrder.value.status = '已支付'
        currentOrder.value.payTime = new Date().toLocaleString()
      }

      // 刷新订单列表
      await refreshOrders()

      ElMessage.success('订单支付成功！')

      console.log('订单支付成功:', orderId)

      return result
    } catch (err) {
      console.error('支付订单失败:', err)
      ElMessage.error(err.message || '支付失败')
      throw err
    }
  }

  /**
   * 取消订单
   * @param {string} orderId - 订单ID
   * @returns {Promise<object>} 取消结果
   */
  async function cancelOrder(orderId) {
    try {
      console.log('正在取消订单:', orderId)

      const result = await orderService.cancelOrder(orderId)

      // 更新订单状态
      if (currentOrder.value && currentOrder.value.id === orderId) {
        currentOrder.value.status = '已取消'
      }

      // 刷新订单列表
      await refreshOrders()

      ElMessage.success('订单已取消')

      console.log('订单取消成功:', orderId)

      return result
    } catch (err) {
      console.error('取消订单失败:', err)
      ElMessage.error(err.message || '取消订单失败')
      throw err
    }
  }

  /**
   * 完成订单（确认收货）
   * @param {string} orderId - 订单ID
   * @returns {Promise<object>} 完成结果
   */
  async function completeOrder(orderId) {
    try {
      console.log('正在完成订单:', orderId)

      const result = await orderService.completeOrder(orderId)

      // 更新订单状态
      if (currentOrder.value && currentOrder.value.id === orderId) {
        currentOrder.value.status = '已完成'
        currentOrder.value.completeTime = new Date().toLocaleString()
      }

      // 刷新订单列表
      await refreshOrders()

      ElMessage.success('确认收货成功！')

      console.log('订单完成成功:', orderId)

      return result
    } catch (err) {
      console.error('完成订单失败:', err)
      ElMessage.error(err.message || '确认收货失败')
      throw err
    }
  }

  /**
   * 刷新订单列表
   */
  async function refreshOrders() {
    try {
      await fetchOrders({
        page: pagination.value.page,
        size: pagination.value.size
      })
    } catch (error) {
      console.error('刷新订单列表失败:', error)
    }
  }

  /**
   * 切换到下一页
   */
  async function nextPage() {
    if (pagination.value.hasNext) {
      await fetchOrders({
        page: pagination.value.page + 1
      })
    }
  }

  /**
   * 切换到上一页
   */
  async function prevPage() {
    if (pagination.value.hasPrev) {
      await fetchOrders({
        page: pagination.value.page - 1
      })
    }
  }

  /**
   * 跳转到指定页
   * @param {number} page - 目标页码
   */
  async function goToPage(page) {
    if (page >= 1 && page <= pagination.value.totalPages) {
      await fetchOrders({ page })
    }
  }

  /**
   * 更改每页显示数量
   * @param {number} size - 新的每页大小
   */
  async function changePageSize(size) {
    await fetchOrders({
      page: 1,  // 重置到第一页
      size
    })
  }

  /**
   * 按状态筛选订单
   * @param {string} status - 订单状态 ('', 'PENDING_PAYMENT', 'PAID', 'COMPLETED', 'CANCELLED')
   */
  async function filterByStatus(status) {
    filters.value.status = status
    await fetchOrders({
      page: 1,  // 重置到第一页
      status
    })
  }

  /**
   * 根据ID查找订单
   * @param {string} orderId - 订单ID
   * @returns {object|null} 订单对象或null
   */
  function findOrderById(orderId) {
    return orders.value.find(order => order.id === orderId) || null
  }

  /**
   * 清空当前订单详情
   */
  function clearCurrentOrder() {
    currentOrder.value = null
  }

  /**
   * 清空错误信息
   */
  function clearError() {
    error.value = null
  }

  /**
   * 重置所有状态
   */
  function reset() {
    orders.value = []
    currentOrder.value = null
    loading.value = false
    creating.value = false
    error.value = null
    pagination.value = {
      page: 1,
      size: 10,
      total: 0,
      totalPages: 0,
      hasNext: false,
      hasPrev: false
    }
    filters.value = {
      status: ''
    }
  }

  // 返回所有状态和方法
  return {
    // 状态
    orders,
    currentOrder,
    loading,
    creating,
    error,
    pagination,
    filters,

    // 计算属性
    totalOrders,
    hasOrders,
    isLoading,
    isCreating,
    hasError,
    orderStats,

    // 方法
    fetchOrders,
    fetchOrderDetail,
    createOrder,
    payOrder,
    cancelOrder,
    completeOrder,
    refreshOrders,
    nextPage,
    prevPage,
    goToPage,
    changePageSize,
    filterByStatus,
    findOrderById,
    clearCurrentOrder,
    clearError,
    reset
  }
})

