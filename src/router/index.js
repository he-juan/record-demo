import Vue from 'vue'
import VueRouter from 'vue-router'
import MainView from '../components/index/HomePage.vue'


Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'mainView',
    component: MainView
  },

]

const router = new VueRouter({
  routes
})

export default router
