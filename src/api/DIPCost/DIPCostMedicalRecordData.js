import request from '@/utils/request'

// 分页查询病案数据
export function pageMedicalRecordData(data) {
    return request({
        url: '/dip/businessData/medicalRecordData/page',
        method: 'post',
        data,
        btnCode: 'DIPCostMedicalRecordData:list'
    })
}

// 病案数据详情
export function oneMedicalRecordData(id) {
    return request({
        url: `/dip/businessData/medicalRecordData/${id}`,
        method: 'get',
        btnCode: 'DIPCostMedicalRecordData:list'
    })
}

// 新增病案数据
export function addMedicalRecordData(data) {
    return request({
        url: '/dip/businessData/medicalRecordData',
        method: 'post',
        data,
        btnCode: 'DIPCostMedicalRecordData:add'
    })
}

// 修改病案数据
export function updateMedicalRecordData(data) {
    return request({
        url: '/dip/businessData/medicalRecordData/medicalUpdate',
        method: 'post',
        data,
        btnCode: 'DIPCostMedicalRecordData:update'
    })
}

// 删除病案数据
export function deleteMedicalRecordData(data) {
    return request({
        url: '/dip/businessData/medicalRecordData/byDelete',
        method: 'post',
        data,
        btnCode: 'DIPCostMedicalRecordData:delete'
    })
}

// 采集病案数据
export function collectMedicalRecordData(params) {
    return request({
        url: '/dip/businessData/medicalRecordData/collection',
        method: 'get',
        params,
        btnCode: 'DIPCostMedicalRecordData:collect'
    })
}

// 更新病种数据
export function updateDiseaseMedicalRecordData(params) {
    return request({
        url: '/dip/businessData/medicalRecordData/diseaseUpdate',
        method: 'get',
        params,
        btnCode: 'DIPCostMedicalRecordData:update'
    })
}

// 导出病案数据
export function exportMedicalRecordData(data) {
    return request({
        url: '/dip/businessData/medicalRecordData/excel',
        method: 'post',
        data,
        btnCode: 'DIPCostMedicalRecordData:export',
        responseType: 'blob'
    })
}
