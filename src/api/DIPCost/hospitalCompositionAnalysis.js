import request from '@/utils/request'

export function pageHospitalCompositionAnalysis(data) {
    return request({
        url: '/dip/constituteAnalysis/hospital',
        method: 'post',
        data
    })
}
export function analysisHospitalCompositionAnalysis(data) {
    return request({
        url: '/dip/constituteAnalysis/hospital/analysis',
        method: 'post',
        data
    })
}
export function incomeDetail(data) {
    return request({
        url: '/dip/constituteAnalysis/hospital/incomeDetail',
        method: 'post',
        data
    })
}
export function costDetail(data) {
    return request({
        url: '/dip/constituteAnalysis/hospital/costDetail',
        method: 'post',
        data
    })
}
export function exportAnalysis(data) {
    return request({
        url: '/dip/constituteAnalysis/hospital/export',
        method: 'post',
        data,
        responseType: 'blob'
    })
}
export function exportIncomeDetail(data) {
    return request({
        url: '/dip/constituteAnalysis/hospital/export/incomeDetail',
        method: 'post',
        data,
        responseType: 'blob'
    })
}
export function exportCostDetail(data) {
    return request({
        url: '/dip/constituteAnalysis/hospital/export/costDetail',
        method: 'post',
        data,
        responseType: 'blob'
    })
}
