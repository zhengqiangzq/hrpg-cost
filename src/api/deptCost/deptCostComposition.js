import request from '@/utils/request'

export function page(data) {
    return request({
        url: '/dept/structurDeptCostItemAnalysis/costItemStructure',
        method: 'post',
        data
    })
}

export function analysis(data) {
    return request({
        url: '/dept/structurDeptCostItemAnalysis/view',
        method: 'post',
        data
    })
}

export function exportAnalysis(data) {
    return request({
        url: '/dept/structurDeptCostItemAnalysis/exportCostItemStructure',
        method: 'post',
        data,
        responseType: 'blob'
    })
}