import request from '@/utils/request'

export function page(data) {
    return request({
        url: '/dept/structureHospitalCostCategoryAnalysis/costCategoryStructure',
        method: 'post',
        data
    })
}

export function analysis(data) {
    return request({
        url: '/dept/structureHospitalCostCategoryAnalysis/view',
        method: 'post',
        data
    })
}

export function costDetail(data) {
    return request({
        url: '/dept/structureHospitalCostCategoryAnalysis/costCategoryStructureList',
        method: 'post',
        data
    })
}

export function exportCostDetail(data) {
    return request({
        url: '/dept/structureHospitalCostCategoryAnalysis/exportCostCategoryStructureList',
        method: 'post',
        data,
        responseType: 'blob'
    })
}

export function exportAnalysis(data) {
    return request({
        url: '/dept/structureHospitalCostCategoryAnalysis/exportCostCategoryStructure',
        method: 'post',
        data,
        responseType: 'blob'
    })
}