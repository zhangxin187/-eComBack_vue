import Vue from 'vue'
import {
  Button,
  Form,
  FormItem,
  Input,
  Message,
  Header,
  Main,
  Aside,
  Container,
  Menu,
  MenuItem,
  Submenu
} from 'element-ui'

// 将组件全局注册到Vue上，导入的这些组件其实是elementUI封装好的Vue组件
Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
Vue.use(Header)
Vue.use(Main)
Vue.use(Aside)
Vue.use(Container)
Vue.use(Menu)
Vue.use(MenuItem)
Vue.use(Submenu)
// 需要将Message添加到Vue的prototype上,这样在每个vue组件都可以使用Message组件的方法
Vue.prototype.$message = Message
