import request from '@/utils/request'

export function pageHospitalIncomeAndExpenditureCompare(data) {
    return request({
        url: '/dept/compareHospitalBalanceAnalysis/hospitalIncomeAndExpenditureCompare',
        method: 'post',
        data
    })
}

export function analysisHospitalIncomeAndExpenditureCompare(data) {
    return request({
        url: '/dept/compareHospitalBalanceAnalysis/view',
        method: 'post',
        data
    })
}

export function incomeDetail(data) {
    return request({
        url: '/dept/compareHospitalBalanceAnalysis/hospitalIncomeAndExpenditureCompareIncomeList',
        method: 'post',
        data
    })
}

export function costDetail(data) {
    return request({
        url: '/dept/compareHospitalBalanceAnalysis/hospitalIncomeAndExpenditureCompareCostList',
        method: 'post',
        data
    })
}

export function exportIncomeDetail(data) {
    return request({
        url: '/dept/compareHospitalBalanceAnalysis/exportHospitalIncomeAndExpenditureCompareIncomeList',
        method: 'post',
        data,
        responseType: 'blob'
    })
}

export function exportCostDetail(data) {
    return request({
        url: '/dept/compareHospitalBalanceAnalysis/exportHospitalIncomeAndExpenditureCompareCostList',
        method: 'post',
        data,
        responseType: 'blob'
    })
}

export function exportAnalysis(data) {
    return request({
        url: '/dept/compareHospitalBalanceAnalysis/exportHospitalIncomeAndExpenditureCompare',
        method: 'post',
        data,
        responseType: 'blob'
    })
}