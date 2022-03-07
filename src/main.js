import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入全局样式表
import '../src/assets/css/global.css'
//
import '../src/assets/fonts/iconfont.css'
// 导入axios
import axios, { Axios } from 'axios'
//导入TreeTable
import TreeTable from 'vue-table-with-tree-grid'
// 使用TreeTable
Vue.component('tree-table', TreeTable)
// 挂载
Vue.prototype.$http = axios
axios.interceptors.request.use((config) => {
  console.log(config)
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 固定写法，必须返回config
  return config
})
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 关闭生产提示
Vue.config.productionTip = false

new Vue({
  router,
  render: (h) => h(App),
}).$mount('#app')
