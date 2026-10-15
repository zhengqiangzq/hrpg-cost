import request from '@/utils/request'

// ---------------- 资源动因值 -----------------------
// 分页
export function itemResourceDriverValuequeryListByPage(data) {
    return request({
        url: '/item/itemResourceDriverValue/queryListByPage',
        method: 'post',
        data,
        btnCode: 'resourceDriverVal:list'
    })
}

// 新增
export function itemResourceDriverValueadd(data) {
    return request({
        url: '/item/itemResourceDriverValue/save',
        method: 'post',
        data,
        btnCode: 'resourceDriverVal:add'
    })
}

// 编辑
export function itemResourceDriverValueupdateById(data) {
    return request({
        url: '/item/itemResourceDriverValue/updateById',
        method: 'post',
        data,
        btnCode: 'resourceDriverVal:update'
    })
}
// 删除
export function itemResourceDriverValuedelByIds(data) {
    return request({
        url: '/item/itemResourceDriverValue/delByIds',
        method: 'post',
        data,
        btnCode: 'resourceDriverVal:delete'
    })
}


// 详情
export function itemResourceDriverValuegetById(params) {
    return request({
        url: '/item/itemResourceDriverValue/getById',
        method: 'get',
        params,
        btnCode: 'resourceDriverVal:list'
    })
}

// 确认
export function itemResourceDriverValuesureByIds(data) {
    return request({
        url: '/item/itemResourceDriverValue/sureByIds',
        method: 'post',
        data,
        btnCode: 'resourceDriverVal:confirm'
    })
}
// 取消确认
export function itemResourceDriverValueunSureByIds(data) {
    return request({
        url: '/item/itemResourceDriverValue/unSureByIds',
        method: 'post',
        data,
        btnCode: 'resourceDriverVal:confirm'
    })
}

// 复制
export function itemResourceDriverValuecopyByCheckPeriodId(params) {
    return request({
        url: '/item/itemResourceDriverValue/copyByCheckPeriodId',
        method: 'get',
        params,
        btnCode: 'resourceDriverVal:copy'
    })
}
// 采集
export function itemResourceDriverValuecollect(params) {
    return request({
        url: '/item/itemResourceDriverValue/collect',
        method: 'get',
        params,
        btnCode: 'resourceDriverVal:collect'
    })
}

// 导出
export function itemResourceDriverValueexportExcel(data) {
    return request({
        url: '/item/itemResourceDriverValue/exportExcel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'resourceDriverVal:export'
    })
}



// ---------------- 资源动因值  --子表 -----------------------
// 分页
export function itemActivityDriverConfigDetailqueryListByConfigId(data) {
    return request({
        url: '/item/itemResourceDriverValueDetail/queryListPageByValueId',
        method: 'post',
        data,
        btnCode: 'resourceDriverVal:list'
    })
}
// 明细分页
export function itemResourceDriverValuequeryrtDetailListPage(data) {
    return request({
        url: '/item/itemResourceDriverValue/queryrtDetailListPage',
        method: 'post',
        data,
        btnCode: 'resourceDriverVal:list'
    })
}

// 新增
export function itemResourceDriverValueDetailadd(data) {
    return request({
        url: '/item/itemResourceDriverValueDetail',
        method: 'post',
        data,
        btnCode: 'resourceDriverVal:add'
    })
}

// 编辑
export function itemResourceDriverValueDetailupdate(data) {
    return request({
        url: '/item/itemResourceDriverValueDetail/byPost',
        method: 'post',
        data,
        btnCode: 'resourceDriverVal:update'
    })
}

// 删除
export function itemResourceDriverValueDetaildelete(data) {
    return request({
        url: '/item/itemResourceDriverValueDetail/byDelete',
        method: 'post',
        data,
        btnCode: 'resourceDriverVal:delete'
    })
}

// 导出  子表
export function itemResourceDriverValueDetailexportExcel(params) {
    return request({
        url: '/item/itemResourceDriverValueDetail/exportExcel',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'resourceDriverVal:export'
    })
}





