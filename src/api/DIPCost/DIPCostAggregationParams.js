import request from '@/utils/request'

// 分页查询归集参数
export function pageAggregationParams(params) {
    return request({
        url: '/dip/methodService/apportionService/page',
        method: 'get',
        params,
        btnCode: 'DIPCostAggregationParams:list'
    })
}

// 新增归集参数
export function addAggregationParams(data) {
    return request({
        url: '/dip/methodService/apportionService',
        method: 'post',
        data,
        btnCode: 'DIPCostAggregationParams:add'
    })
}

// 修改归集参数
export function updateAggregationParams(data) {
    return request({
        url: '/dip/methodService/apportionService/byPost',
        method: 'post',
        data,
        btnCode: 'DIPCostAggregationParams:update'
    })
}

// 批量修改归集参数
export function batchUpdateAggregationParams(data) {
    return request({
        url: '/dip/methodService/apportionService/batchUpdate/byPost',
        method: 'post',
        data,
        btnCode: 'DIPCostAggregationParams:update'
    })
}

// 删除归集参数
export function deleteAggregationParams(data) {
    return request({
        url: '/dip/methodService/apportionService/byDelete',
        method: 'post',
        data,
        btnCode: 'DIPCostAggregationParams:delete'
    })
}

// 导出归集参数
export function exportAggregationParams(data) {
    return request({
        url: '/dip/methodService/apportionService/excel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'DIPCostAggregationParams:export'
    })
}

