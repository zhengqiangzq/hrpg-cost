import request from '@/utils/request'

export function pageHospitalMedicalSettlementCostVolumeProfitAnalysis(data) {
    return request({
        url: '/drg/cvp/hospitalSettle',
        method: 'post',
        data
    })
}
export function analysisHospitalMedicalSettlementCostVolumeProfitAnalysis(data) {
    return request({
        url: '/drg/cvp/hospital/analysisSettle',
        method: 'post',
        data
    })
}
export function incomeDetail(data) {
    return request({
        url: '/drg/cvp/hospital/incomeDetailSettle',
        method: 'post',
        data
    })
}
export function costDetail(data) {
    return request({
        url: '/drg/cvp/hospital/costDetailSettle',
        method: 'post',
        data
    })
}
export function exportAnalysis(data) {
    return request({
        url: '/drg/cvp/hospital/exportSettle',
        method: 'post',
        data,
        responseType: 'blob'
    })
}
export function exportIncomeDetail(data) {
    return request({
        url: '/drg/cvp/hospital/export/incomeDetailSettle',
        method: 'post',
        data,
        responseType: 'blob'
    })
}
export function exportCostDetail(data) {
    return request({
        url: '/drg/cvp/hospital/export/costDetailSettle',
        method: 'post',
        data,
        responseType: 'blob'
    })
}