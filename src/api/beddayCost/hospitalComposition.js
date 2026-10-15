import request from '@/utils/request'

export function page(data) {
    return request({
        url: '/bedClinic/structureHospitalCostAnalysis/bed/costCategoryStructure',
        method: 'post',
        data
    })
}

export function analysis(data) {
    return request({
        url: '/bedClinic/structureHospitalCostAnalysis/bed/view',
        method: 'post',
        data
    })
}

export function costDetail(data) {
    return request({
        url: '/bedClinic/structureHospitalCostAnalysis/bed/costCategoryStructureList',
        method: 'post',
        data
    })
}

export function exportCostDetail(data) {
    return request({
        url: '/bedClinic/structureHospitalCostAnalysis/bed/exportCostCategoryStructureList',
        method: 'post',
        data,
        responseType: 'blob'
    })
}

export function exportAnalysis(data) {
    return request({
        url: '/bedClinic/structureHospitalCostAnalysis/bed/exportCostCategoryStructure',
        method: 'post',
        data,
        responseType: 'blob'
    })
}