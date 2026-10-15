import request from '@/utils/request'



const prePath = '/deptDrugCost'
// -----------------  药品数据  -------------------
// 分页查询
export function deptDrugCostpage(data) {
    return request({
        url: prePath + '/page',
        method: 'post',
        data,
        btnCode: 'drugData:list'
    })
}

// 查询详情
export function deptDrugCostdetail(params) {
    return request({
        url: prePath + '/detail',
        method: 'get',
        params,
        btnCode: 'drugData:list'
    })
}

// 主表新增
export function deptDrugCostadd(data) {
    return request({
        url: prePath + '/add',
        method: 'post',
        data,
        btnCode: 'drugData:add'
    })
}
// 主表编辑
export function deptDrugCostupdate(data) {
    return request({
        url: prePath + '/update',
        method: 'post',
        data,
        btnCode: 'drugData:update'
    })
}

// 确认单据
export function deptDrugCostok(data) {
    return request({
        url: prePath + '/ok',
        method: 'post',
        data,
        btnCode: 'drugData:confirm'
    })
}

// 取消确认单据
export function deptDrugCostcancel(data) {
    return request({
        url: prePath + '/cancel',
        method: 'post',
        data,
        btnCode: 'drugData:unconfirm'
    })
}

// 采集单据
export function deptDrugCostcollection(params) {
    return request({
        url: prePath + '/collection',
        method: 'get',
        params,
        btnCode: 'drugData:collect'
    })
}

// 检查
export function deptDrugCostcheck(data) {
    return request({
        url: prePath + '/check',
        method: 'post',
        data,
        btnCode: 'drugData:check'
    })
}

// 删除
export function deptDrugCostdelete(data) {
    return request({
        url: prePath + '/delete',
        method: 'post',
        data,
        btnCode: 'drugData:delete'
    })
}

// 导出参数数据
export function deptDrugCostexportExcel(params) {
    return request({
        url: prePath + '/exportExcel',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'drugData:export'
    })
}


// -----------------  明细  -------------------

const prePath2 = '/deptDrugCostDetail'
// 分页查询
export function deptDrugCostDetailpage(data) {
    return request({
        url: prePath2 + '/page',
        method: 'post',
        data,
        btnCode: 'drugData:list'
    })
}

// 子表新增
export function deptDrugCostDetailadd(data) {
    return request({
        url: prePath2 + '/add',
        method: 'post',
        data,
        btnCode: 'drugData:add'
    })
}

// 子表修改
export function deptDrugCostDetailupdate(data) {
    return request({
        url: prePath2 + '/update',
        method: 'post',
        data,
        btnCode: 'drugData:update'
    })
}

// 子表删除
export function deptDrugCostDetaildelete(data) {
    return request({
        url: prePath2 + '/delete',
        method: 'post',
        data,
        btnCode: 'drugData:delete'
    })
}

// 导出 明细数据
export function deptDrugCostDetailexportExcel(params) {
    return request({
        url: prePath2 + '/exportExcel',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'drugData:detailexport'
    })
}
// 导出参数数据
export function deptDrugCostDetailexportExcelDetail(data) {
    return request({
        url: prePath2 + '/exportExcelDetail',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'drugData:detailexport'
    })
}

