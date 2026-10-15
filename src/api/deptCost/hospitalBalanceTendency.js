import request from '@/utils/request'

export function page(data) {
    return request({
        url: '/dept/trendHospitalBalanceAnalysis/hospitalBalanceTrend',
        method: 'post',
        data
    })
}

export function analysis(data) {
    return request({
        url: '/dept/trendHospitalBalanceAnalysis/view',
        method: 'post',
        data
    })
}

export function incomeDetail(data) {
    return request({
        url: '/dept/trendHospitalBalanceAnalysis/incomeList',
        method: 'post',
        data
    })
}

export function costDetail(data) {
    return request({
        url: '/dept/trendHospitalBalanceAnalysis/costList',
        method: 'post',
        data
    })
}

export function exportIncomeDetail(data) {
    return request({
        url: '/dept/trendHospitalBalanceAnalysis/exportIncomeList',
        method: 'post',
        data,
        responseType: 'blob'
    })
}

export function exportCostDetail(data) {
    return request({
        url: '/dept/trendHospitalBalanceAnalysis/exportCostList',
        method: 'post',
        data,
        responseType: 'blob'
    })
}

export function exportAnalysis(data) {
    return request({
        url: '/dept/trendHospitalBalanceAnalysis/exportHospitalBalanceTrend',
        method: 'post',
        data,
        responseType: 'blob'
    })
}