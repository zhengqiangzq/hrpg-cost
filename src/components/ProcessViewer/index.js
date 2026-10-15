/**
 * 工作流常量字典
 */
class DictionaryBase extends Map {
  constructor(name, dataList, keyId = 'id', symbolId = 'symbol') {
    super()
    this.showName = name
    this.setList(dataList, keyId, symbolId)
  }

  setList(dataList, keyId = 'id', symbolId = 'symbol') {
    this.clear()
    if (Array.isArray(dataList)) {
      dataList.forEach((item) => {
        this.set(item[keyId], item)
        if (item[symbolId] != null) {
          Object.defineProperty(this, item[symbolId], {
            get: function () {
              return item[keyId]
            },
          })
        }
      })
    }
  }
  getList(valueId = 'name', parentIdKey = 'parentId', filter) {
    let temp = []
    this.forEach((value, key) => {
      let obj = {
        id: key,
        name: typeof value === 'string' ? value : value[valueId],
        parentId: value[parentIdKey],
      }
      if (typeof filter !== 'function' || filter(obj)) {
        temp.push(obj)
      }
    })

    return temp
  }
  getValue(id, valueId = 'name') {
    // 如果id为boolean类型，则自动转换为0和1
    if (typeof id === 'boolean') {
      id = id ? 1 : 0
    }
    return (this.get(id) || {})[valueId]
  }
}

const SysFlowTaskOperationType = new DictionaryBase('任务操作类型', [
  {
    id: 'save',
    name: '保存',
    symbol: 'SAVE',
  },
  {
    id: 'submit',
    name: '提交',
    symbol: 'SUBMIT',
  },
  {
    id: 'agree',
    name: '同意',
    symbol: 'AGREE',
  },
  {
    id: 'refuse',
    name: '拒绝',
    symbol: 'REFUSE',
  },
  {
    id: 'reject',
    name: '驳回',
    symbol: 'REJECT',
  },
  {
    id: 'rejectToStart',
    name: '驳回到起点',
    symbol: 'REJECT_TO_START',
  },
  {
    id: 'revoke',
    name: '撤销',
    symbol: 'REVOKE',
  },
  {
    id: 'transfer',
    name: '转办',
    symbol: 'TRANSFER',
  },
  {
    id: 'multi_consign',
    name: '加签',
    symbol: 'CO_SIGN',
  },
  {
    id: 'stop',
    name: '终止',
    symbol: 'STOP',
  },
  {
    id: 'multi_sign',
    name: '会签',
    symbol: 'MULTI_SIGN',
  },
  {
    id: 'multi_agree',
    name: '同意（会签）',
    symbol: 'MULTI_AGREE',
  },
  {
    id: 'multi_refuse',
    name: '拒绝（会签）',
    symbol: 'MULTI_REFUSE',
  },
  {
    id: 'multi_abstain',
    name: '弃权（会签）',
    symbol: 'MULTI_ABSTAIN',
  },
  {
    id: 'set_assignee',
    name: '指定审批人',
    symbol: 'SET_ASSIGNEE',
  },
])

export default {
  SysFlowTaskOperationType,
}
