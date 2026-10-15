import request from '@/utils/request'

export function pageControlQuery(params) {
    return request({
        url: '/deptCost/deptConfigCalculateRecords/selectPage',
        method: 'get',
        params,
        btnCode: 'deptCost:targetConfig:list'
    })
}

export function exportControlQuery(params) {
    return request({
        url: '/deptCost/deptConfigCalculateRecords/exportExcel',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'deptCost:targetConfig:export'
    })
}
