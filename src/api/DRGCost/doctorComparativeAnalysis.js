import request from '@/utils/request'

export function pageDoctorComparativeAnalysis(data) {
    return request({
        url: '/drg/contrastAnalysis/doctor',
        method: 'post',
        data
    })
}
export function analysisDoctorComparativeAnalysis(data) {
    return request({
        url: '/drg/contrastAnalysis/doctor/analysis',
        method: 'post',
        data
    })
}
export function incomeDetail(data) {
    return request({
        url: '/drg/contrastAnalysis/doctor/incomeDetail',
        method: 'post',
        data
    })
}
export function costDetail(data) {
    return request({
        url: '/drg/contrastAnalysis/doctor/costDetail',
        method: 'post',
        data
    })
}
export function exportAnalysis(data) {
    return request({
        url: '/drg/contrastAnalysis/doctor/export',
        method: 'post',
        data,
        responseType: 'blob'
    })
}
export function exportIncomeDetail(data) {
    return request({
        url: '/drg/contrastAnalysis/doctor/export/incomeDetail',
        method: 'post',
        data,
        responseType: 'blob'
    })
}
export function exportCostDetail(data) {
    return request({
        url: '/drg/contrastAnalysis/doctor/export/costDetail',
        method: 'post',
        data,
        responseType: 'blob'
    })
}