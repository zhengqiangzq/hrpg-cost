import request from '@/utils/request'

export function pageHospitalComparativeAnalysis(data) {
    return request({
        url: '/disease/contrastAnalysis/hospital',
        method: 'post',
        data
    })
}
export function analysisHospitalComparativeAnalysis(data) {
    return request({
        url: '/disease/contrastAnalysis/hospital/analysis',
        method: 'post',
        data
    })
}
export function incomeDetail(data) {
    return request({
        url: '/disease/contrastAnalysis/hospital/incomeDetail',
        method: 'post',
        data
    })
}
export function costDetail(data) {
    return request({
        url: '/disease/contrastAnalysis/hospital/costDetail',
        method: 'post',
        data
    })
}
export function exportAnalysis(data) {
    return request({
        url: '/disease/contrastAnalysis/hospital/export',
        method: 'post',
        data,
        responseType: 'blob'
    })
}
export function exportIncomeDetail(data) {
    return request({
        url: '/disease/contrastAnalysis/hospital/export/incomeDetail',
        method: 'post',
        data,
        responseType: 'blob'
    })
}
export function exportCostDetail(data) {
    return request({
        url: '/disease/contrastAnalysis/hospital/export/costDetail',
        method: 'post',
        data,
        responseType: 'blob'
    })
}