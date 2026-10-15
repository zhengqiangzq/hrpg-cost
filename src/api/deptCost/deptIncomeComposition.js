import request from '@/utils/request'

export function page(data) {
    return request({
        url: '/dept/structurDeptFeeItemAnalysis/feeItemStructure',
        method: 'post',
        data
    })
}

export function analysis(data) {
    return request({
        url: '/dept/structurDeptFeeItemAnalysis/view',
        method: 'post',
        data
    })
}

export function exportAnalysis(data) {
    return request({
        url: '/dept/structurDeptFeeItemAnalysis/exportFeeItemStructure',
        method: 'post',
        data,
        responseType: 'blob'
    })
}