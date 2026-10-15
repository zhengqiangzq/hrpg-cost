import request from '@/utils/request'

export function page(data) {
    return request({
        url: '/bedClinic/compareDeptCostCategoryAnalysis/clinic/depCostCategoryCompare',
        method: 'post',
        data
    })
}

export function analysis(data) {
    return request({
        url: '/bedClinic/compareDeptCostCategoryAnalysis/clinic/view',
        method: 'post',
        data
    })
}

export function costDetail(data) {
    return request({
        url: '/bedClinic/compareDeptCostCategoryAnalysis/clinic/costList',
        method: 'post',
        data
    })
}

export function exportCostDetail(data) {
    return request({
        url: '/bedClinic/compareDeptCostCategoryAnalysis/clinic/exportCostList',
        method: 'post',
        data,
        responseType: 'blob'
    })
}

export function exportAnalysis(data) {
    return request({
        url: '/bedClinic/compareDeptCostCategoryAnalysis/clinic/exportHospitalCostCategoryCompare',
        method: 'post',
        data,
        responseType: 'blob'
    })
}