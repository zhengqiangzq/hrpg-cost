import request from '@/utils/request'

export function pageForecastExecute(params) {
    return request({
        url: '/deptCost/deptForecastScheme/forecastExecute',
        method: 'get',
        params,
        btnCode: 'deptCost:forecastExecute:list'
    })
}

export function exportForecastExecute(params) {
    return request({
        url: '/deptCost/deptForecastScheme/exportExcel/forecastExecute',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'deptCost:forecastExecute:export'
    })
}
