import request from '@/utils/request'

// 分页查询成本核算期间
export function pageAccountingPeriod(params) {
    return request({
        url: '/base/diseaseAccountingPeriod/page',
        method: 'get',
        params,
        btnCode: 'diseaseCostAccountingPeriod:list'
    })
}

// 新增成本核算期间
export function addAccountingPeriod(data) {
    return request({
        url: '/base/diseaseAccountingPeriod',
        method: 'post',
        data,
        btnCode: 'diseaseCostAccountingPeriod:add'
    })
}

// 更新成本核算期间
export function updateAccountingPeriod(data) {
    return request({
        url: '/base/diseaseAccountingPeriod/byPost',
        method: 'post',
        data,
        btnCode: 'diseaseCostAccountingPeriod:update'
    })
}

// 删除成本核算期间
export function deleteAccountingPeriod(data) {
    return request({
        url: '/base/diseaseAccountingPeriod/byDelete',
        method: 'post',
        data,
        btnCode: 'diseaseCostAccountingPeriod:delete'
    })
}


// 分配
export function diseaseAccountingPeriodallocationData(data) {
    return request({
        url: '/base/diseaseAccountingPeriod/allocationData',
        method: 'post',
        data
    })
}

// 取消分配
export function diseaseAccountingPeriodcancelAllocationData(data) {
    return request({
        url: '/base/diseaseAccountingPeriod/cancelAllocationData',
        method: 'post',
        data
    })
}
