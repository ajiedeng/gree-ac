import Vue from 'vue'
import Router from 'vue-router'
import Main from '@/page/main/index'
import AutoUDSet from '@/page/AutoUDSet/index'
import AutoLRSet from '@/page/AutoLRSet/index';
Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/autoUp',
      name: 'AutoUDSet',
      component: AutoUDSet
    },
    {
      path: '/autoLr',
      name: 'AutoLRSet',
      component: AutoLRSet
    },
    {
      path: '/',
      name: 'Main',
      component: Main
    }
  ]
})
