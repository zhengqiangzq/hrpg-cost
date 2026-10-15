import request from '@/utils/request'

export function page(data) {
    return request({
        url: '/bedClinic/structureDeptCostAnalysis/clinic/costItemStructure',
        method: 'post',
        data
    })
}

export function analysis(data) {
    return request({
        url: '/bedClinic/structureDeptCostAnalysis/clinic/view',
        method: 'post',
        data
    })
}

export function exportAnalysis(data) {
    return request({
        url: '/bedClinic/structureDeptCostAnalysis/clinic/exportCostItemStructure',
        method: 'post',
        data,
        responseType: 'blob'
    })
}