import request from '@/utils/request'

export function page(data) {
    return request({
        url: '/dept/compareHospitalCostItemAnalysis/hospitalCostItemCompare',
        method: 'post',
        data
    })
}

export function analysis(data) {
    return request({
        url: '/dept/compareHospitalCostItemAnalysis/view',
        method: 'post',
        data
    })
}

export function costDetail(data) {
    return request({
        url: '/dept/compareHospitalCostItemAnalysis/hospitalCostItemCompareCostList',
        method: 'post',
        data
    })
}

export function exportCostDetail(data) {
    return request({
        url: '/dept/compareHospitalCostItemAnalysis/exportHospitalCostItemCompareCostList',
        method: 'post',
        data,
        responseType: 'blob'
    })
}

export function exportAnalysis(data) {
    return request({
        url: '/dept/compareHospitalCostItemAnalysis/exportHospitalCostItemCompare',
        method: 'post',
        data,
        responseType: 'blob'
    })
}