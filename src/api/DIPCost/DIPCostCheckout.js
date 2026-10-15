import request from '@/utils/request'

export function pageCheckout(params) {
    return request({
        url: '/dip/monthClose/costMonthClose/page',
        method: 'get',
        params,
        btnCode: 'DIPCostCheckout:list'
    })
}

export function checkout(params) {
    return request({
        url: '/dip/monthClose/costMonthClose/close',
        method: 'get',
        params,
        btnCode: 'DIPCostCheckout:checkout'
    })
}

export function disCheckout(params) {
    return request({
        url: '/dip/monthClose/costMonthClose/reClose',
        method: 'get',
        params,
        btnCode: 'DIPCostCheckout:checkout'
    })
}


export function closeCheckCheckout(params) {
    return request({
        url: '/dip/monthClose/costMonthClose/closeCheck',
        method: 'get',
        params,
        btnCode: 'DIPCostCheckout:checkout'
    })
}

export function reCloseCheckCheckout(params) {
    return request({
        url: '/dip/monthClose/costMonthClose/reMonthCloseCheck',
        method: 'get',
        params,
        btnCode: 'DIPCostCheckout:checkout'
    })
}
