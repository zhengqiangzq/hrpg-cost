import request from '@/utils/request'
import router from '@/router'
const prePath = '/core'

//获取部门分页-树状结构
export function getDeptPage(data) {
  return request({
    url: '/department/queryPage',
    method: 'post',
    data,
  })
}

//获取全部系统设置
export function getCoreSystemConfigAll(params) {
  return request({
    url: prePath + '/systemConfig/all',
    method: 'get',
    params,
  })
}
//验证月结切换 type : 1 = 物资 2 = 资产
export function getCurrentFiscalPeriod(type) {
  return request({
    url: prePath + '/coreFiscalPeriod/getCurrentFiscalPeriod/' + type,
    method: 'get',
  })
}
// 购物车下单
export function shoppingCartPlaceOrder(data) {
  return request({
    url: prePath + '/shoppingCart/placeOrder',
    method: 'post',
    data,
  })
}
// 货物购物车列表
export function getShoppingCartAll(data) {
  return request({
    url: prePath + '/shoppingCart/all',
    method: 'post',
    data,
  })
}
// 购物车更新
export function shoppingCartByPostr(data) {
  return request({
    url: prePath + '/shoppingCart/byPost',
    method: 'post',
    data,
  })
}
// 购物车删除
export function delShoppingCart(id) {
  return request({
    url: prePath + '/shoppingCart/' + id,
    method: 'delete',
  })
}
// 购物车货物条数
export function getShoppingCartCount() {
  return request({
    url: prePath + '/shoppingCart/getCount',
    method: 'get',
  })
}

//获取全部待办
export function getScheduleTaskList(data) {
  return request({
    url: prePath + '/scheduleTask/selectToDo',
    method: 'post',
    data,
  })
}
