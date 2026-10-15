import request from '@/utils/request'


export function getDeptTree(params) {
    return request({
        url: '/base/coreDept/trees',
        method: 'get',
        params
    })
}


// 查询预算项目
export function pageBudgetProject(params) {
    return request({
        url: '/base/budgetInfo/page',
        method: 'get',
        params
    })
}
