/**
 * 基础API服务类
 * 提供统一的HTTP请求封装和错误处理
 */

const API_BASE_URL = 'http://localhost:8080/api'

class ApiService {
  /**
   * 统一的HTTP请求方法
   * @param {string} endpoint - API端点路径
   * @param {object} options - 请求选项
   * @returns {Promise<any>} 响应数据
   */
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`

    // 默认请求配置
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    }

    // 如果有请求体且是对象，转换为JSON字符串
    if (defaultOptions.body && typeof defaultOptions.body === 'object') {
      defaultOptions.body = JSON.stringify(defaultOptions.body)
    }

    try {
      console.log(`API Request: ${defaultOptions.method || 'GET'} ${url}`)

      const response = await fetch(url, defaultOptions)
      const data = await response.json()

      console.log(`API Response: ${response.status}`, data)

      // 检查响应状态码
      if (response.status >= 400) {
        throw new Error(data.message || `HTTP ${response.status} 错误`)
      }

      // 检查业务状态码
      if (data.code !== 200) {
        throw new Error(data.message || '请求失败')
      }

      // 返回实际数据
      return data.data
    } catch (error) {
      console.error('API请求失败:', error)

      // 重新抛出错误，让调用方处理
      throw error
    }
  }

  /**
   * GET请求
   * @param {string} endpoint - API端点
   * @param {object} params - 查询参数
   * @returns {Promise<any>}
   */
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString()
    const url = queryString ? `${endpoint}?${queryString}` : endpoint

    return this.request(url, {
      method: 'GET'
    })
  }

  /**
   * POST请求
   * @param {string} endpoint - API端点
   * @param {object} data - 请求体数据
   * @returns {Promise<any>}
   */
  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: data
    })
  }

  /**
   * PUT请求
   * @param {string} endpoint - API端点
   * @param {object} data - 请求体数据
   * @returns {Promise<any>}
   */
  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: data
    })
  }

  /**
   * DELETE请求 (查询参数)
   * @param {string} endpoint - API端点
   * @param {object} params - 查询参数
   * @returns {Promise<any>}
   */
  async delete(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString()
    const url = queryString ? `${endpoint}?${queryString}` : endpoint

    return this.request(url, {
      method: 'DELETE'
    })
  }

  /**
   * DELETE请求 (请求体)
   * @param {string} endpoint - API端点
   * @param {object} data - 请求体数据
   * @returns {Promise<any>}
   */
  async deleteWithBody(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'DELETE',
      body: data
    })
  }
}

// 创建单例实例
export const apiService = new ApiService()
