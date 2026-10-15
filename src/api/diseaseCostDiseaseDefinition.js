import request from '@/utils/request'

// 分页查询病种定义
export function pageDiseaseDefinition(params) {
    return request({
        url: '/base/diseaseDefinition/page',
        method: 'get',
        params,
        btnCode: 'diseaseCostDiseaseDefinition:list'
    })
}

// 分页查询病种定义明细
export function pageDiseaseDefinitionICD(params) {
    return request({
        url: '/base/diseaseMappingIcd/page',
        method: 'get',
        params,
        btnCode: 'diseaseCostDiseaseDefinition:list'
    })
}

// 新增病种定义
export function addDiseaseDefinition(data) {
    return request({
        url: '/base/diseaseDefinition',
        method: 'post',
        data,
        btnCode: 'diseaseCostDiseaseDefinition:add'
    })
}

// 新增病种定义明细
export function addDiseaseDefinitionICD(data) {
    return request({
        url: '/base/diseaseMappingIcd',
        method: 'post',
        data,
        btnCode: 'diseaseCostDiseaseDefinition:add'
    })
}

// 修改病种定义
export function updateDiseaseDefinition(data) {
    return request({
        url: '/base/diseaseDefinition/byPost',
        method: 'post',
        data,
        btnCode: 'diseaseCostDiseaseDefinition:update'
    })
}

// 修改病种定义明细
export function updateDiseaseDefinitionICD(data) {
    return request({
        url: '/base/diseaseMappingIcd/byPost',
        method: 'post',
        data,
        btnCode: 'diseaseCostDiseaseDefinition:update'
    })
}

// 删除病种定义
export function deleteDiseaseDefinition(data) {
    return request({
        url: '/base/diseaseDefinition/byDelete',
        method: 'post',
        data,
        btnCode: 'diseaseCostDiseaseDefinition:delete'
    })
}

// 删除病种定义明细
export function deleteDiseaseDefinitionICD(data) {
    return request({
        url: '/base/diseaseMappingIcd/byDelete',
        method: 'post',
        data,
        btnCode: 'diseaseCostDiseaseDefinition:delete'
    })
}

// 导出病种定义
export function exportDiseaseDefinition(params) {
    return request({
        url: '/base/diseaseDefinition/excel',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'diseaseCostDiseaseDefinition:export'
    })
}

// 导出病种定义明细
export function exportDiseaseDefinitionICD(params) {
    return request({
        url: '/base/diseaseMappingIcd/excel',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'diseaseCostDiseaseDefinition:export'
    })
}

