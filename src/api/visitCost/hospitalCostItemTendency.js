import request from '@/utils/request'

export function page(data) {
    return request({
        url: '/bedClinic/trendHospitalCostItemAnalysis/clinic/hospitalCostItemTrend',
        method: 'post',
        data
    })
}

export function analysis(data) {
    return request({
        url: '/bedClinic/trendHospitalCostItemAnalysis/clinic/view',
        method: 'post',
        data
    })
}

export function costDetail(data) {
    return request({
        url: '/bedClinic/trendHospitalCostItemAnalysis/clinic/costList',
        method: 'post',
        data
    })
}

export function exportCostDetail(data) {
    return request({
        url: '/bedClinic/trendHospitalCostItemAnalysis/clinic/exportCostList',
        method: 'post',
        data,
        responseType: 'blob'
    })
}

export function exportAnalysis(data) {
    return request({
        url: '/bedClinic/trendHospitalCostItemAnalysis/clinic/exportHospitalCostItemTrend',
        method: 'post',
        data,
        responseType: 'blob'
    })
}