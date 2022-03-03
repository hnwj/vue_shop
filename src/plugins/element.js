import Vue from 'vue'
// 导入message等组件
import { Message, Button, Form, FormItem, Input } from 'element-ui'
Vue.use(Button)
Vue.use(Input)
Vue.use(Form)
Vue.use(FormItem)
//把message属性挂载到Vue上去
Vue.prototype.$message = Message
