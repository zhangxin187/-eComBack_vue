import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 公共的css样式
import '../src/assets/css/common.css'
import axios from 'axios'
// 配置axios,接口文档规定的基准路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
Vue.prototype.$http = axios

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
