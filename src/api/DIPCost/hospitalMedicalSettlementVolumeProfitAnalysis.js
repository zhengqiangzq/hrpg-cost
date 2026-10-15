import request from '@/utils/request'

export function pageHospitalMedicalSettlementCostVolumeProfitAnalysis(data) {
    return request({
        url: '/dip/cvp/hospitalSettle',
        method: 'post',
        data
    })
}
export function analysisHospitalMedicalSettlementCostVolumeProfitAnalysis(data) {
    return request({
        url: '/dip/cvp/hospital/analysisSettle',
        method: 'post',
        data
    })
}
export function incomeDetail(data) {
    return request({
        url: '/dip/cvp/hospital/incomeDetailSettle',
        method: 'post',
        data
    })
}
export function costDetail(data) {
    return request({
        url: '/dip/cvp/hospital/costDetailSettle',
        method: 'post',
        data
    })
}
export function exportAnalysis(data) {
    return request({
        url: '/dip/cvp/hospital/exportSettle',
        method: 'post',
        data,
        responseType: 'blob'
    })
}
export function exportIncomeDetail(data) {
    return request({
        url: '/dip/cvp/hospital/export/incomeDetailSettle',
        method: 'post',
        data,
        responseType: 'blob'
    })
}
export function exportCostDetail(data) {
    return request({
        url: '/dip/cvp/hospital/export/costDetailSettle',
        method: 'post',
        data,
        responseType: 'blob'
    })
}
