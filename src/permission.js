import router from '@/router'
import store from '@/store'
import { ElMessage } from 'element-plus'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import getPageTitle from '@/utils/get-page-title'
import { getToken } from '@/utils/auth'
import Layout from '@/layout'
import preview from '@/views/report/preview/index.vue'
import {nextTick} from "vue";

NProgress.configure({
  showSpinner: false,
})

const whiteList = ['/login', '/oa'] // no redirect whitelist

export function initPermission(app) {
  router.beforeEach(async (to, from, next) => {
    NProgress.start()
    //addReportRouter(app, to)
    // set page title
    document.title = getPageTitle(to.meta.title)
    // determine whether the user has logged in
    const hasToken = getToken()
    if (to.path === '/appDownload' || to.apth === '/pendCheckChargingProduct') {
      //打开app下载页面时不做拦截
      next()
    } else {
      if (hasToken) {
        if (to.path === '/login') {
          next()
          NProgress.done()
        } else {
          await store.dispatch('permission/getControl')
          const hasRoles =
            store.state.permission.addRoutes &&
            store.state.permission.addRoutes.length > 0
          console.log(hasRoles)
          if (hasRoles) {
            next()
          } else {
            try {
              // generate accessible routes map based on roles
              const accessRoutes = await store.dispatch(
                'permission/generateRoutes'
              )

              await store.dispatch('permission/getUserPermissionCodes')
              console.log(121)
              console.log(accessRoutes)
              // dynamically add accessible routes
              accessRoutes.forEach((route) => {
                router.addRoute(route)
              })
              console.log(to)
              // hack method to ensure that addRoutes is complete
              // set the replace: true, so the navigation will not leave a history record
              next({
                ...to,
                replace: true,
              })
            } catch (error) {
              console.log(error)
              console.log(45454545)
              // remove token and go to login page to re-login
              await store.dispatch('user/resetToken')
              ElMessage.error(error || 'Has Error')
              logout(next, to)
              NProgress.done()
            }
          }
        }
      } else {
        /* has no token*/
        if (whiteList.indexOf(to.path) !== -1) {
          // in the free login whitelist, go directly
          next()
        } else {
          // other pages that do not have permission to access are redirected to the login page.
          logout(next, to)
          NProgress.done()
        }
      }
    }
  })

  router.afterEach(() => {
    // finish progress bar
    sessionStorage.removeItem('storeRowId')
    NProgress.done()
  })
}
function isChinese(s) {
  let reg = new RegExp('[\\u4E00-\\u9FFF]+', 'g')
  if (reg.test(s)) {
    return true
  } else {
    return false
  }
}
// 添加动态路由--报表菜单多开路由(缓存动态路由并且是ifream菜单)
function addReportRouter(app, to) {
  const path = to.fullPath
  const name = to.params.name

  const has_u = to.fullPath.includes('_u')
  if (to.fullPath.includes('/report/preview/') && has_u) {
    let iframeName = store.state.template.iframeName
    to.name = name
    iframeName.push(name)
    app.component(name, preview)
    store.commit('SET_IFRAMENAME', [...new Set(iframeName)])
    router.addRoute({
      name: name,
      path: '/report/preview',
      component: Layout,
      meta: {
        title: '报表预览',
      },
      children: [
        {
          path: to.fullPath,
          name: name,
          component: preview,
          meta: { title: '报表预览' },
        },
      ],
    })
    // 设置自定义报表tab名称
    if (isChinese(decodeURIComponent(path))) {
      to.meta.title = name
    }
  } else if (to.fullPath.includes('/report/preview') && has_u) {
    const name = to.query._u.split('slip-')[1].split('.ureport.xml')[0]
    let a = router.getRoutes()
    let currentRouter = router.getRoutes().find((element) => {
      return element.meta.title === name
    })
    if (currentRouter && currentRouter !== -1) {
      router.replace(currentRouter.path)
    }
    // 设置报表tab名称
    if (isChinese(decodeURIComponent(path))) {
      let title = '报表预览',
        perfix = 'slip-',
        reprotSuffix = '.ureport.xml',
        _u = to.query._u
      if (_u) {
        if (_u.includes(perfix)) {
          title = decodeURIComponent(_u.split(perfix)[1].split(reprotSuffix)[0])
        } else {
          title = decodeURIComponent(_u.split(reprotSuffix)[0])
        }
      }
      if (isChinese(title)) {
        to.meta.title = title
      }
    }
  }
}
function logout(next, to) {
  if (window.__POWERED_BY_WUJIE__) {
    window.$wujie?.bus.$emit('microAppLogout')
  } else {
    next(`/login?redirect=${to.path}`)
  }
}
