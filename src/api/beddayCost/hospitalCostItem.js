import request from '@/utils/request'

export function page(data) {
    return request({
        url: '/bedClinic/compareHospitalCostItemAnalysis/bed/hospitalCostItemCompare',
        method: 'post',
        data
    })
}

export function analysis(data) {
    return request({
        url: '/bedClinic/compareHospitalCostItemAnalysis/bed/view',
        method: 'post',
        data
    })
}

export function costDetail(data) {
    return request({
        url: '/bedClinic/compareHospitalCostItemAnalysis/bed/costList',
        method: 'post',
        data
    })
}

export function exportCostDetail(data) {
    return request({
        url: '/bedClinic/compareHospitalCostItemAnalysis/bed/exportCostList',
        method: 'post',
        data,
        responseType: 'blob'
    })
}

export function exportAnalysis(data) {
    return request({
        url: '/bedClinic/compareHospitalCostItemAnalysis/bed/exportHospitalCostItemCompare',
        method: 'post',
        data,
        responseType: 'blob'
    })
}