import request from '@/utils/request'




//  --------------  结账   ------------------

// 列表
export function itemCloseMonthClosepage(data) {
    return request({
        url: '/itemCloseMonthClose/page',
        method: 'post',
        data,
        btnCode: 'procostCheckout:list'
    })
}
// 结账
export function itemCloseMonthCloseclose(params) {
    return request({
        url: '/itemCloseMonthClose/close',
        method: 'get',
        params,
        btnCode: 'procostCheckout:check'
    })
}

// 反结账
export function itemCloseMonthClosereClose(params) {
    return request({
        url: '/itemCloseMonthClose/reClose',
        method: 'get',
        params,
        btnCode: 'procostCheckout:check'
    })
}

// 检查结账
export function closeCheckMonthCloseclose(params) {
    return request({
        url: '/itemCloseMonthClose/closeCheck',
        method: 'get',
        params,
        btnCode: 'procostCheckout:check'
    })
}

// 反检查结账
export function reCloseCheckMonthCloseclose(params) {
    return request({
        url: '/itemCloseMonthClose/reMonthCloseCheck',
        method: 'get',
        params,
        btnCode: 'procostCheckout:check'
    })
}


