import request from '@/utils/request'

export function topGraphics(data) {
    return request({
        url: '/dept/analysis/basic',
        method: 'post',
        data
    })
}
export function incomeDetail(data) {
    return request({
        url: '/dept/analysis/basic/deptIncomeDetail',
        method: 'post',
        data
    })
}
export function costDetail(data) {
    return request({
        url: '/dept/analysis/basic/deptCostDetail',
        method: 'post',
        data
    })
}
export function exportIncomeDetail(data) {
    return request({
        url: '/dept/analysis/basic/exportDeptIncomeDetail',
        method: 'post',
        data,
        responseType: 'blob'
    })
}
export function exportCostDetail(data) {
    return request({
        url: '/dept/analysis/basic/exportDeptCostDetail',
        method: 'post',
        data,
        responseType: 'blob'
    })
}

export function pageApportionmentLevelList(data) {
    return request({
        url: '/dept/analysis/apportionmentLevelList',
        method: 'post',
        data
    })
}

export function basicdeptDirectCostDetail(data) {
    return request({
        url: '/dept/analysis/basic/deptDirectCostDetail',
        method: 'post',
        data
    })
}
export function basicdeptIndirectCostDetail(data) {
    return request({
        url: '/dept/analysis/basic/deptIndirectCostDetail',
        method: 'post',
        data
    })
}

export function basicexportDeptDirectCostDetail(data) {
    return request({
        url: '/dept/analysis/basic/exportDeptDirectCostDetail',
        method: 'post',
        data,
        responseType: 'blob'
    })
}
export function basicexportDeptIndirectCostDetail(data) {
    return request({
        url: '/dept/analysis/basic/exportDeptIndirectCostDetail',
        method: 'post',
        data,
        responseType: 'blob'
    })
}
