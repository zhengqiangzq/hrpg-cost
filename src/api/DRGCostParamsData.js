import request from '@/utils/request'
// 参数分配法

// 分页查询参数数据
export function pageParamsData(params) {
    return request({
        url: '/drg/apportionParam/page',
        method: 'get',
        params,
        btnCode: 'DRGCostParamsData:list'
    })
}

// 分页查询参数数据明细
export function pageParamsDataDetail(params) {
    return request({
        url: '/drg/apportionParamDetail/page',
        method: 'get',
        params,
        btnCode: 'DRGCostParamsData:list'
    })
}

// 分页查询参数数据明细页
export function pageParamsDataDetailPage(data) {
    return request({
        url: '/drg/apportionParamDetail/detail/page',
        method: 'post',
        data,
        btnCode: 'DRGCostParamsData:list'
    })
}

// 查询参数数据
export function oneParamsData(id) {
    return request({
        url: `/drg/apportionParam/${id}`,
        method: 'get',
        btnCode: 'DRGCostParamsData:list'
    })
}

// 新增参数数据
export function addParamsData(data) {
    return request({
        url: '/drg/apportionParam/add',
        method: 'post',
        data,
        btnCode: 'DRGCostParamsData:add'
    })
}

// 新增参数数据明细
export function addParamsDataDetail(data) {
    return request({
        url: '/drg/apportionParamDetail/add',
        method: 'post',
        data,
        btnCode: 'DRGCostParamsData:add'
    })
}

// 修改参数数据
export function updateParamsData(data) {
    return request({
        url: '/drg/apportionParam/update',
        method: 'post',
        data,
        btnCode: 'DRGCostParamsData:update'
    })
}

// 修改参数数据明细
export function updateParamsDataDetail(data) {
    return request({
        url: '/drg/apportionParamDetail/update',
        method: 'post',
        data,
        btnCode: 'DRGCostParamsData:update'
    })
}

// 删除参数数据
export function deleteParamsData(data) {
    return request({
        url: '/drg/apportionParam/byDelete',
        method: 'post',
        data,
        btnCode: 'DRGCostParamsData:delete'
    })
}

// 删除参数数据明细
export function deleteParamsDataDetail(data) {
    return request({
        url: '/drg/apportionParamDetail/byDelete',
        method: 'post',
        data,
        btnCode: 'DRGCostParamsData:delete'
    })
}

// 确认参数数据
export function enableParamsData(data) {
    return request({
        url: '/drg/apportionParam/confirm',
        method: 'post',
        data,
        btnCode: 'DRGCostParamsData:enable'
    })
}

// 取消确认参数数据
export function disableParamsData(data) {
    return request({
        url: '/drg/apportionParam/cancelConfirm',
        method: 'post',
        data,
        btnCode: 'DRGCostParamsData:enable'
    })
}

// 采集参数数据
export function collectParamsData(data) {
    return request({
        url: `/drg/apportionParam/in/collect`,
        method: 'post',
        data,
        btnCode: 'DRGCostParamsData:collect'
    })
}

// 导出参数数据
export function exportParamsData(params) {
    return request({
        url: '/drg/apportionParam/excel',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'DRGCostParamsData:export'
    })
}

// 导出参数数据明细
export function exportParamsDataDetail(params) {
    return request({
        url: `/drg/apportionParamDetail/excel/${params.orderId}`,
        method: 'get',
        responseType: 'blob',
        btnCode: 'DRGCostParamsData:export'
    })
}

// 导出参数数据明细页
export function exportParamsDataDetailPage(data) {
    return request({
        url: '/drg/apportionParamDetail/detail/excel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'DRGCostParamsData:export'
    })
}
