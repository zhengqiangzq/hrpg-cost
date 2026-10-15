import request from '@/utils/request'



const prePath = '/deptBigUserCost'
// -----------------  大用户  -------------------
// 分页查询
export function deptBigUserCostpage(data) {
    return request({
        url: prePath + '/page',
        method: 'post',
        data,
        btnCode: 'largeUsers:list'
    })
}

// 查询详情
export function deptBigUserCostdetail(params) {
    return request({
        url: prePath + '/detail',
        method: 'get',
        params,
        btnCode: 'largeUsers:list'
    })
}

// 主表新增
export function deptBigUserCostadd(data) {
    return request({
        url: prePath + '/add',
        method: 'post',
        data,
        btnCode: 'largeUsers:add'
    })
}
// 主表编辑
export function deptBigUserCostupdate(data) {
    return request({
        url: prePath + '/update',
        method: 'post',
        data,
        btnCode: 'largeUsers:update'
    })
}

// 确认单据
export function deptBigUserCostok(data) {
    return request({
        url: prePath + '/ok',
        method: 'post',
        data,
        btnCode: 'largeUsers:confirm'
    })
}

// 取消确认单据
export function deptBigUserCostcancel(data) {
    return request({
        url: prePath + '/cancel',
        method: 'post',
        data,
        btnCode: 'largeUsers:unconfirm'
    })
}


// 删除
export function deptBigUserCostdelete(data) {
    return request({
        url: prePath + '/delete',
        method: 'post',
        data,
        btnCode: 'largeUsers:delete'
    })
}

// 导出参数数据
export function deptBigUserCostexportExcel(params) {
    return request({
        url: prePath + '/exportExcel',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'largeUsers:export'
    })
}


// -----------------  明细  -------------------

const prePath2 = '/deptBigUserCostDetail'
// 分页查询
export function deptBigUserCostDetailpage(data) {
    return request({
        url: prePath2 + '/page',
        method: 'post',
        data,
        btnCode: 'largeUsers:list'
    })
}

// 子表新增
export function deptBigUserCostDetailadd(data) {
    return request({
        url: prePath2 + '/add',
        method: 'post',
        data,
        btnCode: 'largeUsers:add'
    })
}

// 子表修改
export function deptBigUserCostDetailupdate(data) {
    return request({
        url: prePath2 + '/update',
        method: 'post',
        data,
        btnCode: 'largeUsers:update'
    })
}

// 子表删除
export function deptBigUserCostDetaildelete(data) {
    return request({
        url: prePath2 + '/delete',
        method: 'post',
        data,
        btnCode: 'largeUsers:delete'
    })
}

// 导出 明细数据
export function deptBigUserCostDetailexportExcel(params) {
    return request({
        url: prePath2 + '/exportExcel',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'largeUsers:detailexport'
    })
}
// 导出参数数据
export function deptBigUserCostDetailexportExcelDetail(data) {
    return request({
        url: prePath2 + '/exportExcelDetail',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'largeUsers:detailexport'
    })
}

