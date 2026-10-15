import request from '@/utils/request'

// 分页查询参数数据
export function pageParamData(params) {
    return request({
        url: '/deptApportionmentParam/page',
        method: 'get',
        params,
        btnCode: 'paramData:list'
    })
}

// 查询参数数据明细
export function oneParamData(id) {
    return request({
        url: `/deptApportionmentParam/detail/${id}`,
        method: 'get',
        btnCode: 'paramData:list'
    })
}

// 分页查询参数数据详情
export function pageParamDataDetail(data) {
    return request({
        url: '/deptApportionmentParam/detail/page',
        method: 'post',
        data,
        btnCode: 'paramData:list'
    })
}

// 新增参数数据
export function addParamData(data) {
    return request({
        url: '/deptApportionmentParam/add',
        method: 'post',
        data,
        btnCode: 'paramData:add'
    })
}

// 新增参数数据明细
export function addParamDataDetail(data) {
    return request({
        url: '/deptApportionmentParam/detail/add',
        method: 'post',
        data,
        btnCode: 'paramData:add'
    })
}

// 更新参数据
export function updateParamData(data) {
    return request({
        url: '/deptApportionmentParam/update',
        method: 'post',
        data,
        btnCode: 'paramData:update'
    })
}

// 更新参数据明细
export function updateParamDataDetail(data) {
    return request({
        url: '/deptApportionmentParam/detail/update',
        method: 'post',
        data,
        btnCode: 'paramData:update'
    })
}

// 计算总参数
export function calcParamDataAmount(id) {
    return request({
        url: `/deptApportionmentParam/calculateTotalValue/${id}`,
        method: 'get',
        btnCode: 'paramData:list'
    })
}

// 删除参数数据
export function deleteParamData(data) {
    return request({
        url: '/deptApportionmentParam/byDelete',
        method: 'post',
        data,
        btnCode: 'paramData:delete'
    })
}

// 删除参数数据明细
export function deleteParamDataDetail(data) {
    return request({
        url: '/deptApportionmentParam/detail/byDelete',
        method: 'post',
        data,
        btnCode: 'paramData:delete'
    })
}

// 复制参数数据
export function copyParamData(data) {
    return request({
        url: '/deptApportionmentParam/copy',
        method: 'post',
        data,
        btnCode: 'paramData:copy'
    })
}

// 确认/取消确认参数数据
export function enableParamData(data) {
    return request({
        url: '/deptApportionmentParam/confirm',
        method: 'post',
        data,
        btnCode: 'paramData:confirm'
    })
}

// 采集
export function deptApportionmentParamcollection(data) {
    return request({
        url: '/deptApportionmentParam/collection',
        method: 'post',
        data,
        btnCode: 'paramData:collect'
    })
}

// 导出参数数据
export function exportParamData(params) {
    return request({
        url: '/deptApportionmentParam/exportExcel',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'paramData:export'
    })
}

// 导出参数数据详情
export function exportParamDataDetail(params) {
    return request({
        url: '/deptApportionmentParam/detail/exportDetailExcelByDeptCost',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'paramData:export'
    })
}

// 导出参数数据明细列表
export function exportParamDataDetailList(data) {
    return request({
        url: '/deptApportionmentParam/detail/exportDetailExcel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'paramData:export'
    })
}
