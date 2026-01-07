/**
 * 商品服务类
 * 封装商品相关的API调用和数据转换逻辑
 */

import { apiService } from './api.js'

export class ProductService {
  /**
   * 获取商品列表
   * @param {number} page - 页码 (从1开始)
   * @param {number} size - 每页大小
   * @param {object} filters - 筛选条件
   * @returns {Promise<{products: Array, pagination: object}>}
   */
  async getProductList(page = 1, size = 20, filters = {}) {
    try {
      const params = {
        page,
        size,
        ...filters
      }

      const response = await apiService.get('/product/list', params)

      return {
        products: response.products.map(product => this.transformProduct(product)),
        pagination: {
          total: response.total,
          page: response.page,
          size: response.size,
          totalPages: response.totalPages,
          hasNext: response.hasNext,
          hasPrevious: response.hasPrevious
        }
      }
    } catch (error) {
      console.error('获取商品列表失败:', error)
      throw new Error('获取商品列表失败，请稍后重试')
    }
  }

  /**
   * 获取商品详情
   * @param {string} productId - 商品ID
   * @returns {Promise<object>} 商品详情对象
   */
  async getProductDetail(productId) {
    try {
      if (!productId) {
        throw new Error('商品ID不能为空')
      }

      const product = await apiService.get(`/product/${productId}`)
      return this.transformProductDetail(product)
    } catch (error) {
      console.error('获取商品详情失败:', error)

      // 如果是404错误，说明商品不存在
      if (error.message.includes('404') || error.message.includes('不存在')) {
        throw new Error('商品不存在')
      }

      throw new Error('获取商品详情失败，请稍后重试')
    }
  }

  /**
   * 转换商品列表数据 (适配前端组件)
   * @param {object} product - 后端商品数据
   * @returns {object} 转换后的商品数据
   */
  transformProduct(product) {
    return {
      // 基础字段
      id: product.id,                    // 商品ID (字符串)
      name: product.name,                // 商品名称
      price: product.price,              // 价格
      category: product.category,        // 分类ID

      // 图片处理 (支持null值)
      image: this.extractImageUrl(product.image),

      // 新增字段
      brand: product.brand || '',        // 品牌
      status: product.status || 'ACTIVE', // 状态
      createTime: product.createTime,    // 创建时间

      // 为兼容性保留的字段
      description: product.description || '', // 描述 (列表中可能没有)
      stock: 0  // 列表中没有库存信息，设为0
    }
  }

  /**
   * 转换商品详情数据 (包含完整信息)
   * @param {object} product - 后端商品详情数据
   * @returns {object} 转换后的商品详情数据
   */
  transformProductDetail(product) {
    return {
      // 基础字段
      id: product.id,
      name: product.name,
      price: product.price,
      cost: product.cost,                // 成本价
      description: product.description,
      category: product.category,

      // 图片处理 (支持null值)
      image: this.extractImageUrl(product.image),

      // 库存信息 (从对象中提取)
      stock: product.stock?.total || 0,
      stockDetail: product.stock || {},

      // 新增字段
      brand: product.brand || '',
      spec: product.spec || {},          // 规格参数
      tags: product.tags || [],          // 标签
      status: product.status || 'ACTIVE',
      createTime: product.createTime,
      updateTime: product.updateTime
    }
  }

  /**
   * 提取图片URL，处理null值情况
   * @param {object|null} imageObj - 后端图片对象
   * @returns {string} 图片URL
   */
  extractImageUrl(imageObj) {
    if (!imageObj || !imageObj.id) {
      // 输出警告但不影响功能
      console.warn('商品图片字段为空，使用默认占位图:', imageObj)
      return 'https://via.placeholder.com/300x300?text=No+Image'
    }

    // 如果是完整的HTTP URL，直接返回
    if (imageObj.id.startsWith('http://') || imageObj.id.startsWith('https://')) {
      return imageObj.id
    }

    // 对于HDFS路径，可能需要转换为可访问的URL
    // 这里先直接返回，后续可根据需要添加转换逻辑
    console.log('使用HDFS图片路径:', imageObj.id)
    return imageObj.id
  }

  /**
   * 格式化价格显示
   * @param {number} price - 价格
   * @returns {string} 格式化的价格字符串
   */
  formatPrice(price) {
    return `¥${price.toLocaleString()}`
  }

  /**
   * 获取商品状态文本
   * @param {string} status - 状态码
   * @returns {string} 状态文本
   */
  getStatusText(status) {
    const statusMap = {
      'ACTIVE': '正常',
      'INACTIVE': '下架',
      'DELETED': '已删除'
    }
    return statusMap[status] || '未知'
  }

  /**
   * 获取商品状态标签类型
   * @param {string} status - 状态码
   * @returns {string} Element Plus标签类型
   */
  getStatusTagType(status) {
    const typeMap = {
      'ACTIVE': 'success',
      'INACTIVE': 'warning',
      'DELETED': 'danger'
    }
    return typeMap[status] || 'info'
  }
}

// 创建单例实例
export const productService = new ProductService()
