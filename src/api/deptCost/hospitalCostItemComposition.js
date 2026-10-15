import request from '@/utils/request'

export function page(data) {
    return request({
        url: '/dept/structureHospitalCostItemAnalysis/costItemStructure',
        method: 'post',
        data
    })
}

export function analysis(data) {
    return request({
        url: '/dept/structureHospitalCostItemAnalysis/view',
        method: 'post',
        data
    })
}

export function costDetail(data) {
    return request({
        url: '/dept/structureHospitalCostItemAnalysis/costItemStructureList',
        method: 'post',
        data
    })
}

export function exportCostDetail(data) {
    return request({
        url: '/dept/structureHospitalCostItemAnalysis/exportCostItemStructureList',
        method: 'post',
        data,
        responseType: 'blob'
    })
}

export function exportAnalysis(data) {
    return request({
        url: '/dept/structureHospitalCostItemAnalysis/exportCostItemStructure',
        method: 'post',
        data,
        responseType: 'blob'
    })
}