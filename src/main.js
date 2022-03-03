import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import "./plugins/element.js";
//导入全局样式表
import "../src/assets/css/global.css";
//
import "../src/assets/fonts/iconfont.css";
//导入axios
import axios from "axios";
//挂载
Vue.prototype.$http = axios;
axios.defaults.baseURL = "http://127.0.0.1:8888/api/private/v1/";
// 关闭生产提示
Vue.config.productionTip = false;

new Vue({
  router,
  render: (h) => h(App),
}).$mount("#app");
