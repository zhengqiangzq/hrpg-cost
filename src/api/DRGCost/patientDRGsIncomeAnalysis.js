import request from '@/utils/request'

export function pagePatientDRGsIncomeAnalysis(data) {
    return request({
        url: '/drg/incomeAnalysis/patient',
        method: 'post',
        data
    })
}
export function analysisPatientDRGsIncomeAnalysis(data) {
    return request({
        url: '/drg/incomeAnalysis/patient/analysis',
        method: 'post',
        data
    })
}
export function incomeDetail(data) {
    return request({
        url: '/drg/incomeAnalysis/patient/incomeDetail',
        method: 'post',
        data
    })
}
export function costDetail(data) {
    return request({
        url: '/drg/incomeAnalysis/patient/costDetail',
        method: 'post',
        data
    })
}
export function exportAnalysis(data) {
    return request({
        url: '/drg/incomeAnalysis/patient/export',
        method: 'post',
        data,
        responseType: 'blob'
    })
}
export function exportIncomeDetail(data) {
    return request({
        url: '/drg/incomeAnalysis/patient/export/incomeDetail',
        method: 'post',
        data,
        responseType: 'blob'
    })
}
export function exportCostDetail(data) {
    return request({
        url: '/drg/incomeAnalysis/patient/export/costDetail',
        method: 'post',
        data,
        responseType: 'blob'
    })
}