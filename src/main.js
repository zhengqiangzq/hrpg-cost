import { createApp } from 'vue'

import Cookies from 'js-cookie'

import App from './App'
import store from './store'
import router from './router'
import directive from './directive' // directive
import request from '@/utils/request'
import ElementPlus from 'element-plus'
import print from 'vue3-print-nb'
// import 'element-plus/theme-chalk/index.css'
import locale from 'element-plus/es/locale/lang/zh-cn' // 中文语言
import prototype from '@/common/js/prototype' // 挂载在原型上的方法
import widgets from '@/components/Print/widgets/index.js'
// 用于缓存项目中使用iframe的菜单缓存
import { installIframe, iframeName } from '@/layout/components/iframe.js'
import 'highlight.js/styles/atom-one-light.min.css'
import hljs from 'highlight.js/lib/core';
import json from 'highlight.js/lib/languages/json';
import SQL from 'highlight.js/lib/languages/sql'
import hljsVuePlugin from "@highlightjs/vue-plugin";

hljs.registerLanguage('json', json);
hljs.registerLanguage('sql', SQL);

// 判断taken和用户信息进行页面重定向拦截
import '@/utils/error-log' // error log
import { initPermission } from './permission'
import '@/utils/sign'
//import './permission'
import * as Icons from '@element-plus/icons-vue' // 引入所有图标，并命名为 Icons
// svg图标
import 'virtual:svg-icons-register'
// src/components全局遍历注册组件方法,不再需要每个页面进行import导入和注册
import components from '@/components'
import i18n from './lang'
store.commit('SET_IFRAMENAME', iframeName)

const app = createApp(App)

// 通过遍历的方式注册所有 svg组件
for (let i in Icons) {
  app.component(i, Icons[i])
}

// 全局方法挂载
app.config.globalProperties.$request = request
app.use(i18n)
app.use(router)
app.use(store)
app.use(components)
app.use(prototype)
app.use(widgets)
app.use(installIframe)
app.use(print)
app.use(initPermission)
app.use(hljsVuePlugin)
directive(app)

// 使用element-plus 并且设置全局的大小
app.use(ElementPlus, {
  locale: locale,
  size: Cookies.get('size') || 'default',
})

app.mount('#app')
