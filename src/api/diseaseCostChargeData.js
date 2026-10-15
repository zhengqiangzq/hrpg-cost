import request from '@/utils/request'

// 分页查询收费数据
export function pageChargeData(params) {
    return request({
        url: '/businessData/diseaseChargeData/page',
        method: 'get',
        params,
        btnCode: 'diseaseCostChargeData:list'
    })
}

// 查询收费数据
export function oneChargeData(id) {
    return request({
        url: `/businessData/diseaseChargeData/${id}`,
        method: 'get',
        btnCode: 'diseaseCostChargeData:list'
    })
}

// 明细分页查询
export function pageDetailChargeData(params) {
    return request({
        url: '/businessData/diseaseChargeDataDetails/page',
        method: 'get',
        params,
        btnCode: 'diseaseCostChargeData:list'
    })
}

// 明细页分页查询
export function pageDetailPageChargeData(data) {
    return request({
        url: '/businessData/diseaseChargeDataDetails/detail/page',
        method: 'post',
        data,
        btnCode: 'diseaseCostChargeData:list'
    })
}

// 确认收费数据
export function enableChargeData(data) {
    return request({
        url: '/businessData/diseaseChargeData/confirm',
        method: 'post',
        data,
        btnCode: 'diseaseCostChargeData:enable'
    })
}

// 取消确认收费数据
export function disabledChargeData(data) {
    return request({
        url: '/businessData/diseaseChargeData/cancelConfirm',
        method: 'post',
        data,
        btnCode: 'diseaseCostChargeData:enable'
    })
}

// 新增收费数据
export function addChargeData(data) {
    return request({
        url: '/businessData/diseaseChargeData/add',
        method: 'post',
        data,
        btnCode: 'diseaseCostChargeData:add'
    })
}

// 新增收费数据明细
export function addDetailChargeData(data) {
    return request({
        url: '/businessData/diseaseChargeDataDetails/add',
        method: 'post',
        data,
        btnCode: 'diseaseCostChargeData:add'
    })
}

// 修改收费数据
export function updateChargeData(data) {
    return request({
        url: '/businessData/diseaseChargeData/update',
        method: 'post',
        data,
        btnCode: 'diseaseCostChargeData:update'
    })
}

// 修改收费数据明细
export function updateDetailChargeData(data) {
    return request({
        url: '/businessData/diseaseChargeDataDetails/update',
        method: 'post',
        data,
        btnCode: 'diseaseCostChargeData:update'
    })
}

// 修改收费数据
export function deleteChargeData(data) {
    return request({
        url: '/businessData/diseaseChargeData/byDelete',
        method: 'post',
        data,
        btnCode: 'diseaseCostChargeData:delete'
    })
}

// 采集收费数据
export function collectChargeData(params) {
    return request({
        url: '/businessData/diseaseChargeData/collection',
        method: 'get',
        params,
        btnCode: 'diseaseCostChargeData:collect'
    })
}

// 修改收费数据明细
export function deleteDetailChargeData(data) {
    return request({
        url: '/businessData/diseaseChargeDataDetails/deleteByIds',
        method: 'post',
        data,
        btnCode: 'diseaseCostChargeData:delete'
    })
}

// 导出收费数据
export function exportChargeData(params) {
    return request({
        url: '/businessData/diseaseChargeData/excel',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'diseaseCostChargeData:export'
    })
}

// 导出收费数据明细
export function exportDetailChargeData(params) {
    return request({
        url: `/businessData/diseaseChargeDataDetails/excel/${params.diseaseChargeDataId}`,
        method: 'get',
        responseType: 'blob',
        btnCode: 'diseaseCostChargeData:export'
    })
}

// 导出收费数据明细页明细
export function exportDetailPageChargeData(data) {
    return request({
        url: `/businessData/diseaseChargeDataDetails/detail/excel`,
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'diseaseCostChargeData:export'
    })
}
