import request from '@/utils/request'

export function pageControlIndicators(params) {
    return request({
        url: '/deptCost/deptControlIndicators/page',
        method: 'get',
        params,
        btnCode: 'deptCost:controlIndicators:list'
    })
}

export function oneControlIndicators(id) {
    return request({
        url: `/deptCost/deptControlIndicators/${id}`,
        method: 'get',
        btnCode: 'deptCost:controlIndicators:list'
    })
}

export function addControlIndicators(data) {
    return request({
        url: '/deptCost/deptControlIndicators',
        method: 'post',
        data,
        btnCode: 'deptCost:controlIndicators:add'
    })
}

export function updateControlIndicators(data) {
    return request({
        url: '/deptCost/deptControlIndicators/byPost',
        method: 'post',
        data,
        btnCode: 'deptCost:controlIndicators:update'
    })
}

export function deleteControlIndicators(data) {
    return request({
        url: '/deptCost/deptControlIndicators/byDelete',
        method: 'post',
        data,
        btnCode: 'deptCost:controlIndicators:delete'
    })
}

export function enableControlIndicators(data) {
    return request({
        url: '/deptCost/deptControlIndicators/enable',
        method: 'post',
        data,
        btnCode: 'deptCost:controlIndicators:enable'
    })
}

export function disableControlIndicators(data) {
    return request({
        url: '/deptCost/deptControlIndicators/disable',
        method: 'post',
        data,
        btnCode: 'deptCost:controlIndicators:enable'
    })
}

export function verifyControlIndicators(data) {
    return request({
        url: '/deptCost/deptControlIndicators/sqlVerification',
        method: 'post',
        data
    })
}

export function exportControlIndicators(params) {
    return request({
        url: '/deptCost/deptControlIndicators/exportExcel',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'deptCost:controlIndicators:export'
    })
}
