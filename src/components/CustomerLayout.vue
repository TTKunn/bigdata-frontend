<template>
  <el-container class="layout-container">
    <el-header class="header">
      <div class="header-content">
        <div class="logo">
          <el-icon :size="28"><ShoppingBag /></el-icon>
          <span class="logo-text">在线商城</span>
        </div>

        <el-menu
          :default-active="activeMenu"
          mode="horizontal"
          :ellipsis="false"
          class="nav-menu"
          router
        >
          <el-menu-item index="/customer/home">首页</el-menu-item>
          <el-menu-item index="/customer/cart">购物车</el-menu-item>
          <el-menu-item index="/customer/orders">我的订单</el-menu-item>
        </el-menu>
      </div>
    </el-header>

    <el-main class="main-content">
      <router-view />
    </el-main>

    <el-footer class="footer">
      <p>© 2026 在线商城 - 所有权利保留</p>
    </el-footer>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { ShoppingBag } from '@element-plus/icons-vue'

const route = useRoute()

const activeMenu = computed(() => route.path)
</script>

<style scoped>
.layout-container {
  min-height: 100vh;
}

.header {
  background-color: #fff;
  border-bottom: 1px solid #e8e8e8;
  padding: 0;
  height: 64px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 20px;
  font-weight: 600;
  color: #409eff;
  cursor: pointer;
}

.logo-text {
  font-size: 18px;
}

.nav-menu {
  flex: 1;
  margin: 0 40px;
  border: none;
}

.main-content {
  background-color: #f5f5f5;
  padding: 24px;
  min-height: calc(100vh - 124px);
}

.footer {
  background-color: #fff;
  border-top: 1px solid #e8e8e8;
  text-align: center;
  color: #999;
  padding: 20px 0;
  height: 60px;
}
</style>
