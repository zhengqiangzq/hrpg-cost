import request from '@/utils/request'

export function page(data) {
    return request({
        url: '/bedClinic/compareHospitalCostCategoryAnalysis/bed/hospitalCostCategoryCompare',
        method: 'post',
        data
    })
}

export function analysis(data) {
    return request({
        url: '/bedClinic/compareHospitalCostCategoryAnalysis/bed/view',
        method: 'post',
        data
    })
}

export function costDetail(data) {
    return request({
        url: '/bedClinic/compareHospitalCostCategoryAnalysis/bed/costList',
        method: 'post',
        data
    })
}

export function exportAnalysis(data) {
    return request({
        url: '/bedClinic/compareHospitalCostCategoryAnalysis/bed/exportHospitalCostCategoryCompare',
        method: 'post',
        data,
        responseType: 'blob'
    })
}

export function exportCostDetail(data) {
    return request({
        url: '/bedClinic/compareHospitalCostCategoryAnalysis/bed/exportCostList',
        method: 'post',
        data,
        responseType: 'blob'
    })
}