import Vue from 'vue'
import { Button, Form, FormItem, Input, Message } from 'element-ui'

Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
// Message消息提示的使用,需要将Message添加到Vue的prototype上,这样在每个组件都可以使用消息提示的方法
Vue.prototype.$message = Message
