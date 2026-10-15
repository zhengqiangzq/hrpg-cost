import request from '@/utils/request'

export function pageDeptMedicalSettlementCostVolumeProfitAnalysis(data) {
    return request({
        url: '/dip/cvp/deptSettle',
        method: 'post',
        data
    })
}
export function analysisDeptMedicalSettlementCostVolumeProfitAnalysis(data) {
    return request({
        url: '/dip/cvp/dept/analysisSettle',
        method: 'post',
        data
    })
}
export function incomeDetail(data) {
    return request({
        url: '/dip/cvp/dept/incomeDetailSettle',
        method: 'post',
        data
    })
}
export function costDetail(data) {
    return request({
        url: '/dip/cvp/dept/costDetailSettle',
        method: 'post',
        data
    })
}
export function exportAnalysis(data) {
    return request({
        url: '/dip/cvp/dept/exportSettle',
        method: 'post',
        data,
        responseType: 'blob'
    })
}
export function exportIncomeDetail(data) {
    return request({
        url: '/dip/cvp/dept/export/incomeDetailSettle',
        method: 'post',
        data,
        responseType: 'blob'
    })
}
export function exportCostDetail(data) {
    return request({
        url: '/dip/cvp/dept/export/costDetailSettle',
        method: 'post',
        data,
        responseType: 'blob'
    })
}
