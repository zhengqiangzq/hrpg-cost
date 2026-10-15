import request from '@/utils/request'

export function page(data) {
    return request({
        url: '/dept/compareHospitalCostCategoryAnalysis/hospitalCostCategoryCompare',
        method: 'post',
        data
    })
}

export function analysis(data) {
    return request({
        url: '/dept/compareHospitalCostCategoryAnalysis/view',
        method: 'post',
        data
    })
}

export function costDetail(data) {
    return request({
        url: '/dept/compareHospitalCostCategoryAnalysis/hospitalCostCategoryCompareCostList',
        method: 'post',
        data
    })
}

export function exportAnalysis(data) {
    return request({
        url: '/dept/compareHospitalCostCategoryAnalysis/exportHospitalCostCategoryCompare',
        method: 'post',
        data,
        responseType: 'blob'
    })
}

export function exportCostDetail(data) {
    return request({
        url: '/dept/compareHospitalCostCategoryAnalysis/exportHospitalCostCategoryCompareCostList',
        method: 'post',
        data,
        responseType: 'blob'
    })
}