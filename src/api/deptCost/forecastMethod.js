import request from '@/utils/request'

export function pageForecastMethod(params) {
    return request({
        url: '/deptCost/deptForecastScheme/page',
        method: 'get',
        params,
        btnCode: 'deptCost:forecastMethod:list'
    })
}

export function addForecastMethod(data) {
    return request({
        url: '/deptCost/deptForecastScheme',
        method: 'post',
        data,
        btnCode: 'deptCost:forecastMethod:add'
    })
}

export function updateForecastMethod(data) {
    return request({
        url: '/deptCost/deptForecastScheme/byPost',
        method: 'post',
        data,
        btnCode: 'deptCost:forecastMethod:update'
    })
}

export function deleteForecastMethod(data) {
    return request({
        url: '/deptCost/deptForecastScheme/byDelete',
        method: 'post',
        data,
        btnCode: 'deptCost:forecastMethod:delete'
    })
}

export function confirmForecastMethod(data) {
    return request({
        url: '/deptCost/deptForecastScheme/confirm',
        method: 'post',
        data,
        btnCode: 'deptCost:forecastMethod:confirm'
    })
}


export function cancelForecastMethod(data) {
    return request({
        url: '/deptCost/deptForecastScheme/cancelConfirm',
        method: 'post',
        data,
        btnCode: 'deptCost:forecastMethod:confirm'
    })
}

export function exportForecastMethod(params) {
    return request({
        url: '/deptCost/deptForecastScheme/exportExcel',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'deptCost:forecastMethod:export'
    })
}
