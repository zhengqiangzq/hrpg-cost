import request from '@/utils/request'

export function pageDoctorMedicalSettlementVolumeProfitAnalysis(data) {
    return request({
        url: '/drg/cvp/doctorSettle',
        method: 'post',
        data
    })
}
export function analysisDoctorMedicalSettlementVolumeProfitAnalysis(data) {
    return request({
        url: '/drg/cvp/doctor/analysisSettle',
        method: 'post',
        data
    })
}
export function incomeDetail(data) {
    return request({
        url: '/drg/cvp/doctor/incomeDetailSettle',
        method: 'post',
        data
    })
}
export function costDetail(data) {
    return request({
        url: '/drg/cvp/doctor/costDetailSettle',
        method: 'post',
        data
    })
}
export function exportAnalysis(data) {
    return request({
        url: '/drg/cvp/doctor/exportSettle',
        method: 'post',
        data,
        responseType: 'blob'
    })
}
export function exportIncomeDetail(data) {
    return request({
        url: '/drg/cvp/doctor/export/incomeDetailSettle',
        method: 'post',
        data,
        responseType: 'blob'
    })
}
export function exportCostDetail(data) {
    return request({
        url: '/drg/cvp/doctor/export/costDetailSettle',
        method: 'post',
        data,
        responseType: 'blob'
    })
}