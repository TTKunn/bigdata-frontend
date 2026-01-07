import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
  const items = ref([])

  // 只计算选中商品的总数量
  const totalCount = computed(() => {
    return items.value
      .filter(item => item.selected)
      .reduce((sum, item) => sum + item.quantity, 0)
  })

  // 只计算选中商品的总价格
  const totalPrice = computed(() => {
    return items.value
      .filter(item => item.selected)
      .reduce((sum, item) => sum + item.price * item.quantity, 0)
  })

  // 选中的商品数量
  const selectedCount = computed(() => {
    return items.value.filter(item => item.selected).length
  })

  // 是否有选中的商品
  const hasSelected = computed(() => {
    return items.value.some(item => item.selected)
  })

  // 获取选中的商品列表
  const selectedItems = computed(() => {
    return items.value.filter(item => item.selected)
  })

  function addToCart(product) {
    const existingItem = items.value.find(item => item.id === product.id)

    if (existingItem) {
      existingItem.quantity++
    } else {
      items.value.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1,
        selected: true  // 新商品默认选中
      })
    }
  }

  function removeFromCart(productId) {
    const index = items.value.findIndex(item => item.id === productId)
    if (index > -1) {
      items.value.splice(index, 1)
    }
  }

  function updateQuantity(productId, quantity) {
    const item = items.value.find(item => item.id === productId)
    if (item) {
      if (quantity <= 0) {
        removeFromCart(productId)
      } else {
        item.quantity = quantity
      }
    }
  }

  // 切换单个商品的选中状态
  function toggleItemSelection(productId) {
    const item = items.value.find(item => item.id === productId)
    if (item) {
      item.selected = !item.selected
    }
  }

  // 全选/取消全选
  function toggleAllSelection(selected) {
    items.value.forEach(item => {
      item.selected = selected
    })
  }

  // 清空选中的商品
  function clearSelected() {
    items.value = items.value.filter(item => !item.selected)
  }

  function clearCart() {
    items.value = []
  }

  return {
    items,
    totalCount,
    totalPrice,
    selectedCount,
    hasSelected,
    selectedItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    toggleItemSelection,
    toggleAllSelection,
    clearSelected,
    clearCart
  }
})
