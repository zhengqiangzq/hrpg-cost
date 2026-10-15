import request from '@/utils/request'

export function topGraphics(data) {
    return request({
        url: '/drg/analysis/topGraphics',
        method: 'post',
        data
    })
}
export function bottomList(data) {
    return request({
        url: '/drg/analysis/bottomList',
        method: 'post',
        data
    })
}
export function incomeDetail(data) {
    return request({
        url: '/drg/analysis/bottomList/incomeDetail',
        method: 'post',
        data
    })
}
export function costDetail(data) {
    return request({
        url: '/drg/analysis/bottomList/costDetail',
        method: 'post',
        data
    })
}
export function exportIncomeDetail(data) {
    return request({
        url: '/drg/analysis/export/incomeDetail',
        method: 'post',
        data,
        responseType: 'blob'
    })
}
export function exportCostDetail(data) {
    return request({
        url: '/drg/analysis/export/costDetail',
        method: 'post',
        data,
        responseType: 'blob'
    })
}