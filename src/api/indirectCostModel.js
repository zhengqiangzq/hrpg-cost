import request from '@/utils/request'


// ---------------- 资源动因设置 -----------------------
// 分页
export function itemResourceDriverConfigqueryListByPage(data) {
    return request({
        url: '/item/itemResourceDriverConfig/queryListByPage',
        method: 'post',
        data,
        btnCode: 'resourceDriverSet:list'
    })
}
// 新增
export function itemResourceDriverConfigsave(data) {
    return request({
        url: '/item/itemResourceDriverConfig/save',
        method: 'post',
        data,
        btnCode: 'resourceDriverSet:add'
    })
}

// 批量新增
export function itemResourceDriverConfigbatchSave(data) {
    return request({
        url: '/item/itemResourceDriverConfig/batchSave',
        method: 'post',
        data,
        btnCode: 'resourceDriverSet:add'
    })
}
// 编辑
export function itemResourceDriverConfigupdateById(data) {
    return request({
        url: '/item/itemResourceDriverConfig/updateById',
        method: 'post',
        data,
        btnCode: 'resourceDriverSet:update'
    })
}


// 确认
export function itemResourceDriverConfigsureByIds(data) {
    return request({
        url: '/item/itemResourceDriverConfig/sureByIds',
        method: 'post',
        data,
        btnCode: 'resourceDriverSet:confirm'
    })
}

// 取消确认
export function itemResourceDriverConfigunSureByIds(data) {
    return request({
        url: '/item/itemResourceDriverConfig/unSureByIds',
        method: 'post',
        data,
        btnCode: 'resourceDriverSet:confirm'
    })
}
// 批量删除
export function itemResourceDriverConfigdelByIds(data) {
    return request({
        url: '/item/itemResourceDriverConfig/delByIds',
        method: 'post',
        data,
        btnCode: 'resourceDriverSet:delete'
    })
}

// 详情
export function itemResourceDriverConfigId(params) {
    return request({
        url: '/item/itemResourceDriverConfig/getById',
        method: 'get',
        params,
        btnCode: 'resourceDriverSet:list'
    })
}

// 导出
export function itemResourceDriverConfigexportExcel(data) {
    return request({
        url: '/item/itemResourceDriverConfig/exportExcel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'resourceDriverSet:export'
    })
}

// ---------------- 资源动因设置  子表 -----------------------
// 分页
export function itemResourceDriverConfigDetailqueryListByConfigId(params) {
    return request({
        url: '/item/itemResourceDriverConfigDetail/queryListByConfigId',
        method: 'get',
        params,
        btnCode: 'resourceDriverSet:list'
    })
}



// ---------------- 作业动因设置 -----------------------
// 分页
export function itemActivityDriverConfigselectAllForPrint(data) {
    return request({
        url: '/item/itemActivityDriverConfig/queryListByPage',
        method: 'post',
        data,
        btnCode: 'activityDriverSet:list'
    })
}
// 新增
export function itemActivityDriverConfigsave(data) {
    return request({
        url: '/item/itemActivityDriverConfig/save',
        method: 'post',
        data,
        btnCode: 'activityDriverSet:add'
    })
}

// 编辑
export function itemActivityDriverConfigupdateById(data) {
    return request({
        url: '/item/itemActivityDriverConfig/updateById',
        method: 'post',
        data,
        btnCode: 'activityDriverSet:update'
    })
}

// 确认
export function itemActivityDriverConfigsureByIds(data) {
    return request({
        url: '/item/itemActivityDriverConfig/sureByIds',
        method: 'post',
        data,
        btnCode: 'activityDriverSet:confirm'
    })
}

// 取消确认
export function itemActivityDriverConfigunSureByIds(data) {
    return request({
        url: '/item/itemActivityDriverConfig/unSureByIds',
        method: 'post',
        data,
        btnCode: 'activityDriverSet:confirm'
    })
}

// 批量删除
export function itemActivityDriverConfigdelByIds(data) {
    return request({
        url: '/item/itemActivityDriverConfig/delByIds',
        method: 'post',
        data,
        btnCode: 'activityDriverSet:delete'
    })
}

// 详情
export function itemActivityDriverConfigId(params) {
    return request({
        url: '/item/itemActivityDriverConfig/getById',
        method: 'get',
        params,
        btnCode: 'activityDriverSet:list'
    })
}

// 导出
export function itemActivityDriverConfigexportExcel(data) {
    return request({
        url: '/item/itemActivityDriverConfig/exportExcel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'activityDriverSet:export'
    })
}

// ---------------- 作业动因设置  子表 -----------------------
// 分页
export function itemActivityDriverConfigDetailall(params) {
    return request({
        url: '/item/itemActivityDriverConfigDetail/all',
        method: 'get',
        params,
        btnCode: 'activityDriverSet:list'
    })
}




