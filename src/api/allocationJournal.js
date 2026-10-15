import request from '@/utils/request'

// 分摊流水账
export function costAccountqueryList(data) {
    return request({
        url: '/costAccount/queryList',
        method: 'post',
        data,
        btnCode: 'allocationJournal:list'
    })
}

// 导出分摊流水账
export function costAccountexportCostAccount(data) {
    return request({
        url: '/costAccount/exportCostAccount',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'allocationJournal:exportExcel'
    })
}
// 分摊验证
export function costAccountqueryVerify(data) {
    return request({
        url: '/costAccount/queryVerify',
        method: 'post',
        data,
        btnCode: 'allocationVerification:list'
    })
}

// 导出分摊验证
export function costAccountexportVerify(data) {
    return request({
        url: '/costAccount/exportVerify',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'allocationVerification:export'
    })
}
