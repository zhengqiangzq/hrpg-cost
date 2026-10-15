import request from '@/utils/request'



const prePath = '/deptStaffSalary'
// -----------------  薪酬数据  -------------------
// 分页查询
export function deptStaffSalaryqueryListByPage(data) {
    return request({
        url: prePath + '/queryListByPage',
        method: 'post',
        data,
        brnCode: 'salaryData:list',
    })
}

// 查询详情
export function deptStaffSalaryqueryById(params) {
    return request({
        url: prePath + '/queryById',
        method: 'get',
        params,
        brnCode: 'salaryData:list',
    })
}

// 主表新增
export function deptStaffSalarysave(data) {
    return request({
        url: prePath + '/save',
        method: 'post',
        data,
        brnCode: 'salaryData:add',
    })
}
// 主表编辑
export function deptStaffSalaryupdateById(data) {
    return request({
        url: prePath + '/updateById',
        method: 'post',
        data,
        brnCode: 'salaryData:update',
    })
}

// 确认单据
export function deptStaffSalarysureById(data) {
    return request({
        url: prePath + '/sureById',
        method: 'post',
        data,
        brnCode: 'salaryData:confirm',
    })
}

// 取消确认单据
export function deptStaffSalaryunSureById(data) {
    return request({
        url: prePath + '/unSureById',
        method: 'post',
        data,
        brnCode: 'salaryData:unconfirm',
    })
}

// 采集单据
export function deptStaffSalarycollection(params) {
    return request({
        url: prePath + '/collection',
        method: 'get',
        params,
        brnCode: 'salaryData:collect',
    })
}

// 检查
export function deptStaffSalarycheck(data) {
    return request({
        url: prePath + '/check',
        method: 'post',
        data,
        brnCode: 'salaryData:check',
    })
}

// 删除
export function deptStaffSalarydelete(data) {
    return request({
        url: prePath + '/delete',
        method: 'post',
        data,
        brnCode: 'salaryData:delete',
    })
}

// 导出参数数据
export function deptStaffSalaryexportExcel(data) {
    return request({
        url: prePath + '/exportExcel',
        method: 'post',
        data,
        responseType: 'blob',
        brnCode: 'salaryData:export',
    })
}


// -----------------  人员薪资明细  子表  -------------------

const prePath2 = '/deptStaffSalaryDetail'
// 分页查询
export function deptStaffSalaryDetailqueryList(data) {
    return request({
        url: prePath2 + '/queryList',
        method: 'post',
        data,
        brnCode: 'salaryData:list',
    })
}

// 子表新增
export function deptStaffSalaryDetailinsert(data) {
    return request({
        url: prePath2 + '/insert',
        method: 'post',
        data,
        brnCode: 'salaryData:add',
    })
}

// 子表修改
export function deptStaffSalaryDetailupdate(data) {
    return request({
        url: prePath2 + '/update',
        method: 'post',
        data,
        brnCode: 'salaryData:update',
    })
}

// 子表删除
export function deptStaffSalaryDetaildelByIds(data) {
    return request({
        url: prePath2 + '/delByIds',
        method: 'post',
        data,
        brnCode: 'salaryData:delete',
    })
}

// 导出 明细数据
export function deptStaffSalaryDetailexportExcel(data) {
    return request({
        url: prePath2 + '/exportExcel',
        method: 'post',
        data,
        responseType: 'blob',
        brnCode: 'salaryData:export',
    })
}

