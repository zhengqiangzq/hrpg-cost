import request from '@/utils/request'

export function pageDoctorDRGsIncomeAnalysis(data) {
    return request({
        url: '/dip/incomeAnalysis/doctor',
        method: 'post',
        data
    })
}
export function analysisDoctorDRGsIncomeAnalysis(data) {
    return request({
        url: '/dip/incomeAnalysis/doctor/analysis',
        method: 'post',
        data
    })
}
export function incomeDetail(data) {
    return request({
        url: '/dip/incomeAnalysis/doctor/incomeDetail',
        method: 'post',
        data
    })
}
export function costDetail(data) {
    return request({
        url: '/dip/incomeAnalysis/doctor/costDetail',
        method: 'post',
        data
    })
}
export function exportAnalysis(data) {
    return request({
        url: '/dip/incomeAnalysis/doctor/export',
        method: 'post',
        data,
        responseType: 'blob'
    })
}
export function exportIncomeDetail(data) {
    return request({
        url: '/dip/incomeAnalysis/doctor/export/incomeDetail',
        method: 'post',
        data,
        responseType: 'blob'
    })
}
export function exportCostDetail(data) {
    return request({
        url: '/dip/incomeAnalysis/doctor/export/costDetail',
        method: 'post',
        data,
        responseType: 'blob'
    })
}
