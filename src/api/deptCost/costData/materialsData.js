import request from '@/utils/request'



const prePath = '/deptProductCost'
// -----------------  物资数据  -------------------
// 分页查询
export function deptProductCostpage(data) {
    return request({
        url: prePath + '/page',
        method: 'post',
        data,
        btnCode: 'materialsData:list'
    })
}

// 查询详情
export function deptProductCostdetail(params) {
    return request({
        url: prePath + '/detail',
        method: 'get',
        params,
        btnCode: 'materialsData:list'
    })
}

// 主表新增
export function deptProductCostadd(data) {
    return request({
        url: prePath + '/add',
        method: 'post',
        data,
        btnCode: 'materialsData:add'
    })
}
// 主表编辑
export function deptProductCostupdate(data) {
    return request({
        url: prePath + '/update',
        method: 'post',
        data,
        btnCode: 'materialsData:update'
    })
}

// 确认单据
export function deptProductCostok(data) {
    return request({
        url: prePath + '/ok',
        method: 'post',
        data,
        btnCode: 'materialsData:confirm'
    })
}

// 取消确认单据
export function deptProductCostcancel(data) {
    return request({
        url: prePath + '/cancel',
        method: 'post',
        data,
        btnCode: 'materialsData:unconfirm'
    })
}

// 采集单据
export function deptProductCostcollection(params) {
    return request({
        url: prePath + '/collection',
        method: 'get',
        params,
        btnCode: 'materialsData:collect'
    })
}

// 检查
export function deptProductCostcheck(data) {
    return request({
        url: prePath + '/check',
        method: 'post',
        data,
        btnCode: 'materialsData:check'
    })
}

// 删除
export function deptProductCostdelete(data) {
    return request({
        url: prePath + '/delete',
        method: 'post',
        data,
        btnCode: 'materialsData:delete'
    })
}

// 导出参数数据
export function deptProductCostexportExcel(params) {
    return request({
        url: prePath + '/exportExcel',
        method: 'get',
        params,
        btnCode: 'materialsData:export',
        responseType: 'blob'
    })
}


// -----------------  明细  -------------------

const prePath2 = '/deptProductCostDetail'
// 分页查询
export function deptProductCostDetailpage(data) {
    return request({
        url: prePath2 + '/page',
        method: 'post',
        data,
        btnCode: 'materialsData:list'
    })
}

// 子表新增
export function deptProductCostDetailadd(data) {
    return request({
        url: prePath2 + '/add',
        method: 'post',
        data,
        btnCode: 'materialsData:add'
    })
}

// 子表修改
export function deptProductCostDetailupdate(data) {
    return request({
        url: prePath2 + '/update',
        method: 'post',
        data,
        btnCode: 'materialsData:update'
    })
}

// 子表删除
export function deptProductCostDetaildelete(data) {
    return request({
        url: prePath2 + '/delete',
        method: 'post',
        data,
        btnCode: 'materialsData:delete'
    })
}

// 导出 明细数据
export function deptProductCostDetailexportExcel(params) {
    return request({
        url: prePath2 + '/exportExcel',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'materialsData:export'
    })
}
// 导出参数数据
export function deptProductCostDetailexportExcelDetail(data) {
    return request({
        url: prePath2 + '/exportExcelDetail',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'materialsData:export'
    })
}

