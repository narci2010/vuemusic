import Vue from 'vue'
import Vuex from 'vuex'
import * as actions from './action'
import * as getters from './getters'
import state from './state'
import mutations from './mutations'
// 该插件会在每次调用mutation修改state的时候打印修改的上下文
import createLogger from 'vuex/dist/logger'

Vue.use(Vuex)

// 线下调试的时候是严格模式，检测state是不是通过mutation修改的
// 上线后肯定就不用这个了，所以判断一下环境变量
const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
  actions,
  getters,
  state,
  mutations,
  strict: debug,
  plugins: debug ? [createLogger()] : []
})
