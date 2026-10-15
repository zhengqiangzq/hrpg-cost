import request from '@/utils/request'



const prePath = '/deptOtherCost'
// -----------------  其他成本  -------------------
// 分页查询
export function deptOtherCostpage(data) {
    return request({
        url: prePath + '/page',
        method: 'post',
        data,
        btnCode: 'busOtherCost:list'
    })
}

// 查询详情
export function deptOtherCostdetail(params) {
    return request({
        url: prePath + '/detail',
        method: 'get',
        params,
        btnCode: 'busOtherCost:list'
    })
}

// 主表新增
export function deptOtherCostadd(data) {
    return request({
        url: prePath + '/add',
        method: 'post',
        data,
        btnCode: 'busOtherCost:add'
    })
}
// 主表编辑
export function deptOtherCostupdate(data) {
    return request({
        url: prePath + '/update',
        method: 'post',
        data,
        btnCode: 'busOtherCost:update'
    })
}

// 确认单据
export function deptOtherCostok(data) {
    return request({
        url: prePath + '/ok',
        method: 'post',
        data,
        btnCode: 'busOtherCost:list'
    })
}

// 取消确认单据
export function deptOtherCostcancel(data) {
    return request({
        url: prePath + '/cancel',
        method: 'post',
        data,
        btnCode: 'busOtherCost:unconfirm'
    })
}

// 采集单据
export function deptOtherCostcollection(params) {
    return request({
        url: prePath + '/collection',
        method: 'get',
        params,
        btnCode: 'busOtherCost:collect'
    })
}


// 删除
export function deptOtherCostdelete(data) {
    return request({
        url: prePath + '/delete',
        method: 'post',
        data,
        btnCode: 'busOtherCost:delete'
    })
}

// 导出参数数据
export function deptOtherCostexportExcel(params) {
    return request({
        url: prePath + '/exportExcel',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'busOtherCost:export'
    })
}


// -----------------  明细  -------------------

const prePath2 = '/deptOtherCostDetail'
// 分页查询
export function deptOtherCostDetailpage(data) {
    return request({
        url: prePath2 + '/page',
        method: 'post',
        data,
        btnCode: 'busOtherCost:list'
    })
}

// 子表新增
export function deptOtherCostDetailadd(data) {
    return request({
        url: prePath2 + '/add',
        method: 'post',
        data,
        btnCode: 'busOtherCost:add'
    })
}

// 子表修改
export function deptOtherCostDetailupdate(data) {
    return request({
        url: prePath2 + '/update',
        method: 'post',
        data,
        btnCode: 'busOtherCost:update'
    })
}

// 子表删除
export function deptOtherCostDetaildelete(data) {
    return request({
        url: prePath2 + '/delete',
        method: 'post',
        data,
        btnCode: 'busOtherCost:delete'
    })
}

// 导出 明细数据
export function deptOtherCostDetailexportExcel(params) {
    return request({
        url: prePath2 + '/exportExcel',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'busOtherCost:detailexport'
    })
}
// 导出参数数据
export function deptOtherCostDetailexportExcelDetail(data) {
    return request({
        url: prePath2 + '/exportExcelDetail',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'busOtherCost:detailexport'
    })
}

