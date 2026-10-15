import request from '@/utils/request'

// 分页查询收费数据
export function pageChargeData(params) {
    return request({
        url: '/drg/businessData/chargeData/page',
        method: 'get',
        params,
        btnCode: 'DRGCostChargeData:list',
    })
}

// 查询收费数据
export function oneChargeData(id) {
    return request({
        url: `/drg/businessData/chargeData/${id}`,
        method: 'get',
        btnCode: 'DRGCostChargeData:list',
    })
}

// 查询收费数据
export function collectChargeData(params) {
    return request({
        url: '/drg/businessData/chargeData/collection',
        method: 'get',
        params,
        btnCode: 'DRGCostChargeData:list',
    })
}

// 明细分页查询
export function pageDetailChargeData(params) {
    return request({
        url: '/drg/businessData/chargeDataDetails/page',
        method: 'get',
        params,
        btnCode: 'DRGCostChargeData:list',
    })
}

// 明细页分页查询
export function pageDetailPageChargeData(data) {
    return request({
        url: '/drg/businessData/chargeDataDetails/detail/page',
        method: 'post',
        data,
        btnCode: 'DRGCostChargeData:list',
    })
}

// 确认收费数据
export function enableChargeData(data) {
    return request({
        url: '/drg/businessData/chargeData/confirm',
        method: 'post',
        data,
        btnCode: 'DRGCostChargeData:enable',
    })
}

// 取消确认收费数据
export function disabledChargeData(data) {
    return request({
        url: '/drg/businessData/chargeData/cancelConfirm',
        method: 'post',
        data,
        btnCode: 'DRGCostChargeData:enable',
    })
}

// 新增收费数据
export function addChargeData(data) {
    return request({
        url: '/drg/businessData/chargeData/add',
        method: 'post',
        data,
        btnCode: 'DRGCostChargeData:add',
    })
}

// 新增收费数据明细
export function addDetailChargeData(data) {
    return request({
        url: '/drg/businessData/chargeDataDetails/add',
        method: 'post',
        data,
        btnCode: 'DRGCostChargeData:add',
    })
}

// 修改收费数据
export function updateChargeData(data) {
    return request({
        url: '/drg/businessData/chargeData/update',
        method: 'post',
        data,
        btnCode: 'DRGCostChargeData:update',
    })
}

// 修改收费数据明细
export function updateDetailChargeData(data) {
    return request({
        url: '/drg/businessData/chargeDataDetails/update',
        method: 'post',
        data,
        btnCode: 'DRGCostChargeData:update',
    })
}

// 修改收费数据
export function deleteChargeData(data) {
    return request({
        url: '/drg/businessData/chargeData/byDelete',
        method: 'post',
        data,
        btnCode: 'DRGCostChargeData:update',
    })
}

// 删除收费数据明细
export function deleteDetailChargeData(data) {
    return request({
        url: '/drg/businessData/chargeDataDetails/deleteByIds',
        method: 'post',
        data,
        btnCode: 'DRGCostChargeData:delete',
    })
}

// 导出收费数据
export function exportChargeData(params) {
    return request({
        url: '/drg/businessData/chargeData/excel',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'DRGCostChargeData:export',
    })
}

// 导出收费数据明细
export function exportDetailChargeData(params) {
    return request({
        url: `/drg/businessData/chargeDataDetails/excel/${params.drgChargeDataId}`,
        method: 'get',
        responseType: 'blob',
        btnCode: 'DRGCostChargeData:export',
    })
}

// 导出收费数据明细页明细
export function exportDetailPageChargeData(data) {
    return request({
        url: `/drg/businessData/chargeDataDetails/detail/excel`,
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'DRGCostChargeData:export',
    })
}
