import request from '@/utils/request'

export function page(data) {
    return request({
        url: '/bedClinic/compareHospitalCostItemAnalysis/clinic/hospitalCostItemCompare',
        method: 'post',
        data
    })
}

export function analysis(data) {
    return request({
        url: '/bedClinic/compareHospitalCostItemAnalysis/clinic/view',
        method: 'post',
        data
    })
}

export function costDetail(data) {
    return request({
        url: '/bedClinic/compareHospitalCostItemAnalysis/clinic/costList',
        method: 'post',
        data
    })
}

export function exportCostDetail(data) {
    return request({
        url: '/bedClinic/compareHospitalCostItemAnalysis/clinic/exportCostList',
        method: 'post',
        data,
        responseType: 'blob'
    })
}

export function exportAnalysis(data) {
    return request({
        url: '/bedClinic/compareHospitalCostItemAnalysis/clinic/exportHospitalCostItemCompare',
        method: 'post',
        data,
        responseType: 'blob'
    })
}