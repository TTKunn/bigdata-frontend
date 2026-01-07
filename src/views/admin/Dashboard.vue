<template>
  <div class="dashboard-container">
    <div class="page-header">
      <h2>数据面板</h2>
      <p class="subtitle">欢迎使用商城管理后台</p>
    </div>

    <el-row :gutter="20">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon orders"><ShoppingCart /></el-icon>
            <div class="stat-info">
              <div class="stat-value">128</div>
              <div class="stat-label">订单总数</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon products"><Box /></el-icon>
            <div class="stat-info">
              <div class="stat-value">8</div>
              <div class="stat-label">商品总数</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon users"><User /></el-icon>
            <div class="stat-info">
              <div class="stat-value">456</div>
              <div class="stat-label">用户总数</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon revenue"><Money /></el-icon>
            <div class="stat-info">
              <div class="stat-value">¥98.5万</div>
              <div class="stat-label">总销售额</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="info-card">
      <template #header>
        <div class="card-header">
          <span>功能说明</span>
        </div>
      </template>
      <div class="info-content">
        <p>这是管理后台页面，后续可以在这里添加更多管理功能：</p>
        <ul>
          <li>订单管理</li>
          <li>商品管理（商品信息直接从数据库读取）</li>
          <li>数据统计</li>
          <li>系统设置</li>
        </ul>
        <el-alert
          type="info"
          :closable="false"
          style="margin-top: 16px;"
        >
          当前为静态展示页面，后续可以根据需要添加更多功能模块
        </el-alert>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ShoppingCart, Box, User, Money } from '@element-plus/icons-vue'
</script>

<style scoped>
.dashboard-container {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 32px;
  text-align: center;
}

.page-header h2 {
  font-size: 32px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.subtitle {
  font-size: 16px;
  color: #909399;
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

.stat-icon.products {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.users {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon.revenue {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
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

.info-card {
  margin-top: 20px;
}

.card-header {
  font-size: 18px;
  font-weight: 600;
}

.info-content {
  font-size: 15px;
  line-height: 1.8;
}

.info-content ul {
  margin: 12px 0;
  padding-left: 24px;
}

.info-content li {
  margin: 8px 0;
}
</style>
