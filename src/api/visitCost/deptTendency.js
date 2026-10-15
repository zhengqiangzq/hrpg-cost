import request from '@/utils/request'

export function page(data) {
    return request({
        url: '/bedClinic/trendDeptCostAnalysis/clinic/deptCostTrend',
        method: 'post',
        data
    })
}

export function analysis(data) {
    return request({
        url: '/bedClinic/trendDeptCostAnalysis/clinic/view',
        method: 'post',
        data
    })
}

export function costDetail(data) {
    return request({
        url: '/bedClinic/trendDeptCostAnalysis/clinic/costList',
        method: 'post',
        data
    })
}

export function exportCostDetail(data) {
    return request({
        url: '/bedClinic/trendDeptCostAnalysis/clinic/exportCostList',
        method: 'post',
        data,
        responseType: 'blob'
    })
}

export function exportAnalysis(data) {
    return request({
        url: '/bedClinic/trendDeptCostAnalysis/clinic/exportDeptCostTrend',
        method: 'post',
        data,
        responseType: 'blob'
    })
}