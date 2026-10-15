import request from '@/utils/request'

export function pageDoctorCostVolumeProfitAnalysis(data) {
    return request({
        url: '/dip/cvp/doctor',
        method: 'post',
        data
    })
}
export function analysisDoctorCostVolumeProfitAnalysis(data) {
    return request({
        url: '/dip/cvp/doctor/analysis',
        method: 'post',
        data
    })
}
export function incomeDetail(data) {
    return request({
        url: '/dip/cvp/doctor/incomeDetail',
        method: 'post',
        data
    })
}
export function costDetail(data) {
    return request({
        url: '/dip/cvp/doctor/costDetail',
        method: 'post',
        data
    })
}
export function exportAnalysis(data) {
    return request({
        url: '/dip/cvp/doctor/export',
        method: 'post',
        data,
        responseType: 'blob'
    })
}
export function exportIncomeDetail(data) {
    return request({
        url: '/dip/cvp/doctor/export/incomeDetail',
        method: 'post',
        data,
        responseType: 'blob'
    })
}
export function exportCostDetail(data) {
    return request({
        url: '/dip/cvp/doctor/export/costDetail',
        method: 'post',
        data,
        responseType: 'blob'
    })
}
