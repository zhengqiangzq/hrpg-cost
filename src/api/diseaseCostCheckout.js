import request from '@/utils/request'

export function pageCheckout(params) {
    return request({
        url: '/monthClose/diseaseCostMonthClose/page',
        method: 'get',
        params,
        btnCode: 'diseaseCostCheckout:list'
    })
}

export function checkout(params) {
    return request({
        url: '/monthClose/diseaseCostMonthClose/close',
        method: 'get',
        params,
        btnCode: 'diseaseCostCheckout:checkout'
    })
}

export function disCheckout(params) {
    return request({
        url: '/monthClose/diseaseCostMonthClose/reClose',
        method: 'get',
        params,
        btnCode: 'diseaseCostCheckout:checkout'
    })
}

export function closeCheckCheckout(params) {
    return request({
        url: '/monthClose/diseaseCostMonthClose/closeCheck',
        method: 'get',
        params,
        btnCode: 'diseaseCostCheckout:checkout'
    })
}

export function reCloseCheckCheckout(params) {
    return request({
        url: '/monthClose/diseaseCostMonthClose/reMonthCloseCheck',
        method: 'get',
        params,
        btnCode: 'diseaseCostCheckout:checkout'
    })
}
