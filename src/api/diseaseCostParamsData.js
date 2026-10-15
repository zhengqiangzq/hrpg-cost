import request from '@/utils/request'
// 参数分配法

// 分页查询参数数据
export function pageParamsData(params) {
    return request({
        url: '/methodParameter/diseaseApportionParam/page',
        method: 'get',
        params,
        btnCode: 'diseaseCostParamsData:list'
    })
}

// 分页查询参数数据明细
export function pageParamsDataDetail(params) {
    return request({
        url: '/methodParameter/diseaseApportionParamDetail/page',
        method: 'get',
        params,
        btnCode: 'diseaseCostParamsData:list'
    })
}

// 分页查询参数数据明细页
export function pageParamsDataDetailPage(data) {
    return request({
        url: '/methodParameter/diseaseApportionParamDetail/detail/page',
        method: 'post',
        data,
        btnCode: 'diseaseCostParamsData:list'
    })
}

// 查询参数数据
export function oneParamsData(id) {
    return request({
        url: `/methodParameter/diseaseApportionParam/${id}`,
        method: 'get',
        btnCode: 'diseaseCostParamsData:list'
    })
}

// 新增参数数据
export function addParamsData(data) {
    return request({
        url: '/methodParameter/diseaseApportionParam/add',
        method: 'post',
        data,
        btnCode: 'diseaseCostParamsData:add'
    })
}

// 新增参数数据明细
export function addParamsDataDetail(data) {
    return request({
        url: '/methodParameter/diseaseApportionParamDetail/add',
        method: 'post',
        data,
        btnCode: 'diseaseCostParamsData:add'
    })
}

// 修改参数数据
export function updateParamsData(data) {
    return request({
        url: '/methodParameter/diseaseApportionParam/update',
        method: 'post',
        data,
        btnCode: 'diseaseCostParamsData:update'
    })
}

// 修改参数数据明细
export function updateParamsDataDetail(data) {
    return request({
        url: '/methodParameter/diseaseApportionParamDetail/update',
        method: 'post',
        data,
        btnCode: 'diseaseCostParamsData:update'
    })
}

// 删除参数数据
export function deleteParamsData(data) {
    return request({
        url: '/methodParameter/diseaseApportionParam/byDelete',
        method: 'post',
        data,
        btnCode: 'diseaseCostParamsData:delete'
    })
}

// 删除参数数据明细
export function deleteParamsDataDetail(data) {
    return request({
        url: '/methodParameter/diseaseApportionParamDetail/byDelete',
        method: 'post',
        data,
        btnCode: 'diseaseCostParamsData:delete'
    })
}

// 确认参数数据
export function enableParamsData(data) {
    return request({
        url: '/methodParameter/diseaseApportionParam/confirm',
        method: 'post',
        data,
        btnCode: 'diseaseCostParamsData:confirm'
    })
}

// 取消确认参数数据
export function disableParamsData(data) {
    return request({
        url: '/methodParameter/diseaseApportionParam/cancelConfirm',
        method: 'post',
        data,
        btnCode: 'diseaseCostParamsData:confirm'
    })
}

// 采集参数数据
export function collectParamsData(data) {
    return request({
        url: `/methodParameter/diseaseApportionParam/in/collect`,
        method: 'post',
        data,
        btnCode: 'diseaseCostParamsData:collect'
    })
}

// 导出参数数据
export function exportParamsData(params) {
    return request({
        url: '/methodParameter/diseaseApportionParam/excel',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'diseaseCostParamsData:export'
    })
}

// 导出参数数据明细
export function exportParamsDataDetail(params) {
    return request({
        url: `/methodParameter/diseaseApportionParamDetail/excel/${params.orderId}`,
        method: 'get',
        responseType: 'blob',
        btnCode: 'diseaseCostParamsData:export'
    })
}

// 导出参数数据明细页
export function exportParamsDataDetailPage(data) {
    return request({
        url: '/methodParameter/diseaseApportionParamDetail/detail/excel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'diseaseCostParamsData:export'
    })
}
