import request from '@/utils/request'

export function pageGeneralLedgerDataDeptCostData(params) {
    return request({
        url: '/deptCost/deptGeneralLedgerCost/page',
        method: 'get',
        params
    })
}

export function pageGeneralLedgerDataDeptCostDataDetail(params) {
    return request({
        url: '/deptCost/deptGeneralLedgerCostDetail/page',
        method: 'get',
        params
    })
}

export function pageGeneralLedgerDataDeptCostDataDetailList(data) {
    return request({
        url: '/deptCost/deptGeneralLedgerCostDetail/detail/page',
        method: 'post',
        data
    })
}

export function oneGeneralLedgerDataDeptCostData(id) {
    return request({
        url: `/deptCost/deptGeneralLedgerCost/${id}`,
        method: 'get'
    })
}

export function collectGeneralLedgerDataDeptCostData(params) {
    return request({
        url: `/deptCost/deptGeneralLedgerCost/in/collect/${params.accountingPeriodId}`,
        method: 'get',
        params,
    })
}

export function addGeneralLedgerDataDeptCostData(data) {
    return request({
        url: '/deptCost/deptGeneralLedgerCost/add',
        method: 'post',
        data
    })
}

export function addGeneralLedgerDataDeptCostDataDetail(data) {
    return request({
        url: '/deptCost/deptGeneralLedgerCostDetail/add',
        method: 'post',
        data
    })
}

export function updateGeneralLedgerDataDeptCostData(data) {
    return request({
        url: '/deptCost/deptGeneralLedgerCost/update',
        method: 'post',
        data
    })
}

export function updateGeneralLedgerDataDeptCostDataDetail(data) {
    return request({
        url: '/deptCost/deptGeneralLedgerCostDetail/update',
        method: 'post',
        data
    })
}

export function deleteGeneralLedgerDataDeptCostData(data) {
    return request({
        url: '/deptCost/deptGeneralLedgerCost/byDelete',
        method: 'post',
        data
    })
}

// 删除成本数据详情
export function deleteGeneralLedgerDataDeptCostDataDetail(data) {
    return request({
        url: '/deptCost/deptGeneralLedgerCostDetail/deleteByIds',
        method: 'post',
        data
    })
}

export function enableGeneralLedgerDataDeptCostData(data, status) {
    const api = status == '1' ? '/deptCost/deptGeneralLedgerCost/confirm' : '/deptCost/deptGeneralLedgerCost/cancelConfirm'
    return request({
        url: api,
        method: 'post',
        data
    })
}

export function exportGeneralLedgerDataDeptCostData(params) {
    return request({
        url: '/deptCost/deptGeneralLedgerCost/excel',
        method: 'get',
        params,
        responseType: 'blob'
    })
}

export function exportGeneralLedgerDataDeptCostDataDetailList(data) {
    return request({
        url: '/deptCost/deptGeneralLedgerCostDetail/detail/excel',
        method: 'post',
        data,
        responseType: 'blob'
    })
}

export function pageGeneralLedgerDataDeptCostDataItem(params) {
    return request({
        url: '/deptCost/deptGeneralLedgerCost/deptItem',
        method: 'get',
        params
    })
}

export function validateGeneralLedgerDataDeptCostData(params) {
    return new Promise((resolve, reject) => {
        request({
            url: `/deptCost/deptGeneralLedgerCost/validate/${params.accountingPeriodId}`,
            method: 'get',
        }).then(res => {
            if (res.success) {
                resolve({
                    ...res,
                    data: res.data.map(it => {
                        return {
                            ...it,
                            item: it.level === '1' ? '&emsp;&emsp;' + it.item : it.item
                        }
                    })
                })
            } else {
                resolve(res)
            }
        }).catch(err => {
            reject(err)
        })
    })
}
