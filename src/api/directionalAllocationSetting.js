import request from '@/utils/request'

// 分页查询定向分摊设置
export function pageDirectionAllocationSetting(data) {
    return request({
        url: '/directApportionment/page',
        method: 'post',
        data,
        btnCode: 'directionalAllocationSetting:list'
    })
}

// 新增定向分摊设置
export function addDirectionAllocationSetting(data) {
    return request({
        url: '/directApportionment/add',
        method: 'post',
        data,
        btnCode: 'directionalAllocationSetting:add'
    })
}

// 更新定向分摊设置
export function updateDirectionAllocationSetting(data) {
    return request({
        url: '/directApportionment/update',
        method: 'post',
        data,
        btnCode: 'directionalAllocationSetting:update'
    })
}

// 删除定向分摊设置
export function deleteDirectionAllocationSetting(data) {
    return request({
        url: '/directApportionment/byDelete',
        method: 'post',
        data,
        btnCode: 'directionalAllocationSetting:delete'
    })
}

// 复制
export function directApportionmentcopy(data) {
    return request({
        url: '/directApportionment/copy',
        method: 'post',
        data,
        btnCode: 'directionalAllocationSetting:copy'
    })
}

// 详情
export function directApportionmentgetById(params) {
    return request({
        url: '/directApportionment/getById',
        method: 'get',
        params,
        btnCode: 'directionalAllocationSetting:list'
    })
}
// 明细查询
export function directApportionmentqueryDetailPage(data) {
    return request({
        url: '/directApportionment/queryDetailPage',
        method: 'post',
        data,
        btnCode: 'directionalAllocationSetting:list'
    })
}

// 导出定向分摊设置
export function exportDirectionAllocationSetting(data) {
    return request({
        url: '/directApportionment/exportExcel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'directionalAllocationSetting:export'
    })
}

// 导出明细定向分摊设置
export function directApportionmentexportDetailExcel(data) {
    return request({
        url: '/directApportionment/exportDetailExcel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'directionalAllocationSetting:export'
    })
}
