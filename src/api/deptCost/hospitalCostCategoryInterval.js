import request from '@/utils/request'

export function page(data) {
    return request({
        url: '/dept/compareHospitalCostCategoryAnalysisRange/hospitalCostCategoryCompare',
        method: 'post',
        data
    })
}

export function analysis(data) {
    return request({
        url: '/dept/compareHospitalCostCategoryAnalysisRange/view',
        method: 'post',
        data
    })
}

export function costDetail(data) {
    return request({
        url: '/dept/compareHospitalCostCategoryAnalysisRange/hospitalCostCategoryCompareCostList',
        method: 'post',
        data
    })
}

export function exportAnalysis(data) {
    return request({
        url: '/dept/compareHospitalCostCategoryAnalysisRange/exportHospitalCostCategoryCompare',
        method: 'post',
        data,
        responseType: 'blob'
    })
}

export function exportCostDetail(data) {
    return request({
        url: '/dept/compareHospitalCostCategoryAnalysisRange/exportHospitalCostCategoryCompareCostList',
        method: 'post',
        data,
        responseType: 'blob'
    })
}
