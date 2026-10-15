import request from '@/utils/request'

export function page(data) {
    return request({
        url: '/dept/compareHospitalCostItemAnalysisRange/hospitalCostItemCompare',
        method: 'post',
        data
    })
}

export function analysis(data) {
    return request({
        url: '/dept/compareHospitalCostItemAnalysisRange/view',
        method: 'post',
        data
    })
}

export function costDetail(data) {
    return request({
        url: '/dept/compareHospitalCostItemAnalysisRange/hospitalCostItemCompareCostList',
        method: 'post',
        data
    })
}

export function exportCostDetail(data) {
    return request({
        url: '/dept/compareHospitalCostItemAnalysisRange/exportHospitalCostItemCompareCostList',
        method: 'post',
        data,
        responseType: 'blob'
    })
}

export function exportAnalysis(data) {
    return request({
        url: '/dept/compareHospitalCostItemAnalysisRange/exportHospitalCostItemCompare',
        method: 'post',
        data,
        responseType: 'blob'
    })
}
