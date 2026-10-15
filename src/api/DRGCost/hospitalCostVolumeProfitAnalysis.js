import request from '@/utils/request'

export function pageHospitalCostVolumeProfitAnalysis(data) {
    return request({
        url: '/drg/cvp/hospital',
        method: 'post',
        data
    })
}
export function analysisHospitalCostVolumeProfitAnalysis(data) {
    return request({
        url: '/drg/cvp/hospital/analysis',
        method: 'post',
        data
    })
}
export function incomeDetail(data) {
    return request({
        url: '/drg/cvp/hospital/incomeDetail',
        method: 'post',
        data
    })
}
export function costDetail(data) {
    return request({
        url: '/drg/cvp/hospital/costDetail',
        method: 'post',
        data
    })
}
export function exportAnalysis(data) {
    return request({
        url: '/drg/cvp/hospital/export',
        method: 'post',
        data,
        responseType: 'blob'
    })
}
export function exportIncomeDetail(data) {
    return request({
        url: '/drg/cvp/hospital/export/incomeDetail',
        method: 'post',
        data,
        responseType: 'blob'
    })
}
export function exportCostDetail(data) {
    return request({
        url: '/drg/cvp/hospital/export/costDetail',
        method: 'post',
        data,
        responseType: 'blob'
    })
}