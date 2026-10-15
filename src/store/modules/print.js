import widgets from '@/components/Print/widgets/index.js'
const state = {
  zoom: 100, // 画布缩放百分比
  type: 'page', // 选中元素类型
  index: -1, // 选中元素索引
  uuid: -1, // 选中元素uuid

  originX: 0, // 选中元件的横向初始值
  originY: 0, // 选中元件的纵向初始值
  startX: 0, // 鼠标摁下时的横坐标
  startY: 0, // 鼠标摁下时的纵坐标
  moving: false, // 是否正在移动元件（参考线仅在移动元件时显示）


  // 模板信息
  page: {
    title: 'demo',
    width: 750,
    height: 550,
    pageWidth: 750,
    pageHeight: 550,
    horizontally: 1,
    tempItems: [], // 模板已选项
  },
  optionItems: [], // 可选项
  options: [], //可选项原始数据
  //模板参数
  tempId: '', // 模板Id
  loading: false, // 是否正在初始化中

  widgetSetting: widgets.getWidgetsSetting(), // 模板组件默认属性
}

const mutations = {
  // 初始化页面属性
  initPage(state, pageInfo) {
    state.page = pageInfo
    // 补全默认样式
    let tempItems = pageInfo.tempItems
      ? pageInfo.tempItems.map((item) => {
          let optionItem = {
            ...state.widgetSetting[item.type],
            ...item,
            style: {
              ...state.widgetSetting[item.type].style,
              ...(item.style || {}),
            },
          }
          return optionItem
        })
      : []

    state.page.tempItems = tempItems
  },
  // 初始化可选对象
  initOptionItems(state, options) {
    // 补全默认属性
    let optionsObject = options
      ? options.map((item) => {
          let optionItem = {
            ...state.widgetSetting[item.type],
            ...item,
            style: {
              ...state.widgetSetting[item.type].style,
              ...(item.style || {}),
            },
          }
          return optionItem
        })
      : []
    state.options = options
    state.optionItems = optionsObject
  },


  // 设置 mousemove 操作的初始值
  initmove(state, payload) {
    state.startX = payload.startX
    state.startY = payload.startY
    state.originX = payload.originX
    state.originY = payload.originY
    state.moving = true
  },

  // 选中元件与取消选中
  select(state, temp) {
    state.uuid = temp.uuid
    if (temp.uuid === -1) {
      state.type = 'page'
    } else {
      let widget = state.page.tempItems.find((w) => w.uuid === temp.uuid)
      if (widget) {
        state.activeElement = widget
        state.type = widget.type
      }
    }
  },

  // 元件移动结束
  stopmove(state) {
    state.moving = false
  },

  // 移动元件
  move(state, track) {
    var target = state.activeElement
    var dx = track.x - state.startX
    var dy = track.y - state.startY
    var left = state.originX + Math.floor((dx * 100) / state.zoom)
    var top = state.originY + Math.floor((dy * 100) / state.zoom)

    target.left = left > 0 ? left : 0
    target.top = top > 0 ? top : 0
  },

  // 调整元件尺寸
  resize(state, track) {
    var dx = track.x - state.startX
    var dy = track.y - state.startY
    var value

    if (track.type === 'right') {
      value = state.originX + Math.floor((dx * 100) / state.zoom)
      state.activeElement.width = value > 10 ? value : 10
      return
    }

    if (track.type === 'down') {
      value = state.originX + Math.floor((dy * 100) / state.zoom)
      state.activeElement.height = value > 10 ? value : 10
      return
    }

    if (track.type === 'left') {
      var left = state.originX + Math.floor((dx * 100) / state.zoom)
      var width = state.originY - Math.floor((dx * 100) / state.zoom)
      state.activeElement.left = left > 0 ? left : 0
      state.activeElement.width = width > 10 ? width : 10
      return
    }

    if (track.type === 'up') {
      var top = state.originX + Math.floor((dy * 100) / state.zoom)
      var height = state.originY - Math.floor((dy * 100) / state.zoom)
      state.activeElement.top = top > 0 ? top : 0
      state.activeElement.height = height > 10 ? height : 10
    }
  },


  // 页面缩放
  zoom(state, val) {
    state.zoom = val
  },

  // 删除选中元件
  delete(state, uuid) {
    var type = state.type
    if (type === 'page') return
    let index = 0
    state.page.tempItems.forEach((item, idx) => {
      if (item.uuid === uuid) {
        index = idx
      }
    })
    // 删除元件
    state.page.tempItems.splice(index, 1)

    state.type = 'page'
    state.uuid = -1
  },

  // 添加组件
  selectTempItem(state, item) {
    let def = {
      uuid: (new Date().getTime()).toString(),
    }
    let setting = JSON.parse(JSON.stringify(item))

    state.page.tempItems.push(Object.assign(setting, def))
  },

  // 更新数据
  updateData(state, { uuid, value }) {
    let widget = state.page.tempItems.find((w) => w.uuid === uuid)
    widget ? (widget.value = value) : ''
  },

  // 设置模板Id
  setTempId(state, id) {
    state.tempId = id
  },

  setLoading(state, flag) {
    state.loading = flag
  },
  // 设置模板默认属性
  setWidgetSetting(state, settingObj) {
    state.widgetSetting = settingObj
  },
}
const actions = {
  // 添加模板项
  selectTempItem({ state, commit }, item) {
    commit('selectTempItem', item)
    // 设置选中
    commit('select', {
      uuid: state.page.tempItems[state.page.tempItems.length - 1].uuid,
    })
  },

  // 初始化模板设计器
  async designerInit({ state, commit }, tempInfo) {
    commit('initOptionItems', tempInfo.options)
    commit('initPage', tempInfo.tempValue)
  },
}
export default {
  namespaced: true,
  state,
  mutations,
  actions,
}
