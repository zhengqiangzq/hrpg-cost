import request from '@/utils/request'

export function page(data) {
    return request({
        url: '/bedClinic/structureHospitalCostAnalysis/clinic/costCategoryStructure',
        method: 'post',
        data
    })
}

export function analysis(data) {
    return request({
        url: '/bedClinic/structureHospitalCostAnalysis/clinic/view',
        method: 'post',
        data
    })
}

export function costDetail(data) {
    return request({
        url: '/bedClinic/structureHospitalCostAnalysis/clinic/costCategoryStructureList',
        method: 'post',
        data
    })
}

export function exportCostDetail(data) {
    return request({
        url: '/bedClinic/structureHospitalCostAnalysis/clinic/exportCostCategoryStructureList',
        method: 'post',
        data,
        responseType: 'blob'
    })
}

export function exportAnalysis(data) {
    return request({
        url: '/bedClinic/structureHospitalCostAnalysis/clinic/exportCostCategoryStructure',
        method: 'post',
        data,
        responseType: 'blob'
    })
}