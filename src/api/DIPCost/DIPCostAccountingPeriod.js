import request from '@/utils/request'

// 分页查询成本核算期间
export function dipAccountingPeriodPage(params) {
    return request({
        url: '/base/dipAccountingPeriod/page',
        method: 'get',
        params,
        btnCode: 'DIPCostAccountingPeriod:list'
    })
}

// 新增成本核算期间
export function addAccountingPeriod(data) {
    return request({
        url: '/base/dipAccountingPeriod',
        method: 'post',
        data,
        btnCode: 'DIPCostAccountingPeriod:add'
    })
}

// 更新成本核算期间
export function updateAccountingPeriod(data) {
    return request({
        url: '/base/dipAccountingPeriod/byPost',
        method: 'post',
        data,
        btnCode: 'DIPCostAccountingPeriod:update'
    })
}

// 删除成本核算期间
export function deleteAccountingPeriod(data) {
    return request({
        url: '/base/dipAccountingPeriod/byDelete',
        method: 'post',
        data,
        btnCode: 'DIPCostAccountingPeriod:delete'
    })
}


// 分配
export function dipAccountingPeriodallocationData(data) {
    return request({
        url: '/base/dipAccountingPeriod/allocationData',
        method: 'post',
        data
    })
}

// 取消分配
export function dipAccountingPeriodcancelAllocationData(data) {
    return request({
        url: '/base/dipAccountingPeriod/cancelAllocationData',
        method: 'post',
        data
    })
}
