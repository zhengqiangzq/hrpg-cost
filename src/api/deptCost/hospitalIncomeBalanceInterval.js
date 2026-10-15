import request from '@/utils/request'

export function compareHospitalBalanceAnalysislist(data) {
    return request({
        url: '/dept/compareHospitalBalanceAnalysisRange/hospitalIncomeAndExpenditureCompare',
        method: 'post',
        data
    })
}

export function compareHospitalBalanceAnalysisRangeview(data) {
    return request({
        url: '/dept/compareHospitalBalanceAnalysisRange/view',
        method: 'post',
        data
    })
}

export function incomeDetail(data) {
    return request({
        url: '/dept/compareHospitalBalanceAnalysisRange/hospitalIncomeAndExpenditureCompareIncomeList',
        method: 'post',
        data
    })
}

export function costDetail(data) {
    return request({
        url: '/dept/compareHospitalBalanceAnalysisRange/hospitalIncomeAndExpenditureCompareCostList',
        method: 'post',
        data
    })
}

export function exportIncomeDetail(data) {
    return request({
        url: '/dept/compareHospitalBalanceAnalysisRange/exportHospitalIncomeAndExpenditureCompareIncomeList',
        method: 'post',
        data,
        responseType: 'blob'
    })
}

export function exportCostDetail(data) {
    return request({
        url: '/dept/compareHospitalBalanceAnalysisRange/exportHospitalIncomeAndExpenditureCompareCostList',
        method: 'post',
        data,
        responseType: 'blob'
    })
}

export function exportCompareCostList(data) {
    return request({
        url: '/dept/compareHospitalBalanceAnalysisRange/exportHospitalIncomeAndExpenditureCompare',
        method: 'post',
        data,
        responseType: 'blob'
    })
}
