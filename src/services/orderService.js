/**
 * 订单服务类
 * 封装订单相关的API调用和数据转换逻辑
 */

import { apiService } from './api.js'

export class OrderService {
  /**
   * 从购物车创建订单
   * @param {string[]} productIds - 要下单的商品ID列表
   * @param {string} remark - 订单备注
   * @returns {Promise<object>} 创建的订单信息
   */
  async createOrder(productIds, remark = '') {
    try {
      if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
        throw new Error('商品ID列表不能为空')
      }

      console.log('正在创建订单:', { productIds, remark })

      const requestData = {
        productIds,
        remark
      }

      const response = await apiService.post('/order/create', requestData)

      console.log('订单创建成功:', response.orderId)

      return this.transformOrderData(response)
    } catch (error) {
      console.error('创建订单失败:', error)

      // 转换错误信息
      if (error.message.includes('商品列表不能为空')) {
        throw new Error('请选择要购买的商品')
      } else if (error.message.includes('部分商品不在购物车中')) {
        throw new Error('部分商品不在购物车中，请重新选择')
      } else if (error.message.includes('库存不足')) {
        throw new Error('商品库存不足，请调整购买数量')
      }

      throw new Error('创建订单失败，请稍后重试')
    }
  }

  /**
   * 查询订单列表
   * @param {object} params - 查询参数
   * @param {string} params.status - 订单状态筛选
   * @param {number} params.page - 页码 (默认1)
   * @param {number} params.size - 每页大小 (默认10)
   * @returns {Promise<object>} 订单列表和分页信息
   */
  async getOrderList(params = {}) {
    try {
      const queryParams = {
        status: params.status || '',
        page: params.page || 1,
        size: params.size || 10
      }

      console.log('正在获取订单列表:', queryParams)

      const response = await apiService.get('/order/list', queryParams)

      console.log('订单列表获取成功:', {
        count: response.orders?.length || 0,
        pagination: response.pagination
      })

      return {
        orders: response.orders
          .filter(order => !order.orderId.startsWith('test')) // 过滤测试订单
          .map(order => this.transformOrderListItem(order)),
        pagination: response.pagination
      }
    } catch (error) {
      console.error('获取订单列表失败:', error)
      throw new Error('获取订单列表失败，请稍后重试')
    }
  }

  /**
   * 查询订单详情
   * @param {string} orderId - 订单ID
   * @returns {Promise<object>} 订单详情信息
   */
  async getOrderDetail(orderId) {
    try {
      if (!orderId) {
        throw new Error('订单ID不能为空')
      }

      console.log('正在获取订单详情:', orderId)

      const response = await apiService.get(`/order/${orderId}`)

      console.log('订单详情获取成功:', response.orderId)

      return this.transformOrderDetail(response)
    } catch (error) {
      console.error('获取订单详情失败:', error)

      // 转换错误信息
      if (error.message.includes('订单不存在')) {
        throw new Error('订单不存在')
      }

      throw new Error('获取订单详情失败，请稍后重试')
    }
  }

  /**
   * 支付订单
   * @param {string} orderId - 订单ID
   * @returns {Promise<object>} 支付结果
   */
  async payOrder(orderId) {
    try {
      if (!orderId) {
        throw new Error('订单ID不能为空')
      }

      console.log('正在支付订单:', orderId)

      const response = await apiService.post(`/order/${orderId}/pay`)

      console.log('订单支付成功:', orderId)

      return response
    } catch (error) {
      console.error('支付订单失败:', error)

      // 转换错误信息
      if (error.message.includes('订单状态不允许支付')) {
        throw new Error('订单状态不允许支付')
      } else if (error.message.includes('订单不存在')) {
        throw new Error('订单不存在')
      }

      throw new Error('支付失败，请稍后重试')
    }
  }

  /**
   * 取消订单
   * @param {string} orderId - 订单ID
   * @returns {Promise<object>} 取消结果
   */
  async cancelOrder(orderId) {
    try {
      if (!orderId) {
        throw new Error('订单ID不能为空')
      }

      console.log('正在取消订单:', orderId)

      const response = await apiService.post(`/order/${orderId}/cancel`)

      console.log('订单取消成功:', orderId)

      return response
    } catch (error) {
      console.error('取消订单失败:', error)

      // 转换错误信息
      if (error.message.includes('订单状态不允许取消')) {
        throw new Error('订单状态不允许取消')
      } else if (error.message.includes('订单不存在')) {
        throw new Error('订单不存在')
      }

      throw new Error('取消订单失败，请稍后重试')
    }
  }

  /**
   * 完成订单（确认收货）
   * @param {string} orderId - 订单ID
   * @returns {Promise<object>} 完成结果
   */
  async completeOrder(orderId) {
    try {
      if (!orderId) {
        throw new Error('订单ID不能为空')
      }

      console.log('正在完成订单:', orderId)

      const response = await apiService.post(`/order/${orderId}/complete`)

      console.log('订单完成成功:', orderId)

      return response
    } catch (error) {
      console.error('完成订单失败:', error)

      // 转换错误信息
      if (error.message.includes('订单状态不允许完成')) {
        throw new Error('订单状态不允许完成')
      } else if (error.message.includes('订单不存在')) {
        throw new Error('订单不存在')
      }

      throw new Error('确认收货失败，请稍后重试')
    }
  }

  /**
   * 转换订单列表项数据 (后端格式 → 前端格式)
   * @param {object} order - 后端订单列表项
   * @returns {object} 转换后的前端格式订单项
   */
  transformOrderListItem(order) {
    return {
      // 基本信息
      id: order.orderId,
      orderNumber: order.orderId,
      createTime: this.formatDateTime(order.createTime),
      status: this.mapOrderStatus(order.status),
      totalAmount: order.totalAmount || order.actualAmount,
      actualAmount: order.actualAmount || order.totalAmount,

      // 商品统计
      itemCount: order.itemCount || 0,

      // 分页信息会单独处理
      pagination: undefined
    }
  }

  /**
   * 转换完整订单数据 (后端格式 → 前端格式)
   * @param {object} order - 后端订单数据
   * @returns {object} 转换后的前端格式订单
   */
  transformOrderData(order) {
    return {
      // 基本信息
      id: order.orderId,
      orderNumber: order.orderId,
      userId: order.userId,
      createTime: this.formatDateTime(order.createTime),
      payTime: order.payTime ? this.formatDateTime(order.payTime) : null,
      cancelTime: order.cancelTime ? this.formatDateTime(order.cancelTime) : null,
      completeTime: order.completeTime ? this.formatDateTime(order.completeTime) : null,

      // 金额信息
      totalAmount: order.totalAmount,
      discountAmount: order.discountAmount || 0,
      actualAmount: order.actualAmount,

      // 状态信息
      status: this.mapOrderStatus(order.status),

      // 商品信息
      items: order.items.map(item => this.transformOrderItem(item)),

      // 收货地址
      address: order.address ? {
        receiver: order.address.receiver,
        phone: order.address.phone,
        address: order.address.address,
        postcode: order.address.postcode
      } : null
    }
  }

  /**
   * 转换订单详情数据 (包含所有信息)
   * @param {object} order - 后端订单详情数据
   * @returns {object} 转换后的前端格式订单详情
   */
  transformOrderDetail(order) {
    return this.transformOrderData(order)
  }

  /**
   * 转换订单商品项
   * @param {object} item - 后端订单商品项
   * @returns {object} 转换后的前端格式商品项
   */
  transformOrderItem(item) {
    return {
      id: item.productId,
      name: item.productName,
      category: item.category,
      brand: item.brand,
      price: item.price,
      quantity: item.quantity,
      totalAmount: item.totalAmount || (item.price * item.quantity),
      // 图片URL - 处理后端返回的 imageUrl 字段（支持 HTTP URL 和 HDFS 路径）
      image: this.extractImageUrl(item.imageUrl || item.image, item.productName)
    }
  }

  /**
   * 提取并转换图片URL
   * @param {string} imageUrl - 图片URL（可能是 HTTP URL 或 HDFS 路径）
   * @param {string} productName - 商品名称（用于占位图）
   * @returns {string} 处理后的图片URL
   */
  extractImageUrl(imageUrl, productName = 'Product') {
    // 如果没有图片URL，使用占位图
    if (!imageUrl) {
      return `https://via.placeholder.com/80x80?text=${encodeURIComponent(productName)}`
    }

    // 如果已经是完整的 HTTP/HTTPS URL，直接返回
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl
    }

    // 如果是 HDFS 路径，转换为后端图片服务 URL
    if (imageUrl.startsWith('hdfs://')) {
      // 从 HDFS 路径中提取文件名
      const fileName = imageUrl.split('/').pop()
      const convertedUrl = `http://localhost:8080/api/images/${fileName}`
      console.log('订单商品图片 HDFS路径转换:', imageUrl, '->', convertedUrl)
      return convertedUrl
    }

    // 其他情况，假设是相对路径，拼接为完整 URL
    return `http://localhost:8080/api/images/${imageUrl}`
  }

  /**
   * 映射订单状态 (后端枚举 → 前端中文)
   * @param {string} status - 后端状态枚举
   * @returns {string} 前端状态中文
   */
  mapOrderStatus(status) {
    const statusMap = {
      'PENDING_PAYMENT': '未支付',
      'PAID': '已支付',
      'COMPLETED': '已完成',
      'CANCELLED': '已取消'
    }
    return statusMap[status] || '未知状态'
  }

  /**
   * 获取订单状态标签类型
   * @param {string} status - 后端状态枚举
   * @returns {string} Element Plus标签类型
   */
  getStatusTagType(status) {
    const typeMap = {
      'PENDING_PAYMENT': 'warning',
      'PAID': 'success',
      'COMPLETED': 'info',
      'CANCELLED': 'danger'
    }
    return typeMap[status] || 'info'
  }

  /**
   * 格式化日期时间（UTC 时间转换为本地时间）
   * @param {string} dateTimeStr - ISO 8601格式的日期时间字符串（UTC时间）
   * @returns {string} 格式化的本地日期时间字符串
   */
  formatDateTime(dateTimeStr) {
    if (!dateTimeStr) return '-'

    try {
      // 解析 UTC 时间字符串
      const date = new Date(dateTimeStr)

      // 检查日期是否有效
      if (isNaN(date.getTime())) {
        console.error('无效的日期格式:', dateTimeStr)
        return dateTimeStr
      }

      // 使用本地时间方法（会自动转换为本地时区）
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const seconds = String(date.getSeconds()).padStart(2, '0')

      const formatted = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`

      // 调试日志：显示UTC时间和本地时间的转换
      console.log('时间转换:', {
        utc: dateTimeStr,
        local: formatted,
        timezone: `UTC${date.getTimezoneOffset() / -60 >= 0 ? '+' : ''}${date.getTimezoneOffset() / -60}`
      })

      return formatted
    } catch (error) {
      console.error('日期格式化失败:', error)
      return dateTimeStr
    }
  }

  /**
   * 检查订单是否可以支付
   * @param {string} status - 订单状态
   * @returns {boolean} 是否可以支付
   */
  canPayOrder(status) {
    return status === 'PENDING_PAYMENT'
  }

  /**
   * 检查订单是否可以取消
   * @param {string} status - 订单状态
   * @returns {boolean} 是否可以取消
   */
  canCancelOrder(status) {
    return status === 'PENDING_PAYMENT'
  }

  /**
   * 检查订单是否可以确认收货
   * @param {string} status - 订单状态
   * @returns {boolean} 是否可以确认收货
   */
  canCompleteOrder(status) {
    return status === 'PAID'
  }
}

// 创建单例实例
export const orderService = new OrderService()

