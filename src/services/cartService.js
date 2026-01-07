/**
 * 购物车服务类
 * 封装购物车相关的API调用和数据转换逻辑
 */

import { apiService } from './api.js'

export class CartService {
  /**
   * 同步添加商品到购物车
   * @param {string} productId - 商品ID
   * @param {number} quantity - 商品数量
   * @returns {Promise<void>}
   */
  async addToCart(productId, quantity = 1) {
    try {
      if (!productId) {
        throw new Error('商品ID不能为空')
      }
      if (quantity <= 0) {
        throw new Error('商品数量必须大于0')
      }

      console.log('正在添加商品到购物车:', { productId, quantity })

      const requestData = {
        productId,
        quantity
      }

      await apiService.post('/cart/add', requestData)

      console.log('商品添加成功:', productId)
    } catch (error) {
      console.error('添加商品到购物车失败:', error)

      // 转换错误信息
      if (error.message.includes('商品不存在')) {
        throw new Error('商品不存在')
      } else if (error.message.includes('库存不足')) {
        throw new Error('商品库存不足')
      } else if (error.message.includes('商品ID不能为空')) {
        throw new Error('商品ID不能为空')
      } else if (error.message.includes('商品数量必须大于0')) {
        throw new Error('商品数量必须大于0')
      }

      throw new Error('添加商品失败，请稍后重试')
    }
  }

  /**
   * 同步获取购物车数据
   * @returns {Promise<object>} 购物车数据
   */
  async getCart() {
    try {
      console.log('正在获取购物车数据')

      const response = await apiService.get('/cart')

      console.log('购物车数据获取成功:', {
        itemCount: response.items?.length || 0,
        totalQuantity: response.totalQuantity,
        totalAmount: response.totalAmount
      })

      return this.transformCartData(response)
    } catch (error) {
      console.error('获取购物车数据失败:', error)
      throw new Error('获取购物车数据失败，请稍后重试')
    }
  }

  /**
   * 同步更新商品数量
   * @param {string} productId - 商品ID
   * @param {number} quantity - 新的数量
   * @returns {Promise<void>}
   */
  async updateQuantity(productId, quantity) {
    try {
      if (!productId) {
        throw new Error('商品ID不能为空')
      }
      if (quantity < 0) {
        throw new Error('商品数量不能小于0')
      }

      console.log('正在更新商品数量:', { productId, quantity })

      const requestData = {
        productId,
        quantity
      }

      await apiService.put('/cart/update', requestData)

      console.log('商品数量更新成功:', productId, quantity)
    } catch (error) {
      console.error('更新商品数量失败:', error)

      // 转换错误信息
      if (error.message.includes('商品数量必须大于0')) {
        throw new Error('商品数量必须大于0')
      } else if (error.message.includes('商品不存在')) {
        throw new Error('商品不存在')
      }

      throw new Error('更新商品数量失败，请稍后重试')
    }
  }

  /**
   * 同步更新商品选中状态
   * @param {string[]} productIds - 商品ID列表
   * @param {boolean} selected - 是否选中
   * @returns {Promise<void>}
   */
  async updateSelection(productIds, selected) {
    try {
      if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
        throw new Error('商品ID列表不能为空')
      }

      console.log('正在更新商品选中状态:', { productIds, selected })

      const requestData = {
        productIds,
        selected
      }

      await apiService.put('/cart/select', requestData)

      console.log('商品选中状态更新成功:', productIds.length, '个商品')
    } catch (error) {
      console.error('更新商品选中状态失败:', error)

      // 转换错误信息
      if (error.message.includes('商品ID列表不能为空')) {
        throw new Error('请选择要操作的商品')
      }

      throw new Error('更新选中状态失败，请稍后重试')
    }
  }

  /**
   * 同步删除购物车商品
   * @param {string[]} productIds - 商品ID列表
   * @returns {Promise<void>}
   */
  async removeItems(productIds) {
    try {
      if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
        throw new Error('商品ID列表不能为空')
      }

      console.log('正在删除购物车商品:', productIds)

      const requestData = {
        productIds
      }

      await apiService.deleteWithBody('/cart/remove', requestData)

      console.log('商品删除成功:', productIds.length, '个商品')
    } catch (error) {
      console.error('删除购物车商品失败:', error)

      // 转换错误信息
      if (error.message.includes('商品ID列表不能为空')) {
        throw new Error('请选择要删除的商品')
      }

      throw new Error('删除商品失败，请稍后重试')
    }
  }

  /**
   * 同步清空购物车
   * @returns {Promise<void>}
   */
  async clearCart() {
    try {
      console.log('正在清空购物车')

      await apiService.delete('/cart/clear')

      console.log('购物车清空成功')
    } catch (error) {
      console.error('清空购物车失败:', error)
      throw new Error('清空购物车失败，请稍后重试')
    }
  }

  /**
   * 转换购物车数据 (后端格式 → 前端格式)
   * @param {object} cartData - 后端购物车数据
   * @returns {object} 转换后的前端格式数据
   */
  transformCartData(cartData) {
    return {
      userId: cartData.userId,
      items: cartData.items.map(item => this.transformCartItem(item)),
      totalQuantity: cartData.totalQuantity || 0,
      totalAmount: cartData.totalAmount || 0
    }
  }

  /**
   * 转换购物车商品项 (后端格式 → 前端格式)
   * @param {object} item - 后端购物车商品项
   * @returns {object} 转换后的前端格式商品项
   */
  transformCartItem(item) {
    return {
      // 字段映射 (后端 → 前端)
      id: item.productId,           // productId → id
      name: item.productName,       // productName → name
      price: item.price,            // price → price (直接映射)
      category: item.category,      // category → category (直接映射)
      brand: item.brand,            // brand → brand (直接映射)
      quantity: item.quantity,      // quantity → quantity (直接映射)
      selected: item.selected,      // selected → selected (直接映射)

      // 新增字段
      addTime: item.addTime,        // 添加时间

      // 前端扩展字段 (本地维护，不同步到后端)
      image: ''  // 图片URL，暂时为空，后续可根据商品详情获取
    }
  }

  /**
   * 转换商品项到后端格式 (前端格式 → 后端格式)
   * @param {object} item - 前端格式商品项
   * @returns {object} 后端格式商品项
   */
  transformToBackendItem(item) {
    return {
      // 字段映射 (前端 → 后端)
      productId: item.id,           // id → productId
      productName: item.name,       // name → productName
      price: item.price,            // price → price (直接映射)
      category: item.category,      // category → category (直接映射)
      brand: item.brand,            // brand → brand (直接映射)
      quantity: item.quantity,      // quantity → quantity (直接映射)
      selected: item.selected,      // selected → selected (直接映射)
      addTime: item.addTime         // addTime → addTime (直接映射)
    }
  }

  /**
   * 验证商品ID格式
   * @param {string} productId - 商品ID
   * @returns {boolean} 是否有效
   */
  isValidProductId(productId) {
    // 商品ID格式验证 (12位字符)
    return typeof productId === 'string' && productId.length === 12
  }

  /**
   * 验证商品数量
   * @param {number} quantity - 商品数量
   * @returns {boolean} 是否有效
   */
  isValidQuantity(quantity) {
    return typeof quantity === 'number' && quantity > 0 && Number.isInteger(quantity)
  }
}

// 创建单例实例
export const cartService = new CartService()
