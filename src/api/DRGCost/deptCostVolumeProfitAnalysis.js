import request from '@/utils/request'

export function pageDeptCostVolumeProfitAnalysis(data) {
    return request({
        url: '/drg/cvp/dept',
        method: 'post',
        data
    })
}
export function analysisDeptCostVolumeProfitAnalysis(data) {
    return request({
        url: '/drg/cvp/dept/analysis',
        method: 'post',
        data
    })
}
export function incomeDetail(data) {
    return request({
        url: '/drg/cvp/dept/incomeDetail',
        method: 'post',
        data
    })
}
export function costDetail(data) {
    return request({
        url: '/drg/cvp/dept/costDetail',
        method: 'post',
        data
    })
}
export function exportAnalysis(data) {
    return request({
        url: '/drg/cvp/dept/export',
        method: 'post',
        data,
        responseType: 'blob'
    })
}
export function exportIncomeDetail(data) {
    return request({
        url: '/drg/cvp/dept/export/incomeDetail',
        method: 'post',
        data,
        responseType: 'blob'
    })
}
export function exportCostDetail(data) {
    return request({
        url: '/drg/cvp/dept/export/costDetail',
        method: 'post',
        data,
        responseType: 'blob'
    })
}