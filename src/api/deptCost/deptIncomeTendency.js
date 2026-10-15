import request from '@/utils/request'

export function page(data) {
    return request({
        url: '/dept/trendDeptIncomeAnalysis/deptIncomeTrend',
        method: 'post',
        data
    })
}

export function analysis(data) {
    return request({
        url: '/dept/trendDeptIncomeAnalysis/view',
        method: 'post',
        data
    })
}

export function incomeDetail(data) {
    return request({
        url: '/dept/trendDeptIncomeAnalysis/incomeList',
        method: 'post',
        data
    })
}

export function exportIncomeDetail(data) {
    return request({
        url: '/dept/trendDeptIncomeAnalysis/exportIncomeList',
        method: 'post',
        data,
        responseType: 'blob'
    })
}

export function exportAnalysis(data) {
    return request({
        url: '/dept/trendDeptIncomeAnalysis/exportDeptIncomeTrend',
        method: 'post',
        data,
        responseType: 'blob'
    })
}