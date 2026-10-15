import request from '@/utils/request'

export function page(data) {
    return request({
        url: '/dept/compareDeptIncomeProjectAnalysisRange/deptIncomeProjectCompare',
        method: 'post',
        data
    })
}

export function analysis(data) {
    return request({
        url: '/dept/compareDeptIncomeProjectAnalysisRange/view',
        method: 'post',
        data
    })
}

export function incomeDetail(data) {
    return request({
        url: '/dept/compareDeptIncomeProjectAnalysisRange/deptIncomeProjectCompareIncomeList',
        method: 'post',
        data
    })
}

export function exportIncomeDetail(data) {
    return request({
        url: '/dept/compareDeptIncomeProjectAnalysisRange/exportDeptIncomeProjectCompareIncomeList',
        method: 'post',
        data,
        responseType: 'blob'
    })
}

export function exportAnalysis(data) {
    return request({
        url: '/dept/compareDeptIncomeProjectAnalysisRange/exportDeptIncomeProjectCompare',
        method: 'post',
        data,
        responseType: 'blob'
    })
}
