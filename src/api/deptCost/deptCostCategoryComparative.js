import request from '@/utils/request'

export function page(data) {
    return request({
        url: '/dept/compareDeptCostCategoryAnalysis/deptCostCategoryCompare',
        method: 'post',
        data
    })
}

export function analysis(data) {
    return request({
        url: '/dept/compareDeptCostCategoryAnalysis/view',
        method: 'post',
        data
    })
}

export function costDetail(data) {
    return request({
        url: '/dept/compareDeptCostCategoryAnalysis/deptCostCategoryCompareCostList',
        method: 'post',
        data
    })
}

export function exportCostDetail(data) {
    return request({
        url: '/dept/compareDeptCostCategoryAnalysis/exportDeptCostCategoryCompareCostList',
        method: 'post',
        data,
        responseType: 'blob'
    })
}

export function exportAnalysis(data) {
    return request({
        url: '/dept/compareDeptCostCategoryAnalysis/exportDeptCostCategoryCompare',
        method: 'post',
        data,
        responseType: 'blob'
    })
}