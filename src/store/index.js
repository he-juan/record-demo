import Vue from 'vue'
import Vuex from 'vuex'

import state from "@/store/state/state.js"
import getters from "@/store/state/getters.js"
import actions from "@/store/state/actions.js"
import mutations from "@/store/state/mutations.js"
Vue.use(Vuex)

export default new Vuex.Store({
  state,
  getters,
  mutations,
  actions,
  modules: {

  }
})
