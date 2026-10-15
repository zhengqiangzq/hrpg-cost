import request from '@/utils/request'

// 分页查询病案数据
export function pageMedicalRecordData(data) {
    return request({
        url: '/businessData/diseaseMedicalRecordData/page',
        method: 'post',
        data,
        btnCode: 'medicalRecordData:list'
    })
}

// 病案数据详情
export function oneMedicalRecordData(id) {
    return request({
        url: `/businessData/diseaseMedicalRecordData/${id}`,
        method: 'get',
        btnCode: 'medicalRecordData:list'
    })
}

// 新增病案数据
export function addMedicalRecordData(data) {
    return request({
        url: '/businessData/diseaseMedicalRecordData',
        method: 'post',
        data,
        btnCode: 'medicalRecordData:add'
    })
}

// 修改病案数据
export function updateMedicalRecordData(data) {
    return request({
        url: '/businessData/diseaseMedicalRecordData/medicalUpdate',
        method: 'post',
        data,
        btnCode: 'medicalRecordData:update'
    })
}

// 删除病案数据
export function deleteMedicalRecordData(data) {
    return request({
        url: '/businessData/diseaseMedicalRecordData/byDelete',
        method: 'post',
        data,
        btnCode: 'medicalRecordData:delete'
    })
}

// 采集病案数据
export function collectMedicalRecordData(params) {
    return request({
        url: '/businessData/diseaseMedicalRecordData/collection',
        method: 'get',
        params,
        btnCode: 'medicalRecordData:collect'
    })
}

// 更新病种数据
export function updateDiseaseMedicalRecordData(params) {
    return request({
        url: '/businessData/diseaseMedicalRecordData/diseaseUpdate',
        method: 'get',
        params,
        btnCode: 'medicalRecordData:update'
    })
}

// 导出病案数据
export function exportMedicalRecordData(data) {
    return request({
        url: '/businessData/diseaseMedicalRecordData/excel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'medicalRecordData:export'
    })
}
