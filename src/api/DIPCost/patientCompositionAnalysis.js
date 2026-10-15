import request from '@/utils/request'

export function pagePatientCompositionAnalysis(data) {
    return request({
        url: '/dip/constituteAnalysis/patient',
        method: 'post',
        data
    })
}
export function analysisPatientCompositionAnalysis(data) {
    return request({
        url: '/dip/constituteAnalysis/patient/analysis',
        method: 'post',
        data
    })
}
export function incomeDetail(data) {
    return request({
        url: '/dip/constituteAnalysis/patient/incomeDetail',
        method: 'post',
        data
    })
}
export function costDetail(data) {
    return request({
        url: '/dip/constituteAnalysis/patient/costDetail',
        method: 'post',
        data
    })
}
export function exportAnalysis(data) {
    return request({
        url: '/dip/constituteAnalysis/patient/export',
        method: 'post',
        data,
        responseType: 'blob'
    })
}
export function exportIncomeDetail(data) {
    return request({
        url: '/dip/constituteAnalysis/patient/export/incomeDetail',
        method: 'post',
        data,
        responseType: 'blob'
    })
}
export function exportCostDetail(data) {
    return request({
        url: '/dip/constituteAnalysis/patient/export/costDetail',
        method: 'post',
        data,
        responseType: 'blob'
    })
}
