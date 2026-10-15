import request from '@/utils/request'

export function page(data) {
    return request({
        url: '/dept/trendHospitalCostItemAnalysis/hospitalCostCategoryTrend',
        method: 'post',
        data
    })
}

export function analysis(data) {
    return request({
        url: '/dept/trendHospitalCostItemAnalysis/view',
        method: 'post',
        data
    })
}

export function costDetail(data) {
    return request({
        url: '/dept/trendHospitalCostItemAnalysis/costList',
        method: 'post',
        data
    })
}

export function exportCostDetail(data) {
    return request({
        url: '/dept/trendHospitalCostItemAnalysis/exportCostList',
        method: 'post',
        data,
        responseType: 'blob'
    })
}

export function exportAnalysis(data) {
    return request({
        url: '/dept/trendHospitalCostItemAnalysis/exportHospitalCostItemTrend',
        method: 'post',
        data,
        responseType: 'blob'
    })
}