import request from '@/utils/request'

export function page(data) {
    return request({
        url: '/dept/compareDeptIncomeProjectAnalysis/deptIncomeProjectCompare',
        method: 'post',
        data
    })
}

export function analysis(data) {
    return request({
        url: '/dept/compareDeptIncomeProjectAnalysis/view',
        method: 'post',
        data
    })
}

export function incomeDetail(data) {
    return request({
        url: '/dept/compareDeptIncomeProjectAnalysis/deptIncomeProjectCompareIncomeList',
        method: 'post',
        data
    })
}

export function exportIncomeDetail(data) {
    return request({
        url: '/dept/compareDeptIncomeProjectAnalysis/exportDeptIncomeProjectCompareIncomeList',
        method: 'post',
        data,
        responseType: 'blob'
    })
}

export function exportAnalysis(data) {
    return request({
        url: '/dept/compareDeptIncomeProjectAnalysis/exportDeptIncomeProjectCompare',
        method: 'post',
        data,
        responseType: 'blob'
    })
}