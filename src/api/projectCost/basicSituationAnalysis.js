import request from '@/utils/request'

export function topGraphics(data) {
    return request({
        url: '/item/analysis/topGraphics',
        method: 'post',
        data
    })
}
export function bottomList(data) {
    return request({
        url: '/item/analysis/bottomList',
        method: 'post',
        data
    })
}
export function incomeDetail(data) {
    return request({
        url: '/item/analysis/bottomList/incomeDetail',
        method: 'post',
        data
    })
}
export function costDetail(data) {
    return request({
        url: '/item/analysis/bottomList/costDetail',
        method: 'post',
        data
    })
}
export function exportIncomeDetail(data) {
    return request({
        url: '/item/analysis/export/incomeDetail',
        method: 'post',
        data,
        responseType: 'blob'
    })
}
export function exportCostDetail(data) {
    return request({
        url: '/item/analysis/export/costDetail',
        method: 'post',
        data,
        responseType: 'blob'
    })
}