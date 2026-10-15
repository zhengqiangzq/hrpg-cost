import request from '@/utils/request'

// 查询月结列表
export function pageMonthlyBalance(params) {
    return request({
        url: '/monthClose/queryList',
        method: 'get',
        params,
        btnCode: 'allocationCalcMonthlyBalance:list'
    })
}
// 月结
export function closeMonthlyBalance(params) {
    return request({
        url: '/monthClose/close',
        method: 'get',
        params,
        btnCode: 'allocationCalcMonthlyBalance:checkout'
    })
}
// 取消月结
export function cancelCloseMonthlyBalance(params) {
    return request({
        url: '/monthClose/reClose',
        method: 'get',
        params,
        btnCode: 'allocationCalcMonthlyBalance:checkout'
    })
}
// 校验月结
export function closeCheckMonthlyBalance(params) {
    return request({
        url: '/monthClose/closeCheck',
        method: 'get',
        params,
        btnCode: 'allocationCalcMonthlyBalance:checkout'
    })
}
// 校验反月结
export function reCloseCheckMonthlyBalance(params) {
    return request({
        url: '/monthClose/reMonthCloseCheck',
        method: 'get',
        params,
        btnCode: 'allocationCalcMonthlyBalance:checkout'
    })
}
