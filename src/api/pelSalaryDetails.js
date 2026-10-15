import request from '@/utils/request'



// -----------------  人员薪资明细  -------------------
// 分页查询
export function itemStaffSalaryqueryListByPage(data) {
    return request({
        url: '/item/itemStaffSalary/queryListByPage',
        method: 'post',
        data,
        btnCode: 'pelSalaryDetails:list'
    })
}

// 查询详情
export function itemStaffSalaryId(params) {
    return request({
        url: '/item/itemStaffSalary/queryById',
        method: 'get',
        params,
        btnCode: 'pelSalaryDetails:list'
    })
}

// 主表新增
export function itemStaffSalarysave(data) {
    return request({
        url: '/item/itemStaffSalary/save',
        method: 'post',
        data,
        btnCode: 'pelSalaryDetails:add'
    })
}
// 主表编辑
export function itemStaffSalaryupdate(data) {
    return request({
        url: '/item/itemStaffSalary/updateById',
        method: 'post',
        data,
        btnCode: 'pelSalaryDetails:update'
    })
}

// 确认单据
export function itemStaffSalarysureById(data) {
    return request({
        url: '/item/itemStaffSalary/sureById',
        method: 'post',
        data,
        btnCode: 'pelSalaryDetails:confirm'
    })
}

// 取消确认单据
export function itemStaffSalaryunSureById(data) {
    return request({
        url: '/item/itemStaffSalary/unSureById',
        method: 'post',
        data,
        btnCode: 'pelSalaryDetails:confirm'
    })
}

// 取消确认单据
export function itemStaffSalarycheck(data) {
    return request({
        url: '/item/itemStaffSalary/check',
        method: 'post',
        data,
        btnCode: 'pelSalaryDetails:check'
    })
}

// 采集单据
export function collectItemStaffSalaryunSure(params) {
    return request({
        url: '/item/itemStaffSalary/collection',
        method: 'get',
        params,
        btnCode: 'pelSalaryDetails:collect'
    })
}

// 删除
export function itemStaffSalarydelete(data) {
    return request({
        url: '/item/itemStaffSalary/delete',
        method: 'post',
        data,
        btnCode: 'pelSalaryDetails:delete'
    })
}

// 导出参数数据
export function itemStaffSalaryexportExcel(data) {
    return request({
        url: '/item/itemStaffSalary/exportExcel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'pelSalaryDetails:export'
    })
}


// -----------------  人员薪资明细  子表  -------------------

// 分页查询
export function itemStaffSalaryDetailqueryList(params) {
    return request({
        url: '/item/itemStaffSalaryDetail/queryList',
        method: 'get',
        params,
        btnCode: 'pelSalaryDetails:list'
    })
}

// 子表新增
export function itemStaffSalaryDetailadd(data) {
    return request({
        url: '/item/itemStaffSalaryDetail/insert',
        method: 'post',
        data,
        btnCode: 'pelSalaryDetails:add'
    })
}

// 子表修改
export function itemStaffSalaryDetailupdate(data) {
    return request({
        url: '/item/itemStaffSalaryDetail/update',
        method: 'post',
        data,
        btnCode: 'pelSalaryDetails:update'
    })
}

// 子表删除
export function itemStaffSalaryDetaildelete(data) {
    return request({
        url: '/item/itemStaffSalaryDetail/delByIds',
        method: 'post',
        data,
        btnCode: 'pelSalaryDetails:delete'
    })
}

// 导出 明细数据
export function itemStaffSalaryDetailexportExcel(data) {
    return request({
        url: '/item/itemStaffSalaryDetail/exportExcel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'pelSalaryDetails:export'
    })
}

