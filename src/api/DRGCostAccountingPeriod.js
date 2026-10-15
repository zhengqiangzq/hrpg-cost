import request from '@/utils/request'

// 分页查询成本核算期间
export function pageAccountingPeriod(params) {
    return request({
        url: '/base/drgAccountingPeriod/page',
        method: 'get',
        params,
        btnCode: 'DRGCostAccountingPeriod:list'
    })
}

// 新增成本核算期间
export function addAccountingPeriod(data) {
    return request({
        url: '/base/drgAccountingPeriod',
        method: 'post',
        data,
        btnCode: 'DRGCostAccountingPeriod:add'
    })
}

// 更新成本核算期间
export function updateAccountingPeriod(data) {
    return request({
        url: '/base/drgAccountingPeriod/byPost',
        method: 'post',
        data,
        btnCode: 'DRGCostAccountingPeriod:update'
    })
}

// 删除成本核算期间
export function deleteAccountingPeriod(data) {
    return request({
        url: '/base/drgAccountingPeriod/byDelete',
        method: 'post',
        data,
        btnCode: 'DRGCostAccountingPeriod:delete'
    })
}

// 分配
export function drgAccountingPeriodallocationData(data) {
    return request({
        url: '/base/drgAccountingPeriod/allocationData',
        method: 'post',
        data
    })
}

// 取消分配
export function drgAccountingPeriodcelAllocationData(data) {
    return request({
        url: '/base/drgAccountingPeriod/cancelAllocationData',
        method: 'post',
        data
    })
}
