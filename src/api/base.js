import request from '@/utils/request'

const prePath = '/base'

const basicHost = import.meta.env.VITE_APP_BASIC_API

//获取所有字典map
export function getDictMap() {
  return request({
    url: basicHost + '/dict/map',
    method: 'get',
  })
}

//获取带资源的菜单树
export function getMenusTreeWithResources(data) {
  return request({
    url: basicHost + '/resourceInfo/list',
    method: 'post',
    data,
  })
}

//获取用户按钮权限集合
export function getPermissionCodes(params) {
  return request({
    url: basicHost + '/resourceInfo/codes',
    method: 'get',
    params,
  })
}

/* 人员部门查询 */
export function getRrgUserList(data) {
  return request({
    url: '/user/selectPageByCondition',
    method: 'post',
    data,
  })
}
export function getDeptTree(params) {
  return request({
    url: '/base/coreDept/trees',
    method: 'get',
    params
  })
}

//获取菜单详情
export function showSourceDetail(id) {
  return request({
    url: prePath + '/orders/sequence/queryPath/' + id,
    method: 'get',
  })
}
// 公共附件删除
export function fileRemoveList(data) {
  return request({
    url: '/file/removeList',
    method: 'post',
    data,
  })
}
// 查询全部会计期间年份
export function periodAll(params) {
  return request({
    url: prePath + '/accountingPeriod/all',
    method: 'get',
    params
  })
}

// 分页查询会计期间
export function pagePeriodMonth(params) {
  return request({
    url: prePath + '/accountingPeriodMonth/page',
    method: 'get',
    params
  })
}

// 分页查询会计期间
export function periodyearList(params) {
    return request({
        url: prePath + '/accountingPeriod/yearList',
        method: 'get',
        params
    })
}

// 匹配日期所在会计期间
export function periodMonthByDate(params) {
  return request({
    url: prePath + '/accountingPeriodMonth/queryByDate',
    method: 'post',
    params
  })
}
// 匹配日期所在会计期间
export function periodmonthList(params) {
  return request({
    url: prePath + '/accountingPeriodMonth/monthList',
    method: 'get',
    params
  })
}

// 分页查询收费类别
export function pageFeeCategory(params) {
  return request({
    url: basicHost + '/baseFeeCategory/queryPage',
    method: 'get',
    params
  })
}

// 分页查询收费项目
export function pageFeeItem(data) {
  return request({
    url: '/base/baseFeeItem/queryPage',
    method: 'post',
    data
  })
}

// 收入项目
export function payincomeProjecttree(params) {
  return request({
    url: basicHost + '/pay/incomeProject/tree',
    method: 'get',
    params
  })
}

// 人员
export function pageStaff(params) {
  return request({
    url: '/base/staff/page',
    method: 'get',
    params
  })
}

// 民族
export function allNation(params) {
  return request({
    url: '/base/nation/all',
    method: 'get',
    params
  })
}

//上传生成记录
export function excelImportRecordInitImportRecord(data, btnCode) {
    return request({
        url: basicHost + prePath + '/excelImportRecord/initImportRecord',
        method: 'post',
        data,
        btnCode,
    })
}
//轮询上传接口
export function excelImportRecordGetCacheInfo(data, btnCode) {
    return request({
        url: prePath + '/excelImportRecord/getCacheInfo',
        method: 'post',
        data,
        btnCode,
        notShowLoading: true,
    })
}
//关闭上传弹窗
export function excelImportRecordClose(data, btnCode) {
    return request({
        url: basicHost + prePath + '/excelImportRecord/close',
        method: 'post',
        data,
        btnCode,
    })
}
//中段上传弹窗
export function excelImportRecordInterrupt(data, btnCode) {
    return request({
        url: basicHost + prePath + '/excelImportRecord/interrupt',
        method: 'post',
        data,
        btnCode,
    })
}
//继续上传弹窗
export function excelImportRecordResume(data, btnCode, notShowLoading = false) {
    return request({
        url: basicHost + prePath + '/excelImportRecord/resume',
        method: 'post',
        data,
        btnCode,
        notShowLoading: notShowLoading,
    })
}
//上传日志
export function getExcelImportRecordPage(params, btnCode) {
    return request({
        url: basicHost + prePath + '/excelImportRecord/page',
        method: 'get',
        params,
        btnCode,
    })
}
//上传日志
export function delExcelImportRecord(data, btnCode) {
    return request({
        url: basicHost + prePath + '/excelImportRecord/byDelete',
        method: 'post',
        data,
        btnCode,
    })
}
//上传日志
export function excelImportRecordUpdateStatus(data, btnCode) {
    return request({
        url: basicHost + prePath + '/excelImportRecord/updateStatus',
        method: 'post',
        data,
        btnCode,
    })
}

// 组织树查询
export function getOrgTree(params) {
    return request({
        url: basicHost + prePath + '/org/tree',
        method: 'get',
        params,
    })
}

// 分配方案-详情
export function getAllocationById(id) {
    return request({
        url: basicHost + prePath + '/allocation/plan/' + id,
        method: 'get',
    })
}

// 分配方案-列表
export function getAllocationList(params) {
    return request({
        url: basicHost + prePath + '/allocation/plan/list',
        method: 'get',
        params,
    })
}


export function getAllocationOrg(params) {
    return request({
        url: prePath + '/allocationOrg/all',
        method: 'get',
        params,
    })
}
