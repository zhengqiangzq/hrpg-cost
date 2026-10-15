import request from '@/utils/request'

export function page(data) {
    return request({
        url: '/dept/structureHospitalIncomeProjectAnalysis/incomeProjectStructure',
        method: 'post',
        data
    })
}

export function analysis(data) {
    return request({
        url: '/dept/structureHospitalIncomeProjectAnalysis/view',
        method: 'post',
        data
    })
}

export function incomeDetail(data) {
    return request({
        url: '/dept/structureHospitalIncomeProjectAnalysis/incomeProjectStructureList',
        method: 'post',
        data
    })
}

export function exportIncomeDetail(data) {
    return request({
        url: '/dept/structureHospitalIncomeProjectAnalysis/exportIncomeProjectStructureList',
        method: 'post',
        data,
        responseType: 'blob'
    })
}

export function exportAnalysis(data) {
    return request({
        url: '/dept/structureHospitalIncomeProjectAnalysis/exportIncomeProjectStructure',
        method: 'post',
        data,
        responseType: 'blob'
    })
}