import request from '@/utils/request'

export function page(data) {
    return request({
        url: '/bedClinic/trendHospitalCostCategoryAnalysis/clinic/hospitalCostCategoryTrend',
        method: 'post',
        data
    })
}

export function analysis(data) {
    return request({
        url: '/bedClinic/trendHospitalCostCategoryAnalysis/clinic/view',
        method: 'post',
        data
    })
}

export function costDetail(data) {
    return request({
        url: '/bedClinic/trendHospitalCostCategoryAnalysis/clinic/costList',
        method: 'post',
        data
    })
}

export function exportCostDetail(data) {
    return request({
        url: '/bedClinic/trendHospitalCostCategoryAnalysis/clinic/exportCostList',
        method: 'post',
        data,
        responseType: 'blob'
    })
}

export function exportAnalysis(data) {
    return request({
        url: '/bedClinic/trendHospitalCostCategoryAnalysis/clinic/exportHospitalCostCategoryTrend',
        method: 'post',
        data,
        responseType: 'blob'
    })
}