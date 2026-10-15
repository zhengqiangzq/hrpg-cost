import request from '@/utils/request'

// ---------------- 作业动因值 -----------------------
// 分页
export function itemActivityDriverValuequeryListByPage(data) {
    return request({
        url: '/item/itemActivityDriverValue/queryListByPage',
        method: 'post',
        data,
        btnCode: 'activityDriverVal:list'
    })
}

// 新增
export function itemActivityDriverValueadd(data) {
    return request({
        url: '/item/itemActivityDriverValue/save',
        method: 'post',
        data,
        btnCode: 'activityDriverVal:add'
    })
}

// 编辑
export function itemActivityDriverValueupdateById(data) {
    return request({
        url: '/item/itemActivityDriverValue/updateById',
        method: 'post',
        data,
        btnCode: 'activityDriverVal:update'
    })
}
// 删除
export function itemActivityDriverValuedelByIds(data) {
    return request({
        url: '/item/itemActivityDriverValue/delByIds',
        method: 'post',
        data,
        btnCode: 'activityDriverVal:delete'
    })
}


// 详情
export function itemActivityDriverValuegetById(params) {
    return request({
        url: '/item/itemActivityDriverValue/getById',
        method: 'get',
        params,
        btnCode: 'activityDriverVal:list'
    })
}

// 确认
export function itemActivityDriverValuesureByIds(data) {
    return request({
        url: '/item/itemActivityDriverValue/sureByIds',
        method: 'post',
        data,
        btnCode: 'activityDriverVal:confirm'
    })
}
// 取消确认
export function itemActivityDriverValueunSureByIds(data) {
    return request({
        url: '/item/itemActivityDriverValue/unSureByIds',
        method: 'post',
        data,
        btnCode: 'activityDriverVal:confirm'
    })
}
// 复制
export function itemActivityDriverValuecopyByCheckPeriodId(params) {
    return request({
        url: '/item/itemActivityDriverValue/copyByCheckPeriodId',
        method: 'get',
        params,
        btnCode: 'activityDriverVal:copy'
    })
}
// 采集
export function itemActivityDriverValuecollect(params) {
    return request({
        url: '/item/itemActivityDriverValue/collect',
        method: 'get',
        params,
        btnCode: 'activityDriverVal:collect'
    })
}


// 导出
export function itemActivityDriverValueexportExcel(data) {
    return request({
        url: '/item/itemActivityDriverValue/exportExcel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'activityDriverVal:export'
    })
}



// ---------------- 作业动因值  --子表 -----------------------
// 分页
export function itemActivityDriverValueDetailqueryListPageByValueId(data) {
    return request({
        url: '/item/itemActivityDriverValueDetail/queryListPageByValueId',
        method: 'post',
        data,
        btnCode: 'activityDriverVal:list'
    })
}
// 明细分页
export function itemActivityDriverValuequeryrtDetailListPage(data) {
    return request({
        url: '/item/itemActivityDriverValue/queryrtDetailListPage',
        method: 'post',
        data,
        btnCode: 'activityDriverVal:list'
    })
}

// 新增
export function itemActivityDriverValueDetailadd(data) {
    return request({
        url: '/item/itemActivityDriverValueDetail',
        method: 'post',
        data,
        btnCode: 'activityDriverVal:add'
    })
}

// 编辑
export function itemActivityDriverValueDetailbyPost(data) {
    return request({
        url: '/item/itemActivityDriverValueDetail/byPost',
        method: 'post',
        data,
        btnCode: 'activityDriverVal:update'
    })
}

// 删除
export function itemActivityDriverValueDetaildelete(data) {
    return request({
        url: '/item/itemActivityDriverValueDetail/byDelete',
        method: 'post',
        data,
        btnCode: 'activityDriverVal:delete'
    })
}

// 导出  子表
export function itemActivityDriverValueDetailDetailExcel(params) {
    return request({
        url: '/item/itemActivityDriverValueDetail/exportExcel',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'activityDriverVal:export'
    })
}





