import request from '@/utils/request'

export function page(data) {
    return request({
        url: '/dept/compareDeptCostCategoryAnalysisRange/deptCostCategoryCompare',
        method: 'post',
        data
    })
}

export function analysis(data) {
    return request({
        url: '/dept/compareDeptCostCategoryAnalysisRange/view',
        method: 'post',
        data
    })
}

export function costDetail(data) {
    return request({
        url: '/dept/compareDeptCostCategoryAnalysisRange/deptCostCategoryCompareCostList',
        method: 'post',
        data
    })
}

export function exportCostDetail(data) {
    return request({
        url: '/dept/compareDeptCostCategoryAnalysisRange/exportDeptCostCategoryCompareCostList',
        method: 'post',
        data,
        responseType: 'blob'
    })
}

export function exportAnalysis(data) {
    return request({
        url: '/dept/compareDeptCostCategoryAnalysisRange/exportDeptCostCategoryCompare',
        method: 'post',
        data,
        responseType: 'blob'
    })
}
