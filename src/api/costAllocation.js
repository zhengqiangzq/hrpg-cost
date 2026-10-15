import request from '@/utils/request'

// 分页查询成本归集
export function pageCostAllocation(params) {
    return request({
        url: '/accumulation/deptCostMerge/queryByCondition',
        method: 'get',
        params,
        btnCode: 'costAllocation:list'
    })
}

// 分页查询成本归集明细
export function pageCostAllocationDetail(data) {
    return request({
        url: '/accumulation/deptCostMergeDetail/queryByCondition',
        method: 'post',
        data,
        btnCode: 'costAllocation:list'
    })
}

// 查询成本归集明细
export function oneCostAllocation(id) {
    return request({
        url: `/accumulation/deptCostMerge/${id}`,
        method: 'get',
        btnCode: 'costAllocation:list'
    })
}

// 归集成本归集
export function collectCostAllocation(data) {
    return request({
        url: '/accumulation/deptCostMerge/merge',
        method: 'post',
        data,
        btnCode: 'costAllocation:collect'
    })
}

// 校验成本归集
export function checkCostAllocation(accountingPeriodMonthId) {
    return request({
        url: `/accumulation/deptCostMerge/validate/${accountingPeriodMonthId}`,
        method: 'get',
        btnCode: 'costAllocation:check'
    })
}

// 删除成本归集
export function deleteCostAllocation(data) {
    return request({
        url: '/accumulation/deptCostMerge/delete',
        method: 'post',
        data,
        btnCode: 'costAllocation:delete'
    })
}

// 确认/取消确认成本归集
export function enableCostAllocation(status, data) {
    return request({
        url: status == '1' ? '/accumulation/deptCostMerge/confirm' : '/accumulation/deptCostMerge/cancelConfirm',
        method: 'post',
        data,
        btnCode: 'costAllocation:confirm'
    })
}

// 导出成本归集
export function exportCostAllocation(data) {
    return request({
        url: '/accumulation/deptCostMerge/excel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'costAllocation:export'
    })
}

// 导出成本归集明细
export function exportCostAllocationDetail(data) {
    return request({
        url: '/accumulation/deptCostMerge/excelAll',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'costAllocation:export'
    })
}
