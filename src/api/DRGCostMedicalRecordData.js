import request from '@/utils/request'

// 分页查询病案数据
export function pageMedicalRecordData(data) {
    return request({
        url: '/drg/businessData/medicalRecordData/page',
        method: 'post',
        data,
        btnCode: 'DRGCostMedicalRecordData:list'
    })
}

// 病案数据详情
export function oneMedicalRecordData(id) {
    return request({
        url: `/drg/businessData/medicalRecordData/${id}`,
        method: 'get',
        btnCode: 'DRGCostMedicalRecordData:list'
    })
}

// 新增病案数据
export function addMedicalRecordData(data) {
    return request({
        url: '/drg/businessData/medicalRecordData',
        method: 'post',
        data,
        btnCode: 'DRGCostMedicalRecordData:add'
    })
}

// 修改病案数据
export function updateMedicalRecordData(data) {
    return request({
        url: '/drg/businessData/medicalRecordData/medicalUpdate',
        method: 'post',
        data,
        btnCode: 'DRGCostMedicalRecordData:update'
    })
}

// 删除病案数据
export function deleteMedicalRecordData(data) {
    return request({
        url: '/drg/businessData/medicalRecordData/byDelete',
        method: 'post',
        data,
        btnCode: 'DRGCostMedicalRecordData:delete'
    })
}

// 采集病案数据
export function collectMedicalRecordData(params) {
    return request({
        url: '/drg/businessData/medicalRecordData/collection',
        method: 'get',
        params,
        btnCode: 'DRGCostMedicalRecordData:collect'
    })
}

// 更新病种数据
export function updateDiseaseMedicalRecordData(params) {
    return request({
        url: '/drg/businessData/medicalRecordData/diseaseUpdate',
        method: 'get',
        params,
        btnCode: 'DRGCostMedicalRecordData:update'
    })
}

// 导出病案数据
export function exportMedicalRecordData(data) {
    return request({
        url: '/drg/businessData/medicalRecordData/excel',
        method: 'post',
        data,
        btnCode: 'DRGCostMedicalRecordData:export',
        responseType: 'blob'
    })
}
