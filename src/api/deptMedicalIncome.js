import request from '@/utils/request'

export function pageDeptMedicalIncome(params) {
    return request({
        url: '/deptCost/deptGeneralLedgerIncome/page',
        method: 'get',
        params
    })
}

export function pageDeptMedicalIncomeDetail(params) {
    return request({
        url: '/deptCost/deptGeneralLedgerIncomeDetail/page',
        method: 'get',
        params
    })
}

export function pageDeptMedicalIncomeDetailList(data) {
    return request({
        url: '/deptCost/deptGeneralLedgerIncomeDetail/detail/page',
        method: 'post',
        data
    })
}

export function oneDeptMedicalIncome(id) {
    return request({
        url: `/deptCost/deptGeneralLedgerIncome/${id}`,
        method: 'get'
    })
}

export function collectDeptMedicalIncome(params) {
    return request({
        url: `/deptCost/deptGeneralLedgerIncome/in/collect/${params.accountingPeriodId}`,
        method: 'get',
        params,
    })
}

export function addDeptMedicalIncome(data) {
    return request({
        url: '/deptCost/deptGeneralLedgerIncome/add',
        method: 'post',
        data
    })
}

export function addDeptMedicalIncomeDetail(data) {
    return request({
        url: '/deptCost/deptGeneralLedgerIncomeDetail/add',
        method: 'post',
        data
    })
}

export function updateDeptMedicalIncome(data) {
    return request({
        url: '/deptCost/deptGeneralLedgerIncome/update',
        method: 'post',
        data
    })
}

export function updateDeptMedicalIncomeDetail(data) {
    return request({
        url: '/deptCost/deptGeneralLedgerIncomeDetail/update',
        method: 'post',
        data
    })
}

export function deleteDeptMedicalIncome(data) {
    return request({
        url: '/deptCost/deptGeneralLedgerIncome/byDelete',
        method: 'post',
        data
    })
}

// 删除成本数据详情
export function deleteDeptMedicalIncomeDetail(data) {
    return request({
        url: '/deptCost/deptGeneralLedgerIncomeDetail/deleteByIds',
        method: 'post',
        data
    })
}

export function enableDeptMedicalIncome(data, status) {
    const api = status == '1' ? '/deptCost/deptGeneralLedgerIncome/confirm' : '/deptCost/deptGeneralLedgerIncome/cancelConfirm'
    return request({
        url: api,
        method: 'post',
        data
    })
}

export function exportDeptMedicalIncome(params) {
    return request({
        url: '/deptCost/deptGeneralLedgerIncome/excel',
        method: 'get',
        params,
        responseType: 'blob'
    })
}

export function exportDeptMedicalIncomeDetailList(data) {
    return request({
        url: '/deptCost/deptGeneralLedgerIncomeDetail/detail/excel',
        method: 'post',
        data,
        responseType: 'blob'
    })
}

export function validateDeptMedicalIncome(params) {
    return new Promise((resolve, reject) => {
        request({
            url: `/deptCost/deptGeneralLedgerIncome/validate/${params.accountingPeriodId}`,
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
