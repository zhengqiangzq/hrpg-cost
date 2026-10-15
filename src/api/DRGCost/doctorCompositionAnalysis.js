import request from '@/utils/request'

export function pageDoctorCompositionAnalysis(data) {
    return request({
        url: '/drg/constituteAnalysis/doctor',
        method: 'post',
        data
    })
}
export function analysisDoctorCompositionAnalysis(data) {
    return request({
        url: '/drg/constituteAnalysis/doctor/analysis',
        method: 'post',
        data
    })
}
export function incomeDetail(data) {
    return request({
        url: '/drg/constituteAnalysis/doctor/incomeDetail',
        method: 'post',
        data
    })
}
export function costDetail(data) {
    return request({
        url: '/drg/constituteAnalysis/doctor/costDetail',
        method: 'post',
        data
    })
}
export function exportAnalysis(data) {
    return request({
        url: '/drg/constituteAnalysis/doctor/export',
        method: 'post',
        data,
        responseType: 'blob'
    })
}
export function exportIncomeDetail(data) {
    return request({
        url: '/drg/constituteAnalysis/doctor/export/incomeDetail',
        method: 'post',
        data,
        responseType: 'blob'
    })
}
export function exportCostDetail(data) {
    return request({
        url: '/drg/constituteAnalysis/doctor/export/costDetail',
        method: 'post',
        data,
        responseType: 'blob'
    })
}