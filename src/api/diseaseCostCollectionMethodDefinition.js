import request from '@/utils/request'

// 分页查询归集方法定义
export function pageCollectionMethodDefinition(params) {
    return request(({
        url: '/methodService/diseaseApportionWay/page',
        method: 'get',
        params,
        btnCode: 'collectionMethodDefinition:list'
    }))
}

// 查询归集方法定义
export function oneCollectionMethodDefinition(params) {
    return request({
        url: '/methodService/diseaseApportionWay',
        method: 'get',
        params,
        btnCode: 'collectionMethodDefinition:list'
    })
}

// 新增归集方法定义
export function addCollectionMethodDefinition(data) {
    return request(({
        url: '/methodService/diseaseApportionWay',
        method: 'post',
        data,
        btnCode: 'collectionMethodDefinition:add'
    }))
}

// 修改归集方法定义
export function updateCollectionMethodDefinition(data) {
    return request(({
        url: '/methodService/diseaseApportionWay/byPost',
        method: 'post',
        data,
        btnCode: 'collectionMethodDefinition:update'
    }))
}

// 删除归集方法定义
export function deleteCollectionMethodDefinition(data) {
    return request({
        url: '/methodService/diseaseApportionWay/byDelete',
        method: 'post',
        data,
        btnCode: 'collectionMethodDefinition:delete'
    })
}

// 导出归集方法定义
export function exportCollectionMethodDefinition(data) {
    return request(({
        url: '/methodService/diseaseApportionWay/excel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'collectionMethodDefinition:export'
    }))
}
