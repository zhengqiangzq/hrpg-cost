import request from '@/utils/request'

export function pageHighLowMethod(params) {
    return request({
        url: '/deptCost/deptForecastScheme/highLowMethod',
        method: 'get',
        params,
        btnCode: 'deptCost:highLowMethod:list'
    })
}

export function exportHighLowMethod(params) {
    return request({
        url: '/deptCost/deptForecastScheme/exportExcel/highLowMethod',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'deptCost:highLowMethod:export'
    })
}
