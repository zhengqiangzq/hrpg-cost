import request from '@/utils/request'

export function pageCheckout(params) {
    return request({
        url: '/drg/monthClose/costMonthClose/page',
        method: 'get',
        params,
        btnCode: 'DRGCostCheckout:list'
    })
}

export function checkout(params) {
    return request({
        url: '/drg/monthClose/costMonthClose/close',
        method: 'get',
        params,
        btnCode: 'DRGCostCheckout:checkout'
    })
}

export function disCheckout(params) {
    return request({
        url: '/drg/monthClose/costMonthClose/reClose',
        method: 'get',
        params,
        btnCode: 'DRGCostCheckout:checkout'
    })
}


export function closeCheckCheckout(params) {
    return request({
        url: '/drg/monthClose/costMonthClose/closeCheck',
        method: 'get',
        params,
        btnCode: 'DRGCostCheckout:checkout'
    })
}

export function reCloseCheckCheckout(params) {
    return request({
        url: '/drg/monthClose/costMonthClose/reMonthCloseCheck',
        method: 'get',
        params,
        btnCode: 'DRGCostCheckout:checkout'
    })
}
