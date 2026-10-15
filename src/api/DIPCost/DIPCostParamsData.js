import request from '@/utils/request'
// 参数分配法

// 分页查询参数数据
export function pageParamsData(params) {
    return request({
        url: '/dip/apportionParam/page',
        method: 'get',
        params,
        btnCode: 'DIPCostParamsData:list'
    })
}

// 分页查询参数数据明细
export function pageParamsDataDetail(params) {
    return request({
        url: '/dip/apportionParamDetail/page',
        method: 'get',
        params,
        btnCode: 'DIPCostParamsData:list'
    })
}

// 分页查询参数数据明细页
export function pageParamsDataDetailPage(data) {
    return request({
        url: '/dip/apportionParamDetail/detail/page',
        method: 'post',
        data,
        btnCode: 'DIPCostParamsData:list'
    })
}

// 查询参数数据
export function oneParamsData(id) {
    return request({
        url: `/dip/apportionParam/${id}`,
        method: 'get',
        btnCode: 'DIPCostParamsData:list'
    })
}

// 新增参数数据
export function addParamsData(data) {
    return request({
        url: '/dip/apportionParam/add',
        method: 'post',
        data,
        btnCode: 'DIPCostParamsData:add'
    })
}

// 新增参数数据明细
export function addParamsDataDetail(data) {
    return request({
        url: '/dip/apportionParamDetail/add',
        method: 'post',
        data,
        btnCode: 'DIPCostParamsData:add'
    })
}

// 修改参数数据
export function updateParamsData(data) {
    return request({
        url: '/dip/apportionParam/update',
        method: 'post',
        data,
        btnCode: 'DIPCostParamsData:update'
    })
}

// 修改参数数据明细
export function updateParamsDataDetail(data) {
    return request({
        url: '/dip/apportionParamDetail/update',
        method: 'post',
        data,
        btnCode: 'DIPCostParamsData:update'
    })
}

// 删除参数数据
export function deleteParamsData(data) {
    return request({
        url: '/dip/apportionParam/byDelete',
        method: 'post',
        data,
        btnCode: 'DIPCostParamsData:delete'
    })
}

// 删除参数数据明细
export function deleteParamsDataDetail(data) {
    return request({
        url: '/dip/apportionParamDetail/byDelete',
        method: 'post',
        data,
        btnCode: 'DIPCostParamsData:delete'
    })
}

// 确认参数数据
export function enableParamsData(data) {
    return request({
        url: '/dip/apportionParam/confirm',
        method: 'post',
        data,
        btnCode: 'DIPCostParamsData:enable'
    })
}

// 取消确认参数数据
export function disableParamsData(data) {
    return request({
        url: '/dip/apportionParam/cancelConfirm',
        method: 'post',
        data,
        btnCode: 'DIPCostParamsData:enable'
    })
}

// 采集参数数据
export function collectParamsData(data) {
    return request({
        url: `/dip/apportionParam/in/collect`,
        method: 'post',
        data,
        btnCode: 'DIPCostParamsData:collect'
    })
}

// 导出参数数据
export function exportParamsData(params) {
    return request({
        url: '/dip/apportionParam/excel',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'DIPCostParamsData:export'
    })
}

// 导出参数数据明细
export function exportParamsDataDetail(params) {
    return request({
        url: `/dip/apportionParamDetail/excel/${params.orderId}`,
        method: 'get',
        responseType: 'blob',
        btnCode: 'DIPCostParamsData:export'
    })
}

// 导出参数数据明细页
export function exportParamsDataDetailPage(data) {
    return request({
        url: '/dip/apportionParamDetail/detail/excel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'DIPCostParamsData:export'
    })
}
