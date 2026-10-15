import request from '@/utils/request'

const PERMISSION_CODE = 'incomeSplitRule'

const URL = '/deptIncomeSplitRule'
// 分页查询成本拆分数据
export function deptIncomeSplitRulepage(params) {
    return request({
        url: URL + '/page',
        method: 'get',
        params,
        btnCode: `${PERMISSION_CODE}:list`
    })
}

// 分页查询成本拆分明细数据 --- 明细页面
export function deptIncomeSplitRuleDetailpage(data) {
    return request({
        url: URL + '/detail/page',
        method: 'post',
        data,
        btnCode: `${PERMISSION_CODE}:list`
    })
}



// 查询一条成本拆本信息
export function deptIncomeSplitRuledetail(id) {
    return request({
        url: URL + `/getOneById/${id}`,
        method: 'get',
        btnCode: `${PERMISSION_CODE}:list`
    })
}

// 新增成本拆分数据
export function deptIncomeSplitRuleadd(data) {
    return request({
        url: URL + '/save',
        method: 'post',
        data,
        btnCode: `${PERMISSION_CODE}:add`
    })
}

// 删除成本拆分
export function deptIncomeSplitRuledelete(data) {
    return request({
        url: URL + '/deleteByIds',
        method: 'post',
        data,
        btnCode: `${PERMISSION_CODE}:delete`
    })
}

// 导出成本拆分
export function deptIncomeSplitRuleexcel(data) {
    return request({
        url: URL + '/excel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: `${PERMISSION_CODE}:export`
    })
}

// 更新成本拆分数据
export function deptIncomeSplitRuleupdate(data) {
    return request({
        url: URL + '/update',
        method: 'post',
        data,
        btnCode: `${PERMISSION_CODE}:update`
    })
}

// 复制成本拆分数据
export function deptIncomeSplitRulecopy(data) {
    return request({
        url: URL + '/copy',
        method: 'post',
        data,
        btnCode: `${PERMISSION_CODE}:copy`
    })
}

// 导出成本拆分明细
export function deptIncomeSplitRuledetailexport(data) {
    return request({
        url: URL + '/excelDetail',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: `${PERMISSION_CODE}:export`
    })
}
