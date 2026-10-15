import request from '@/utils/request'

// 分页查询成本拆分数据
export function pageCostSplitRule(params) {
    return request({
        url: '/deptCost/deptSplitRule/page',
        method: 'get',
        params,
        btnCode: 'costBreakdown:list'
    })
}

// 分页查询成本拆分明细数据 --- 明细页面
export function pageCostSplitRuleDetail(params) {
    return request({
        url: '/deptCost/deptSplitRule/detail/page',
        method: 'get',
        params,
        btnCode: 'costBreakdown:list'
    })
}



// 查询一条成本拆本信息
export function oneCostSplitRule(id) {
    return request({
        url: `/deptCost/deptSplitRule/getOneById/${id}`,
        method: 'get',
        btnCode: 'costBreakdown:list'
    })
}

// 新增成本拆分数据
export function addCostSplitRule(data) {
    return request({
        url: '/deptCost/deptSplitRule/save',
        method: 'post',
        data,
        btnCode: 'costBreakdown:add'
    })
}

// 删除成本拆分
export function deleteCostSplitRule(data) {
    return request({
        url: '/deptCost/deptSplitRule/delete',
        method: 'post',
        data,
        btnCode: 'costBreakdown:delete'
    })
}

// 导出成本拆分
export function exportCostSplitRule(data) {
    return request({
        url: '/deptCost/deptSplitRule/excel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'costBreakdown:export'
    })
}

// 更新成本拆分数据
export function updateCostSplitRule(data) {
    return request({
        url: '/deptCost/deptSplitRule/update',
        method: 'post',
        data,
        btnCode: 'costBreakdown:update'
    })
}

// 复制成本拆分数据
export function copyCostSplitRule(data) {
    return request({
        url: '/deptCost/deptSplitRule/copy',
        method: 'post',
        data,
        btnCode: 'costBreakdown:copy'
    })
}

// 导出成本拆分明细
export function exportCostSplitRuleDetail(data) {
    return request({
        url: '/deptCost/deptSplitRule/excelDetail',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'costBreakdown:export'
    })
}
