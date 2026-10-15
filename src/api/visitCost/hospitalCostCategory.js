import request from '@/utils/request'

export function page(data) {
    return request({
        url: '/bedClinic/compareHospitalCostCategoryAnalysis/clinic/hospitalCostCategoryCompare',
        method: 'post',
        data
    })
}

export function analysis(data) {
    return request({
        url: '/bedClinic/compareHospitalCostCategoryAnalysis/clinic/view',
        method: 'post',
        data
    })
}

export function costDetail(data) {
    return request({
        url: '/bedClinic/compareHospitalCostCategoryAnalysis/clinic/costList',
        method: 'post',
        data
    })
}

export function exportAnalysis(data) {
    return request({
        url: '/bedClinic/compareHospitalCostCategoryAnalysis/clinic/exportHospitalCostCategoryCompare',
        method: 'post',
        data,
        responseType: 'blob'
    })
}

export function exportCostDetail(data) {
    return request({
        url: '/bedClinic/compareHospitalCostCategoryAnalysis/clinic/exportCostList',
        method: 'post',
        data,
        responseType: 'blob'
    })
}