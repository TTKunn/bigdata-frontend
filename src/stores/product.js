/**
 * 商品数据状态管理 Store
 * 使用Pinia管理商品相关的状态和业务逻辑
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { productService } from '../services/productService'

export const useProductStore = defineStore('product', () => {
  // 状态定义
  const products = ref([])          // 商品列表
  const currentProduct = ref(null)  // 当前查看的商品详情
  const loading = ref(false)        // 加载状态
  const error = ref(null)           // 错误信息

  // 分页信息
  const pagination = ref({
    total: 0,         // 总商品数
    page: 1,          // 当前页码
    size: 8,          // 每页大小
    totalPages: 0,    // 总页数
    hasNext: false,   // 是否有下一页
    hasPrevious: false // 是否有上一页
  })

  // 计算属性
  const totalProducts = computed(() => pagination.value.total)
  const hasNextPage = computed(() => pagination.value.hasNext)
  const hasPrevPage = computed(() => pagination.value.hasPrevious)
  const currentPage = computed(() => pagination.value.page)
  const pageSize = computed(() => pagination.value.size)

  // 是否正在加载
  const isLoading = computed(() => loading.value)

  // 是否有错误
  const hasError = computed(() => !!error.value)

  // 活跃商品数量（过滤掉非活跃状态的商品）
  const activeProductsCount = computed(() => {
    return products.value.filter(product => product.status === 'ACTIVE').length
  })

  /**
   * 获取商品列表
   * @param {number} page - 页码 (默认1)
   * @param {number} size - 每页大小 (默认8)
   * @param {object} filters - 筛选条件
   */
  async function fetchProducts(page = 1, size = 8, filters = {}) {
    loading.value = true
    error.value = null

    try {
      console.log('正在获取商品列表:', { page, size, filters })

      const response = await productService.getProductList(page, size, filters)

      // 更新商品列表
      products.value = response.products

      // 更新分页信息
      pagination.value = response.pagination

      console.log('商品列表获取成功:', {
        count: response.products.length,
        pagination: response.pagination
      })

      return response
    } catch (err) {
      error.value = err.message || '获取商品列表失败'
      console.error('获取商品列表失败:', err)

      // 清空商品列表
      products.value = []

      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取商品详情
   * @param {string} productId - 商品ID
   * @returns {Promise<object>} 商品详情对象
   */
  async function fetchProductDetail(productId) {
    if (!productId) {
      throw new Error('商品ID不能为空')
    }

    loading.value = true
    error.value = null

    try {
      console.log('正在获取商品详情:', productId)

      const product = await productService.getProductDetail(productId)

      // 更新当前商品详情
      currentProduct.value = product

      console.log('商品详情获取成功:', product.name)

      return product
    } catch (err) {
      error.value = err.message || '获取商品详情失败'
      console.error('获取商品详情失败:', err)

      // 清空当前商品详情
      currentProduct.value = null

      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 刷新当前页商品列表
   */
  async function refreshProducts() {
    return fetchProducts(pagination.value.page, pagination.value.size)
  }

  /**
   * 切换到下一页
   */
  async function nextPage() {
    if (hasNextPage.value) {
      return fetchProducts(pagination.value.page + 1, pagination.value.size)
    }
  }

  /**
   * 切换到上一页
   */
  async function prevPage() {
    if (hasPrevPage.value) {
      return fetchProducts(pagination.value.page - 1, pagination.value.size)
    }
  }

  /**
   * 跳转到指定页
   * @param {number} page - 目标页码
   */
  async function goToPage(page) {
    if (page >= 1 && page <= pagination.value.totalPages) {
      return fetchProducts(page, pagination.value.size)
    }
  }

  /**
   * 更改每页显示数量
   * @param {number} size - 新的每页大小
   */
  async function changePageSize(size) {
    return fetchProducts(1, size) // 重置到第一页
  }

  /**
   * 根据ID查找商品（从当前列表中）
   * @param {string} productId - 商品ID
   * @returns {object|null} 商品对象或null
   */
  function findProductById(productId) {
    return products.value.find(product => product.id === productId) || null
  }

  /**
   * 清空当前商品详情
   */
  function clearCurrentProduct() {
    currentProduct.value = null
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
    products.value = []
    currentProduct.value = null
    loading.value = false
    error.value = null
    pagination.value = {
      total: 0,
      page: 1,
      size: 8,
      totalPages: 0,
      hasNext: false,
      hasPrevious: false
    }
  }

  // 返回所有状态和方法
  return {
    // 状态
    products,
    currentProduct,
    loading,
    error,
    pagination,

    // 计算属性
    totalProducts,
    hasNextPage,
    hasPrevPage,
    currentPage,
    pageSize,
    isLoading,
    hasError,
    activeProductsCount,

    // 方法
    fetchProducts,
    fetchProductDetail,
    refreshProducts,
    nextPage,
    prevPage,
    goToPage,
    changePageSize,
    findProductById,
    clearCurrentProduct,
    clearError,
    reset
  }
})
