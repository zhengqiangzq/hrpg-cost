import request from '@/utils/request'

export function page(data) {
    return request({
        url: '/bedClinic/trendHospitalCostCategoryAnalysis/bed/hospitalCostCategoryTrend',
        method: 'post',
        data
    })
}

export function analysis(data) {
    return request({
        url: '/bedClinic/trendHospitalCostCategoryAnalysis/bed/view',
        method: 'post',
        data
    })
}

export function costDetail(data) {
    return request({
        url: '/bedClinic/trendHospitalCostCategoryAnalysis/bed/costList',
        method: 'post',
        data
    })
}

export function exportCostDetail(data) {
    return request({
        url: '/bedClinic/trendHospitalCostCategoryAnalysis/bed/exportCostList',
        method: 'post',
        data,
        responseType: 'blob'
    })
}

export function exportAnalysis(data) {
    return request({
        url: '/bedClinic/trendHospitalCostCategoryAnalysis/bed/exportHospitalCostCategoryTrend',
        method: 'post',
        data,
        responseType: 'blob'
    })
}