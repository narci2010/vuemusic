import 'babel-polyfill'

import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'

import fastclick from 'fastclick'
import vueLazyload from 'vue-lazyload'


import 'common/scss/index.scss'

Vue.config.productionTip = false

fastclick.attach(document.body)
Vue.use(vueLazyload, {
  // 设置占位图片
  loading: require('common/image/palceholder.png')
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
