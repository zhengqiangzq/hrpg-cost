import request from '@/utils/request'

export function pagePatientDRGsIncomeAnalysis(data) {
    return request({
        url: '/disease/incomeAnalysis/patient',
        method: 'post',
        data
    })
}
export function analysisPatientDRGsIncomeAnalysis(data) {
    return request({
        url: '/disease/incomeAnalysis/patient/analysis',
        method: 'post',
        data
    })
}
export function incomeDetail(data) {
    return request({
        url: '/disease/incomeAnalysis/patient/incomeDetail',
        method: 'post',
        data
    })
}
export function costDetail(data) {
    return request({
        url: '/disease/incomeAnalysis/patient/costDetail',
        method: 'post',
        data
    })
}
export function exportAnalysis(data) {
    return request({
        url: '/disease/incomeAnalysis/patient/export',
        method: 'post',
        data,
        responseType: 'blob'
    })
}
export function exportIncomeDetail(data) {
    return request({
        url: '/disease/incomeAnalysis/patient/export/incomeDetail',
        method: 'post',
        data,
        responseType: 'blob'
    })
}
export function exportCostDetail(data) {
    return request({
        url: '/disease/incomeAnalysis/patient/export/costDetail',
        method: 'post',
        data,
        responseType: 'blob'
    })
}