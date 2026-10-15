import request from '@/utils/request'

// ---------------- 成本数据 -----------------------
// 分页
export function itemCostqueryListByPage(data) {
    return request({
        url: '/item/itemCost/queryListByPage',
        method: 'post',
        data,
        btnCode: 'costProData:list'
    })
}

// 新增
export function itemCostsave(data) {
    return request({
        url: '/item/itemCost/save',
        method: 'post',
        data,
        btnCode: 'costProData:add'
    })
}

// 编辑
export function itemCostbyPost(data) {
    return request({
        url: '/item/itemCost/byPost',
        method: 'post',
        data,
        btnCode: 'costProData:update'
    })
}
// 删除
export function itemCostdelByIds(data) {
    return request({
        url: '/item/itemCost/delByIds',
        method: 'post',
        data,
        btnCode: 'costProData:delete'
    })
}


// 详情
export function itemCostqueryVoById(params) {
    return request({
        url: 'item/itemCost/queryVoById',
        method: 'get',
        params,
        btnCode: 'costProData:list'
    })
}

// 确认
export function itemCostsure(data) {
    return request({
        url: '/item/itemCost/sure',
        method: 'post',
        data,
        btnCode: 'costProData:confirm'
    })
}
// 取消确认
export function itemCostunSure(data) {
    return request({
        url: '/item/itemCost/unSure',
        method: 'post',
        data,
        btnCode: 'costProData:confirm'
    })
}



// 采集
export function itemCostcollect(params) {
    return request({
        url: '/item/itemCost/collect',
        method: 'get',
        params,
        btnCode: 'costProData:collect'
    })
}

// 金额计算
export function itemCostcalculateTotalMoney(params) {
    return request({
        url: '/item/itemCost/queryTotalMoneyById',
        method: 'get',
        params
    })
}

// 导出
export function itemCostexportExcel(data) {
    return request({
        url: '/item/itemCost/exportExcel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'costProData:export'
    })
}



// ---------------- 成本数据  --子表 -----------------------
// 分页
export function itemCostDetailqueryDetailPageByItemCostId(data) {
    return request({
        url: '/item/itemCostDetail/queryDetailPageByItemCostId',
        method: 'post',
        data,
        btnCode: 'costProData:list'
    })
}


// 新增
export function itemCostDetailadd(data) {
    return request({
        url: '/item/itemCostDetail',
        method: 'post',
        data,
        btnCode: 'costProData:add'
    })
}

// 编辑
export function itemCostDetailupdate(data) {
    return request({
        url: '/item/itemCostDetail/byPost',
        method: 'post',
        data,
        btnCode: 'costProData:update'
    })
}

// 删除
export function itemCostDetaildelete(data) {
    return request({
        url: '/item/itemCostDetail/byDelete',
        method: 'post',
        data,
        btnCode: 'costProData:delete'
    })
}

// 导出   明细页
export function itemCostDetailexportDetailExcel(data) {
    return request({
        url: '/item/itemCostDetail/exportDetailExcel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'costProData:export'
    })
}

// 导出  子表
export function itemCostDetailexportExcel(data) {
    return request({
        url: '/item/itemCostDetail/exportExcel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'costProData:export'
    })
}





