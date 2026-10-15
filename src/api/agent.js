import request from '@/utils/request'


// 	资源动因resource/作业动因activity


//  ---------------------  资源动因  ---------------------------
// 列表
export function itemdriverresource(params) {
    return request({
        url: '/item/driver/resource',
        method: 'get',
        params,
        btnCode: 'resourceAgent:list'
    })
}
// 新增
export function itemdriverresourceadd(data) {
    return request({
        url: '/item/driver/resource/add',
        method: 'post',
        data,
        btnCode: 'resourceAgent:add'
    })
}
// 修改
export function itemdriverresourceupdate(data) {
    return request({
        url: '/item/driver/resource/update',
        method: 'post',
        data,
        btnCode: 'resourceAgent:update'
    })
}
// 删除
export function itemdriverresourcedel(data) {
    return request({
        url: '/item/driver/resource/del',
        method: 'post',
        data,
        btnCode: 'resourceAgent:delete'
    })
}

// 导出
export function itemdriverresourceexportExcel(params) {
    return request({
        url: '/item/driver/resource/exportExcel',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'resourceAgent:export'
    })
}

//  ---------------------  作业动因  ---------------------------
// 列表
export function itemdriveractivity(params) {
    return request({
        url: '/item/driver/activity',
        method: 'get',
        params,
        btnCode: 'taskAgent:list'
    })
}
// 新增
export function itemdriveractivityadd(data) {
    return request({
        url: '/item/driver/activity/add',
        method: 'post',
        data,
        btnCode: 'taskAgent:add'
    })
}
// 修改
export function itemdriveractivityupdate(data) {
    return request({
        url: '/item/driver/activity/update',
        method: 'post',
        data,
        btnCode: 'taskAgent:update'
    })
}
// 删除
export function itemdriveractivitydel(data) {
    return request({
        url: '/item/driver/activity/del',
        method: 'post',
        data,
        btnCode: 'taskAgent:delete'
    })
}

// 导出
export function itemdriveractivityexportExcel(params) {
    return request({
        url: '/item/driver/activity/exportExcel',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'taskAgent:export'
    })
}
