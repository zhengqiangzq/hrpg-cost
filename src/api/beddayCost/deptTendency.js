import request from '@/utils/request'

export function page(data) {
    return request({
        url: '/bedClinic/trendDeptCostAnalysis/bed/deptCostTrend',
        method: 'post',
        data
    })
}

export function analysis(data) {
    return request({
        url: '/bedClinic/trendDeptCostAnalysis/bed/view',
        method: 'post',
        data
    })
}

export function costDetail(data) {
    return request({
        url: '/bedClinic/trendDeptCostAnalysis/bed/costList',
        method: 'post',
        data
    })
}

export function exportCostDetail(data) {
    return request({
        url: '/bedClinic/trendDeptCostAnalysis/bed/exportCostList',
        method: 'post',
        data,
        responseType: 'blob'
    })
}

export function exportAnalysis(data) {
    return request({
        url: '/bedClinic/trendDeptCostAnalysis/bed/exportDeptCostTrend',
        method: 'post',
        data,
        responseType: 'blob'
    })
}