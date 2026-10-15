import request from '@/utils/request'
// 服务单元叠加法

// 分页查询参数数据
export function pageParamsData(params) {
    return request({
        url: '/methodService/diseaseApportionParamService/page',
        method: 'get',
        params,
        btnCode: 'diseaseCostServiceUnitParamsData:list'
    })
}

// 分页查询参数数据明细
export function pageParamsDataDetail(params) {
    return request({
        url: '/methodService/diseaseApportionParamServiceDetail/page',
        method: 'get',
        params,
        btnCode: 'diseaseCostServiceUnitParamsData:list'
    })
}

// 分页查询参数数据明细页
export function pageParamsDataDetailPage(params) {
    return request({
        url: '/methodService/diseaseApportionParamServiceDetail/page',
        method: 'get',
        params,
        btnCode: 'diseaseCostServiceUnitParamsData:list'
    })
}

// 查询参数数据
export function oneParamsData(id) {
    return request({
        url: `/methodService/diseaseApportionParamService/${id}`,
        method: 'get',
        btnCode: 'diseaseCostServiceUnitParamsData:list'
    })
}

// 新增参数数据
export function addParamsData(data) {
    return request({
        url: '/methodService/diseaseApportionParamService',
        method: 'post',
        data,
        btnCode: 'diseaseCostServiceUnitParamsData:add'
    })
}

// 新增参数数据明细
export function addParamsDataDetail(data) {
    return request({
        url: '/methodService/diseaseApportionParamServiceDetail',
        method: 'post',
        data,
        btnCode: 'diseaseCostServiceUnitParamsData:add'
    })
}

// 修改参数数据
export function updateParamsData(data) {
    return request({
        url: '/methodService/diseaseApportionParamService/byPost',
        method: 'post',
        data,
        btnCode: 'diseaseCostServiceUnitParamsData:update'
    })
}

// 修改参数数据明细
export function updateParamsDataDetail(data) {
    return request({
        url: '/methodService/diseaseApportionParamServiceDetail/byPost',
        method: 'post',
        data,
        btnCode: 'diseaseCostServiceUnitParamsData:update'
    })
}

// 删除参数数据
export function deleteParamsData(data) {
    return request({
        url: '/methodService/diseaseApportionParamService/byDelete',
        method: 'post',
        data,
        btnCode: 'diseaseCostServiceUnitParamsData:delete'
    })
}

// 删除参数数据明细
export function deleteParamsDataDetail(data) {
    return request({
        url: '/methodService/diseaseApportionParamServiceDetail/byDelete',
        method: 'post',
        data,
        btnCode: 'diseaseCostServiceUnitParamsData:delete'
    })
}

// 确认参数数据
export function enableParamsData(data) {
    return request({
        url: '/methodService/diseaseApportionParamService/confirm',
        method: 'post',
        data: {
            ids: data,
            status: 1
        },
        btnCode: 'diseaseCostServiceUnitParamsData:enable'
    })
}

// 取消确认参数数据
export function disableParamsData(data) {
    return request({
        url: '/methodService/diseaseApportionParamService/confirm',
        method: 'post',
        data: {
            ids: data,
            status: 0
        },
        btnCode: 'diseaseCostServiceUnitParamsData:enable'
    })
}

// 采集参数数据
export function collectParamsData(data) {
    return request({
        url: '/methodService/diseaseApportionParamService/collection',
        method: 'post',
        data,
        btnCode: 'diseaseCostServiceUnitParamsData:collect'
    })
}

// 导出参数数据
export function exportParamsData(data) {
    return request({
        url: '/methodService/diseaseApportionParamService/excel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'diseaseCostServiceUnitParamsData:export'
    })
}

// 导出参数数据明细
export function exportParamsDataDetail(data) {
    return request({
        url: '/methodService/diseaseApportionParamServiceDetail/excel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'diseaseCostServiceUnitParamsData:export'
    })
}

// 导出参数数据明细页
export function exportParamsDataDetailPage(data) {
    return request({
        url: '/methodService/diseaseApportionParamService/detail/excel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'diseaseCostServiceUnitParamsData:export'
    })
}
