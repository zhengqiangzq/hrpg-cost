import request from '@/utils/request'

export function page(data) {
    return request({
        url: '/bedClinic/structureDeptCostAnalysis/bed/costItemStructure',
        method: 'post',
        data
    })
}

export function analysis(data) {
    return request({
        url: '/bedClinic/structureDeptCostAnalysis/bed/view',
        method: 'post',
        data
    })
}

export function exportAnalysis(data) {
    return request({
        url: '/bedClinic/structureDeptCostAnalysis/bed/exportCostItemStructure',
        method: 'post',
        data,
        responseType: 'blob'
    })
}