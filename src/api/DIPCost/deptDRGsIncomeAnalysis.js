import request from '@/utils/request'

export function pageDeptDRGsIncomeAnalysis(data) {
    return request({
        url: '/dip/incomeAnalysis/dept',
        method: 'post',
        data
    })
}
export function analysisDeptDRGsIncomeAnalysis(data) {
    return request({
        url: '/dip/incomeAnalysis/dept/analysis',
        method: 'post',
        data
    })
}
export function incomeDetail(data) {
    return request({
        url: '/dip/incomeAnalysis/dept/incomeDetail',
        method: 'post',
        data
    })
}
export function costDetail(data) {
    return request({
        url: '/dip/incomeAnalysis/dept/costDetail',
        method: 'post',
        data
    })
}
export function exportAnalysis(data) {
    return request({
        url: '/dip/incomeAnalysis/dept/export',
        method: 'post',
        data,
        responseType: 'blob'
    })
}
export function exportIncomeDetail(data) {
    return request({
        url: '/dip/incomeAnalysis/dept/export/incomeDetail',
        method: 'post',
        data,
        responseType: 'blob'
    })
}
export function exportCostDetail(data) {
    return request({
        url: '/dip/incomeAnalysis/dept/export/costDetail',
        method: 'post',
        data,
        responseType: 'blob'
    })
}
