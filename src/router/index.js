import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/customer/home'
  },
  {
    path: '/customer',
    component: () => import('../components/CustomerLayout.vue'),
    children: [
      {
        path: 'home',
        name: 'CustomerHome',
        component: () => import('../views/customer/Home.vue')
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/customer/Dashboard.vue')
      },
      {
        path: 'cart',
        name: 'Cart',
        component: () => import('../views/customer/Cart.vue')
      },
      {
        path: 'orders',
        name: 'Orders',
        component: () => import('../views/customer/Orders.vue')
      },
      {
        path: 'orders/:id',
        name: 'OrderDetail',
        component: () => import('../views/customer/OrderDetail.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
