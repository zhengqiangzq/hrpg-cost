import request from '@/utils/request'

// 分页查询收费数据
export function pageChargeData(params) {
    return request({
        url: '/dip/businessData/chargeData/page',
        method: 'get',
        params,
        btnCode: 'DIPCostChargeData:list',
    })
}

// 查询收费数据
export function oneChargeData(id) {
    return request({
        url: `/dip/businessData/chargeData/${id}`,
        method: 'get',
        btnCode: 'DIPCostChargeData:list',
    })
}

// 查询收费数据
export function collectChargeData(params) {
    return request({
        url: '/dip/businessData/chargeData/collection',
        method: 'get',
        params,
        btnCode: 'DIPCostChargeData:list',
    })
}

// 明细分页查询
export function pageDetailChargeData(params) {
    return request({
        url: '/dip/businessData/chargeDataDetails/page',
        method: 'get',
        params,
        btnCode: 'DIPCostChargeData:list',
    })
}

// 明细页分页查询
export function pageDetailPageChargeData(data) {
    return request({
        url: '/dip/businessData/chargeDataDetails/detail/page',
        method: 'post',
        data,
        btnCode: 'DIPCostChargeData:list',
    })
}

// 确认收费数据
export function enableChargeData(data) {
    return request({
        url: '/dip/businessData/chargeData/confirm',
        method: 'post',
        data,
        btnCode: 'DIPCostChargeData:enable',
    })
}

// 取消确认收费数据
export function disabledChargeData(data) {
    return request({
        url: '/dip/businessData/chargeData/cancelConfirm',
        method: 'post',
        data,
        btnCode: 'DIPCostChargeData:enable',
    })
}

// 新增收费数据
export function addChargeData(data) {
    return request({
        url: '/dip/businessData/chargeData/add',
        method: 'post',
        data,
        btnCode: 'DIPCostChargeData:add',
    })
}

// 新增收费数据明细
export function addDetailChargeData(data) {
    return request({
        url: '/dip/businessData/chargeDataDetails/add',
        method: 'post',
        data,
        btnCode: 'DIPCostChargeData:add',
    })
}

// 修改收费数据
export function updateChargeData(data) {
    return request({
        url: '/dip/businessData/chargeData/update',
        method: 'post',
        data,
        btnCode: 'DIPCostChargeData:update',
    })
}

// 修改收费数据明细
export function updateDetailChargeData(data) {
    return request({
        url: '/dip/businessData/chargeDataDetails/update',
        method: 'post',
        data,
        btnCode: 'DIPCostChargeData:update',
    })
}

// 修改收费数据
export function deleteChargeData(data) {
    return request({
        url: '/dip/businessData/chargeData/byDelete',
        method: 'post',
        data,
        btnCode: 'DIPCostChargeData:update',
    })
}

// 删除收费数据明细
export function deleteDetailChargeData(data) {
    return request({
        url: '/dip/businessData/chargeDataDetails/deleteByIds',
        method: 'post',
        data,
        btnCode: 'DIPCostChargeData:delete',
    })
}

// 导出收费数据
export function exportChargeData(params) {
    return request({
        url: '/dip/businessData/chargeData/excel',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'DIPCostChargeData:export',
    })
}

// 导出收费数据明细
export function exportDetailChargeData(params) {
    return request({
        url: `/dip/businessData/chargeDataDetails/excel/${params.dipChargeDataId}`,
        method: 'get',
        responseType: 'blob',
        btnCode: 'DIPCostChargeData:export',
    })
}

// 导出收费数据明细页明细
export function exportDetailPageChargeData(data) {
    return request({
        url: `/dip/businessData/chargeDataDetails/detail/excel`,
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'DIPCostChargeData:export',
    })
}
