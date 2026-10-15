import request from '@/utils/request'

export function page(data) {
    return request({
        url: '/bedClinic/trendHospitalCostItemAnalysis/bed/hospitalCostItemTrend',
        method: 'post',
        data
    })
}

export function analysis(data) {
    return request({
        url: '/bedClinic/trendHospitalCostItemAnalysis/bed/view',
        method: 'post',
        data
    })
}

export function costDetail(data) {
    return request({
        url: '/bedClinic/trendHospitalCostItemAnalysis/bed/costList',
        method: 'post',
        data
    })
}

export function exportCostDetail(data) {
    return request({
        url: '/bedClinic/trendHospitalCostItemAnalysis/bed/exportCostList',
        method: 'post',
        data,
        responseType: 'blob'
    })
}

export function exportAnalysis(data) {
    return request({
        url: '/bedClinic/trendHospitalCostItemAnalysis/bed/exportHospitalCostItemTrend',
        method: 'post',
        data,
        responseType: 'blob'
    })
}