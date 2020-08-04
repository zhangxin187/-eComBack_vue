import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入阿里字体图标的样式
import './assets/fonts/iconfont.css'
// 全局的css样式
import '../src/assets/css/common.css'
import axios from 'axios'
// 导入富文本编辑器，第三方依赖插件
import VueQuillEditor from 'vue-quill-editor'
// 导入富文本编辑器的样式
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css'// for bubble theme
// 导入lodash
import _ from 'lodash'
// 将lodash挂载到Vue的原型对象上
Vue.prototype._ = _

Vue.use(VueQuillEditor)
// 配置axios,接口文档规定的基准路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
axios.interceptors.request.use((config) => {
  config.headers.Authorization = sessionStorage.getItem('token')
  return config
})
Vue.prototype.$http = axios
// 自定义全局过滤器
Vue.filter('dateFormat', (date) => {
  // 该过滤器用来处理日期格式
  // new Date将字符串格式日期、时间戳等转为标准日期，标准日期显示给用户并不友好
  var date1 = new Date(date)
  // 将标准日期处理成 yyyy-mm-dd 的格式
  // padStart()用于字符串头部补全,第一个参数指定字符串的长度,第二个参数指定用来补全的字符串
  // 获取的时间都是Number类型，故需要转为字符串的格式，然后使用padStart()方法
  var y = date1.getFullYear()
  var m = (date1.getMonth() + 1 + '').padStart(2, '0')
  var d = (date1.getDate() + '').padStart(2, '0')
  var hh = (date1.getHours() + '').padStart(2, '0')
  var mm = (date1.getMinutes() + '').padStart(2, '0')
  var ss = (date1.getSeconds() + '').padStart(2, '0')
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})
Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
