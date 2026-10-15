import request from '@/utils/request'
// 服务单元叠加法

// 分页查询参数数据
export function pageParamsData(params) {
    return request({
        url: '/dip/methodService/apportionParamService/page',
        method: 'get',
        params,
        btnCode: 'DIPCostServiceUnitParamsData:list'
    })
}

// 分页查询参数数据明细
export function pageParamsDataDetail(params) {
    return request({
        url: '/dip/methodService/apportionParamServiceDetail/page',
        method: 'get',
        params,
        btnCode: 'DIPCostServiceUnitParamsData:list'
    })
}

// 分页查询参数数据明细页
export function pageParamsDataDetailPage(params) {
    return request({
        url: '/dip/methodService/apportionParamServiceDetail/page',
        method: 'get',
        params,
        btnCode: 'DIPCostServiceUnitParamsData:list'
    })
}

// 查询参数数据
export function oneParamsData(id) {
    return request({
        url: `/dip/methodService/apportionParamService/${id}`,
        method: 'get',
        btnCode: 'DIPCostServiceUnitParamsData:list'
    })
}

// 新增参数数据
export function addParamsData(data) {
    return request({
        url: '/dip/methodService/apportionParamService',
        method: 'post',
        data,
        btnCode: 'DIPCostServiceUnitParamsData:add'
    })
}

// 新增参数数据明细
export function addParamsDataDetail(data) {
    return request({
        url: '/dip/methodService/apportionParamServiceDetail',
        method: 'post',
        data,
        btnCode: 'DIPCostServiceUnitParamsData:add'
    })
}

// 修改参数数据
export function updateParamsData(data) {
    return request({
        url: '/dip/methodService/apportionParamService/byPost',
        method: 'post',
        data,
        btnCode: 'DIPCostServiceUnitParamsData:update'
    })
}

// 修改参数数据明细
export function updateParamsDataDetail(data) {
    return request({
        url: '/dip/methodService/apportionParamServiceDetail/byPost',
        method: 'post',
        data,
        btnCode: 'DIPCostServiceUnitParamsData:update'
    })
}

// 删除参数数据
export function deleteParamsData(data) {
    return request({
        url: '/dip/methodService/apportionParamService/byDelete',
        method: 'post',
        data,
        btnCode: 'DIPCostServiceUnitParamsData:delete'
    })
}

// 删除参数数据明细
export function deleteParamsDataDetail(data) {
    return request({
        url: '/dip/methodService/apportionParamServiceDetail/byDelete',
        method: 'post',
        data,
        btnCode: 'DIPCostServiceUnitParamsData:delete'
    })
}

// 确认参数数据
export function enableParamsData(data) {
    return request({
        url: '/dip/methodService/apportionParamService/confirm',
        method: 'post',
        data: {
            ids: data,
            status: 1
        },
        btnCode: 'DIPCostServiceUnitParamsData:enable'
    })
}

// 取消确认参数数据
export function disableParamsData(data) {
    return request({
        url: '/dip/methodService/apportionParamService/confirm',
        method: 'post',
        data: {
            ids: data,
            status: 0
        },
        btnCode: 'DIPCostServiceUnitParamsData:enable'
    })
}

// 采集参数数据
export function collectParamsData(data) {
    return request({
        url: '/dip/methodService/apportionParamService/collection',
        method: 'post',
        data,
        btnCode: 'DIPCostServiceUnitParamsData:collect'
    })
}

// 导出参数数据
export function exportParamsData(data) {
    return request({
        url: '/dip/methodService/apportionParamService/excel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'DIPCostServiceUnitParamsData:export'
    })
}

// 导出参数数据明细
export function exportParamsDataDetail(data) {
    return request({
        url: '/dip/methodService/apportionParamServiceDetail/excel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'DIPCostServiceUnitParamsData:export'
    })
}

// 导出参数数据明细页
export function exportParamsDataDetailPage(data) {
    return request({
        url: '/dip/methodService/apportionParamService/detail/excel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'DIPCostServiceUnitParamsData:export'
    })
}
