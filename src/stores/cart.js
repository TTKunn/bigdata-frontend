import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { cartService } from '../services/cartService'
import { ElMessage } from 'element-plus'

export const useCartStore = defineStore('cart', () => {
  // 状态定义
  const items = ref([])              // 购物车商品列表
  const loading = ref(false)         // 加载状态
  const syncing = ref(false)         // 同步状态
  const error = ref(null)            // 错误信息
  const lastSyncTime = ref(null)     // 最后同步时间

  // 计算属性
  const totalCount = computed(() => {
    return items.value
      .filter(item => item.selected)
      .reduce((sum, item) => sum + item.quantity, 0)
  })

  const totalPrice = computed(() => {
    return items.value
      .filter(item => item.selected)
      .reduce((sum, item) => sum + item.price * item.quantity, 0)
  })

  const selectedCount = computed(() => {
    return items.value.filter(item => item.selected).length
  })

  const hasSelected = computed(() => {
    return items.value.some(item => item.selected)
  })

  const selectedItems = computed(() => {
    return items.value.filter(item => item.selected)
  })

  const isLoading = computed(() => loading.value)
  const isSyncing = computed(() => syncing.value)
  const hasError = computed(() => !!error.value)

  // 获取商品项
  function getItemById(productId) {
    return items.value.find(item => item.id === productId)
  }

  /**
   * 异步添加商品到购物车
   * 实现乐观更新 + 后端同步策略
   * @param {object} product - 商品信息
   * @param {number} quantity - 添加数量，默认为1
   */
  async function addToCart(product, quantity = 1) {
    if (!product || !product.id) {
      ElMessage.error('商品信息不完整')
      return
    }

    if (quantity <= 0) {
      ElMessage.error('添加数量必须大于0')
      return
    }

    const existingItem = getItemById(product.id)
    const oldQuantity = existingItem ? existingItem.quantity : 0

    // 乐观更新：先更新本地状态
    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      const newItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        brand: product.brand || '',
        quantity: quantity,
        selected: true,
        addTime: Date.now() // 本地时间戳
      }
      items.value.push(newItem)
    }

    try {
      // 同步到后端
      syncing.value = true
      const newTotalQuantity = existingItem ? existingItem.quantity : quantity
      await cartService.addToCart(product.id, newTotalQuantity)
      lastSyncTime.value = Date.now()

      ElMessage.success('添加成功')
    } catch (err) {
      // 同步失败，回滚本地状态
      console.error('添加商品到购物车失败:', err)

      if (existingItem) {
        existingItem.quantity = oldQuantity
        if (existingItem.quantity <= 0) {
          removeFromCart(product.id)
        }
      } else {
        const index = items.value.findIndex(item => item.id === product.id)
        if (index > -1) {
          items.value.splice(index, 1)
        }
      }

      ElMessage.error(err.message || '添加到购物车失败')
    } finally {
      syncing.value = false
    }
  }

  /**
   * 从购物车移除商品
   */
  function removeFromCart(productId) {
    const index = items.value.findIndex(item => item.id === productId)
    if (index > -1) {
      items.value.splice(index, 1)
    }
  }

  /**
   * 异步更新商品数量
   */
  async function updateQuantity(productId, newQuantity) {
    const item = getItemById(productId)
    if (!item) return

    const oldQuantity = item.quantity

    // 乐观更新
    if (newQuantity <= 0) {
        removeFromCart(productId)
    } else {
      item.quantity = newQuantity
    }

    try {
      // 同步到后端
      syncing.value = true
      await cartService.updateQuantity(productId, newQuantity)
      lastSyncTime.value = Date.now()
    } catch (err) {
      // 同步失败，回滚
      console.error('更新商品数量失败:', err)

      if (newQuantity <= 0) {
        // 重新添加商品
        item.quantity = oldQuantity
        // 确保商品还在列表中
        if (!getItemById(productId)) {
          items.value.push(item)
        }
      } else {
        item.quantity = oldQuantity
      }

      ElMessage.error(err.message || '更新数量失败')
    } finally {
      syncing.value = false
    }
  }

  /**
   * 切换单个商品的选中状态
   */
  async function toggleItemSelection(productId) {
    const item = getItemById(productId)
    if (!item) return

    // 乐观更新
      item.selected = !item.selected

    try {
      // 同步到后端
      syncing.value = true
      await cartService.updateSelection([productId], item.selected)
      lastSyncTime.value = Date.now()
    } catch (err) {
      // 同步失败，回滚
      console.error('更新选中状态失败:', err)
      item.selected = !item.selected // 回滚
      ElMessage.error(err.message || '更新选中状态失败')
    } finally {
      syncing.value = false
    }
  }

  /**
   * 全选/取消全选
   */
  async function toggleAllSelection(selected) {
    const productIds = items.value.map(item => item.id)

    // 乐观更新
    items.value.forEach(item => {
      item.selected = selected
    })

    try {
      // 同步到后端
      syncing.value = true
      await cartService.updateSelection(productIds, selected)
      lastSyncTime.value = Date.now()
    } catch (err) {
      // 同步失败，回滚
      console.error('批量更新选中状态失败:', err)
      items.value.forEach(item => {
        item.selected = !selected // 回滚
      })
      ElMessage.error(err.message || '批量更新选中状态失败')
    } finally {
      syncing.value = false
    }
  }

  /**
   * 异步删除选中的商品
   * @param {boolean} silent - 是否静默删除（不显示成功提示）
   */
  async function clearSelected(silent = false) {
    const selectedProductIds = selectedItems.value.map(item => item.id)
    if (selectedProductIds.length === 0) return

    // 乐观更新
    const remainingItems = items.value.filter(item => !item.selected)
    const deletedItems = items.value.filter(item => item.selected)
    items.value = remainingItems

    try {
      // 同步到后端
      syncing.value = true
      await cartService.removeItems(selectedProductIds)
      lastSyncTime.value = Date.now()

      if (!silent) {
        ElMessage.success(`已删除 ${selectedProductIds.length} 个商品`)
      }
    } catch (err) {
      // 同步失败，回滚
      console.error('删除选中的商品失败:', err)
      items.value = [...remainingItems, ...deletedItems] // 回滚
      ElMessage.error(err.message || '删除商品失败')
    } finally {
      syncing.value = false
    }
  }

  /**
   * 异步删除指定商品
   */
  async function removeItems(productIds) {
    if (!productIds || productIds.length === 0) return

    // 乐观更新
    const remainingItems = items.value.filter(item => !productIds.includes(item.id))
    const deletedItems = items.value.filter(item => productIds.includes(item.id))
    items.value = remainingItems

    try {
      // 同步到后端
      syncing.value = true
      await cartService.removeItems(productIds)
      lastSyncTime.value = Date.now()

      ElMessage.success(`已删除 ${productIds.length} 个商品`)
    } catch (err) {
      // 同步失败，回滚
      console.error('删除商品失败:', err)
      items.value = [...remainingItems, ...deletedItems] // 回滚
      ElMessage.error(err.message || '删除商品失败')
    } finally {
      syncing.value = false
    }
  }

  /**
   * 异步清空购物车
   */
  async function clearCart() {
    const allItems = [...items.value]
    const productIds = allItems.map(item => item.id)

    // 乐观更新
    items.value = []

    try {
      // 同步到后端
      syncing.value = true
      await cartService.clearCart()
      lastSyncTime.value = Date.now()

      ElMessage.success('购物车已清空')
    } catch (err) {
      // 同步失败，回滚
      console.error('清空购物车失败:', err)
      items.value = allItems // 回滚
      ElMessage.error(err.message || '清空购物车失败')
    } finally {
      syncing.value = false
    }
  }

  /**
   * 从后端获取最新购物车数据
   */
  async function fetchCart() {
    loading.value = true
    error.value = null

    try {
      const cartData = await cartService.getCart()

      // 更新本地数据
      items.value = cartData.items
      lastSyncTime.value = Date.now()

      console.log('购物车数据同步完成')
    } catch (err) {
      error.value = err.message
      console.error('获取购物车数据失败:', err)
      ElMessage.error('获取购物车数据失败，请稍后重试')
    } finally {
      loading.value = false
    }
  }

  /**
   * 刷新购物车数据
   */
  async function refreshCart() {
    await fetchCart()
  }

  /**
   * 重置购物车状态
   */
  function reset() {
    items.value = []
    loading.value = false
    syncing.value = false
    error.value = null
    lastSyncTime.value = null
  }

  /**
   * 检查是否需要同步
   */
  function needsSync() {
    if (!lastSyncTime.value) return true
    const timeSinceLastSync = Date.now() - lastSyncTime.value
    return timeSinceLastSync > 5 * 60 * 1000 // 5分钟
  }

  return {
    // 状态
    items,
    loading,
    syncing,
    error,
    lastSyncTime,

    // 计算属性
    totalCount,
    totalPrice,
    selectedCount,
    hasSelected,
    selectedItems,
    isLoading,
    isSyncing,
    hasError,

    // 方法
    addToCart,
    removeFromCart,
    updateQuantity,
    toggleItemSelection,
    toggleAllSelection,
    clearSelected,
    removeItems,
    clearCart,
    fetchCart,
    refreshCart,
    reset,
    needsSync,
    getItemById
  }
})
