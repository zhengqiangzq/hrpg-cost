import request from '@/utils/request'



//    ---------------薪资项目 ---------
// 列表
export function salaryItemtree(params) {
    return request({
        url: '/salaryItem/tree',
        method: 'get',
        params,
        btnCode: 'salaryItems:list'
    })
}
// 修改
export function salaryItemupdateJoinAccounting(data) {
    return request({
        url: '/salaryItem/updateJoinAccounting',
        method: 'post',
        data,
        btnCode: 'salaryItems:update'
    })
}
// 详情
export function salaryItemdetail(id) {
    return request({
        url: '/salaryItem/detail/'+ id,
        method: 'get',
        btnCode: 'salaryItems:list'
    })
}

//    ---------------技术职称 ---------

// 列表
export function technicalTitletree(params) {
    return request({
        url: '/technicalTitle/tree',
        method: 'get',
        params,
        btnCode: 'technicalTitle:list'
    })
}

// 详情
export function technicalTitledetail(id) {
    return request({
        url: '/technicalTitle/detail/'+ id,
        method: 'get',
        btnCode: 'technicalTitle:list'
    })
}



//    ---------------物资分类 ---------

// 列表
export function productFinCategorytree(params) {
    return request({
        url: '/productFinCategory/tree',
        method: 'get',
        params,
        btnCode: 'materialClassification:list'
    })
}

// 详情
export function productFinCategorydetail(id) {
    return request({
        url: '/productFinCategory/detail/'+ id,
        method: 'get',
        btnCode: 'materialClassification:list'
    })
}



//    ---------------物资目录 ---------

// 列表
export function productpage(data) {
    return request({
        url: '/product/page',
        method: 'post',
        data,
        btnCode: 'materialCatalogue:list'
    })
}


//    ---------------药品分类 ---------

// 列表
export function drugFinCategorytree(params) {
    return request({
        url: '/drugFinCategory/tree',
        method: 'get',
        params,
        btnCode: 'basicdrugClassification:list'
    })
}

// 详情
export function drugFinCategorydetail(id) {
    return request({
        url: '/drugFinCategory/detail/'+ id,
        method: 'get',
        btnCode: 'basicdrugClassification:list'
    })
}



//    ---------------药品目录 ---------

// 列表
export function drugItempage(data) {
    return request({
        url: '/drugItem/page',
        method: 'post',
        data,
        btnCode: 'basicdrugCatalogue:list'
    })
}

//    ---------------资产财务分类 ---------

// 列表
export function assetsFinCategorytree(params) {
    return request({
        url: '/assetsFinCategory/tree',
        method: 'get',
        params,
        btnCode: 'assetClassification:list'
    })
}

// 详情
export function assetsFinCategorydetail(id) {
    return request({
        url: '/assetsFinCategory/detail/'+ id,
        method: 'get',
        btnCode: 'assetClassification:list'
    })
}



//    ---------------资产卡片 ---------

// 列表
export function assetsItempage(data) {
    return request({
        url: '/assetsItem/page',
        method: 'post',
        data,
        btnCode: 'assetCatalogue:list'
    })
}

// 采集
export function assetsItemcollection(params) {
    return request({
        url: '/assetsItem/collection',
        method: 'get',
        params,
        btnCode: 'assetCatalogue:list'
    })
}

export function assetsItemExcel(data) {
    return request({
        url: '/assetsItem/export',
        method: 'post',
        data,
        btnCode: 'assetCatalogue:export',
        responseType: 'blob'
    })
}
