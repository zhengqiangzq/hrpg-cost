import request from '@/utils/request'

// 分页查询归集方法定义
export function pageCollectionMethodDefinition(params) {
    return request(({
        url: '/drg/methodService/apportionWay/page',
        method: 'get',
        params,
        btnCode: 'DRGCostCollectionMethodDefinition:list'
    }))
}

// 查询归集方法定义
export function oneCollectionMethodDefinition(params) {
    return request({
        url: '/drg/methodService/apportionWay',
        method: 'get',
        params,
        btnCode: 'DRGCostCollectionMethodDefinition:list'
    })
}

// 新增归集方法定义
export function addCollectionMethodDefinition(data) {
    return request(({
        url: '/drg/methodService/apportionWay',
        method: 'post',
        data,
        btnCode: 'DRGCostCollectionMethodDefinition:add'
    }))
}

// 修改归集方法定义
export function updateCollectionMethodDefinition(data) {
    return request(({
        url: '/drg/methodService/apportionWay/byPost',
        method: 'post',
        data,
        btnCode: 'DRGCostCollectionMethodDefinition:update'
    }))
}

// 删除归集方法定义
export function deleteCollectionMethodDefinition(data) {
    return request({
        url: '/drg/methodService/apportionWay/byDelete',
        method: 'post',
        data,
        btnCode: 'DRGCostCollectionMethodDefinition:delete'
    })
}

// 导出归集方法定义
export function exportCollectionMethodDefinition(data) {
    return request(({
        url: '/drg/methodService/apportionWay/excel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'DRGCostCollectionMethodDefinition:export'
    }))
}
