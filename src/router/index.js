import Vue from 'vue'
import VueRouter from 'vue-router'
// 导入Login组件
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import User from '../components/User/User.vue'
Vue.use(VueRouter)

const router = new VueRouter({
  routes: [
    {
      path: '/login',
      component: Login,
      name: 'login'
    },
    // 重定向
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/home',
      component: Home,
      name: 'home',
      redirect: '/welcome',
      children: [
        {
          name: 'welcome',
          path: '/welcome',
          component: Welcome
        },
        {
          name: 'users',
          path: '/Users',
          component: User
        }
      ]
    }
  ]
})

router.beforeEach((to, from, next) => {
  // to 将要访问的lujing
  // from 代表从哪个路径跳转而来
  // next() 放行
  if (to.path === '/login') return next()
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

export default router
