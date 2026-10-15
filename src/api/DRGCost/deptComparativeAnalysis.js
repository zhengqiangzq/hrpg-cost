import request from '@/utils/request'

export function pageDeptComparativeAnalysis(data) {
    return request({
        url: '/drg/contrastAnalysis/dept',
        method: 'post',
        data
    })
}
export function analysisDeptComparativeAnalysis(data) {
    return request({
        url: '/drg/contrastAnalysis/dept/analysis',
        method: 'post',
        data
    })
}
export function incomeDetail(data) {
    return request({
        url: '/drg/contrastAnalysis/dept/incomeDetail',
        method: 'post',
        data
    })
}
export function costDetail(data) {
    return request({
        url: '/drg/contrastAnalysis/dept/costDetail',
        method: 'post',
        data
    })
}
export function exportAnalysis(data) {
    return request({
        url: '/drg/contrastAnalysis/dept/export',
        method: 'post',
        data,
        responseType: 'blob'
    })
}
export function exportIncomeDetail(data) {
    return request({
        url: '/drg/contrastAnalysis/dept/export/incomeDetail',
        method: 'post',
        data,
        responseType: 'blob'
    })
}
export function exportCostDetail(data) {
    return request({
        url: '/drg/contrastAnalysis/dept/export/costDetail',
        method: 'post',
        data,
        responseType: 'blob'
    })
}