import { getFlowCategoryTree } from '@/api/task.js'

export const fieldList = [
  { label: '流程标题', value: 'title', type: 'slot' },
  { label: '流程描述', value: 'subTitle' },
  { label: '流程分类', value: 'categoryName' },
  { label: '当前节点', value: 'nodeName' },
  { label: '流程发起时间', value: 'createTime' },
  { label: '状态', value: 'auditStatusValue', width: '80' },
  { label: '发起人', value: 'submitUserName', width: '80' },
  { label: '发起人部门', value: 'submitUserDeptName' },
]
// 获取流程模块树
export async function _getFlowCategoryTree(target) {
  if (!target) {
    return
  }
  // 停用模块isEnable-0-停用  isEnable-1-启用
  let enableArr = []
  target.forEach((element) => {
    if (element.isEnable) {
      enableArr.push(element.code)
    }
  })
  // 获取未停用数据
  function getNotEnable(data) {
    let map = {}
    enableArr.forEach((element) => {
      map[element] = data[element]
    })
    return map
  }
  // 设置父级节点数量
  function setTaskCount(data) {
    let taskCount = 0
    if (!data || data.length === 0) {
      return taskCount
    }
    data.forEach((item) => {
      taskCount += item.taskCount || 0
    })
    return taskCount
  }
  return await getFlowCategoryTree().then((res) => {
    let dataArr = []
    let notEnableData = getNotEnable(res.data)
    for (let k in notEnableData) {
      let ids = ''
      if (notEnableData[k] && notEnableData[k].length > 0) {
        ids = notEnableData[k]?.map((item) => item.id).join(',')
      }
      dataArr.push({
        categoryName: k,
        name: formatModule(k, target),
        children: notEnableData[k],
        id: ids,
        taskCount: setTaskCount(notEnableData[k]),
      })
    }
    let result = [
      {
        categoryName: 'all',
        name: '全部类别',
        children: dataArr,
        taskCount: setTaskCount(dataArr),
      },
    ]
    return result
  })
}

export function formatModule(key, data) {
  let labelName = ''
  data.forEach((item) => {
    if (item.code === key) {
      labelName = item.name
    }
  })
  return labelName
}

export function getStatusList(data) {
  let result = [
    {
      value: null,
      key: '全部',
    },
  ]
  data.forEach((element) => {
    element['key'] = element.name
    element['value'] = element.code
  })
  return [...result, ...data]
}
