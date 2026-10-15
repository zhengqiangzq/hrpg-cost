import request from '@/utils/request'

export function page(data) {
    return request({
        url: '/dept/trendDeptCostItemAnalysis/deptCostTrend',
        method: 'post',
        data
    })
}

export function analysis(data) {
    return request({
        url: '/dept/trendDeptCostItemAnalysis/view',
        method: 'post',
        data
    })
}

export function costDetail(data) {
    return request({
        url: '/dept/trendDeptCostItemAnalysis/costList',
        method: 'post',
        data
    })
}

export function exportCostDetail(data) {
    return request({
        url: '/dept/trendDeptCostItemAnalysis/exportCostList',
        method: 'post',
        data,
        responseType: 'blob'
    })
}

export function exportAnalysis(data) {
    return request({
        url: '/dept/trendDeptCostItemAnalysis/exportDeptCostTrend',
        method: 'post',
        data,
        responseType: 'blob'
    })
}