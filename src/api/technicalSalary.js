import request from '@/utils/request'



// -----------------  人员薪资明细  -------------------
// 分页查询
export function itemTechTitlesSalarygetListByPage(data) {
    return request({
        url: '/item/itemTechTitlesSalary/getListByPage',
        method: 'post',
        data,
        btnCode: 'technicalSalary:list'
    })
}

// 计算
export function itemTechTitlesSalarycompute(data) {
    return request({
        url: '/item/itemTechTitlesSalary/compute',
        method: 'post',
        data,
        btnCode: 'technicalSalary:count'
    })
}

// 明细
export function itemTechTitlesSalaryDetailqueryDetailListByMainId(params) {
    return request({
        url: '/item/itemTechTitlesSalaryDetail/queryDetailListByMainId',
        method: 'get',
        params,
        btnCode: 'technicalSalary:list'
    })
}


// 导出参数数据
export function itemTechTitlesSalaryexportExcel(data) {
    return request({
        url: '/item/itemTechTitlesSalary/exportExcel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'technicalSalary:export'
    })
}











