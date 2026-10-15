import request from '@/utils/request'



const prePath = '/deptAttendanceRecord'
// -----------------  考勤数据  -------------------
// 分页查询
export function deptAttendanceRecordpage(data) {
    return request({
        url: prePath + '/page',
        method: 'post',
        data,
        btnCode: 'workAttendance:list'
    })
}


// 主表新增
export function deptAttendanceRecordadd(data) {
    return request({
        url: prePath + '/add',
        method: 'post',
        data,
        btnCode: 'workAttendance:add'
    })
}
// 主表编辑
export function deptAttendanceRecordupdate(data) {
    return request({
        url: prePath + '/update',
        method: 'post',
        data,
        btnCode: 'workAttendance:update'
    })
}

// 确认单据
export function deptAttendanceRecordok(data) {
    return request({
        url: prePath + '/ok',
        method: 'post',
        data,
        btnCode: 'workAttendance:confirm'
    })
}

// 取消确认单据
export function deptAttendanceRecordcancel(data) {
    return request({
        url: prePath + '/cancel',
        method: 'post',
        data,
        btnCode: 'workAttendance:unconfirm'
    })
}

// 采集单据
export function deptAttendanceRecordcollection(params) {
    return request({
        url: prePath + '/collection',
        method: 'get',
        params,
        btnCode: 'workAttendance:collect'
    })
}


// 删除
export function deptAttendanceRecorddelete(data) {
    return request({
        url: prePath + '/delete',
        method: 'post',
        data,
        btnCode: 'workAttendance:delete'
    })
}

// 导出参数数据
export function deptAttendanceRecordexportExcel(data) {
    return request({
        url: prePath + '/exportExcel',
        method: 'post',
        data,
        btnCode: 'workAttendance:export',
        responseType: 'blob'
    })
}
