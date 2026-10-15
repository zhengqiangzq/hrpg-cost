<template>
  <div
    v-loading="treeLoading"
    class="page-tree"
    @contextmenu.prevent="handleTreeClick"
  >
    <el-tree
      ref="TreeComponent"
      class="tree-component disabled-select"
      :show-checkbox="checkBox"
      :lazy="loadType === 2"
      :draggable="draggable"
      :allow-drop="handleDrop"
      :default-expand-all="expandAll"
      :expand-on-click-node="clickNode"
      :check-strictly="checkStrictly"
      :filter-node-method="filterNode"
      :default-expanded-keys="defaultExpanded"
      :default-checked-keys="defaultChecked"
      highlight-current
      :render-content="renderContent"
      :props="treeProps"
      @node-click="handleClickLeft"
      @node-contextmenu="handleClickRight"
      @check="handleCheck"
      @check-change="handleCheck"
      @current-change="handleCheck"
      @node-expand="handleCheck"
    />
    <!-- 右键菜单 -->
    <ul
      v-show="rightMenu.show"
      class="contextmenu"
      :style="{ left: rightMenu.left + 'px', top: rightMenu.top + 'px' }"
    >
      <li
        v-for="(item, index) in rightMenu.list.filter((item) => item.show)"
        :key="index"
        @click="handleRightEvent(item.type, item.data, item.node, item.vm)"
      >
        {{ item.name }}
      </li>
    </ul>
  </div>
</template>

<script setup name="PageTree">
const { proxy } = getCurrentInstance()
const emits = defineEmits()
const props = defineProps({
  // shu
  treeData: {
    type: Array,
    default: () => {
      return []
    },
  },
  // 容器，内部获取到的数据提供外部的接口
  baseData: {
    type: Array,
    default: () => {
      return []
    },
  },
  // 是否手风琴点击
  clickNode: {
    type: Boolean,
    defalult: false,
  },
  // 加载方式
  loadType: {
    type: Number,
    defalult: 1, // 1: 正常通过接口加载 2: 懒加载 3: 传入数据
  },
  /**
   * 懒加载相关数据
   * key -> 唯一标识 label -> 显示 type -> 类型 api -> 接口 params -> 参数 leaf -> 是否叶子节点
   Info.value: {
    type: Array,
    default: () => {
      return [
        {
          key: 'id',
          label: 'name',
          type: '',
          api: () => {},
          params: { key: '', value: '', type: 'url' }, // url/query->{data: [{key: '', value: '', default: ''}] type: 'query'}
          resFieldList: [], // 数据响应成功的字段列表
          leaf: true,
        },
      ]
    },
  },
  /**
   * 正常加载相关
   */
  loadInfo: {
    type: Object,
    default: () => {
      return {
        key: 'id', // 节点
        label: 'name',
        api: () => {},
        params: { key: '', value: '', type: 'url' }, // url/query->{data: [{key: '', value: '', default: ''}] type: 'query'}
        resFieldList: [], // 数据响应成功的字段列表
      }
    },
  },
  // 默认选中的项
  defaultChecked: {
    type: Array,
  },
  // 默认点击的项 (设置为obj，保证能一直监听到数据的变化)
  defaultClicked: {
    type: Object,
    defalult: () => {
      return {}
    },
  },
  // 默认展开项
  defaultExpanded: {
    type: Array,
  },
  // 默认高亮
  defaultHighLight: {
    type: null,
  },
  // 是否全部展开
  expandAll: {
    type: Boolean,
    default: false,
  },
  // 是否有选择框
  checkBox: {
    type: Boolean,
    default: false,
  },
  // 在有复选框的时候，是否·遵循父子不互关联
  checkStrictly: {
    type: Boolean,
    default: false,
  },
  // 是否可拖拽
  draggable: {
    type: Boolean,
    default: true,
  },
  // 是否需要右键菜单
  rightClick: {
    type: Boolean,
    default: true,
  },
  // 右键菜单列表
  rightMenuList: {
    type: Array,
    default: () => {
      return []
    },
  },
  // 设置节点过滤文本
  filterText: {
    type: String,
  },
  // 节点的key字段名称
  nodeKey: {
    type: String,
    default: 'id',
  },
  // 设置树状的字段结构
  treeProps: {
    type: Object,
    default: () => {
      return {
        children: 'children',
        label: 'name',
        isLeaf: 'leaf',
      }
    },
  },
  // 传入一个随机数，让树组件更新
  treeRefresh: {
    type: Number,
  },
  // 要刷新的层级
  refreshLevel: {
    type: Number,
    default: 0,
  },
})
const treeLoading = ref(false)
const rightMenu = ref({
  show: false,
  left: 0,
  top: 0,
  list: [],
})
const node = ref(null)
// 每个level的节点信息
const nodeInfoList = ref({})

watch(
  () => props.defaultChecked,
  (val) => {
    // 将节点选中的状态初始化
    proxy.$refs.TreeComponent.setCheckedNodes([])
    // const result = [];
    for (let i = 0; i < val.length; i++) {
      // result.push(data.data[i].id);
      // 得到选中的节点,这个方法ojbk
      proxy.$refs.TreeComponent.setChecked(val[i], true)
    }
  }
)

watch(
  () => rightMenu.value.show,
  (val) => {
    if (val) {
      document.body.addEventListener('click', handlecCloseMenu)
    } else {
      document.body.removeEventListener('click', handlecCloseMenu)
    }
  }
)
watch(
  () => props.rightMenuList,
  (val) => {
    if (val.length === 0) return
    // 处理右键要显示的菜单内容
    rightMenu.value.list = val
  }
)
watch(
  () => props.treeRefresh,
  (val) => {
    if (lazy.value) {
      const level =
        'node' + (props.refreshLevel - 1 >= 0 ? props.refreshLevel - 1 : 0)
      nodeInfoList.value[level].node.childNodes = [] // 清空子节点, 保证数据不会重复渲染
      handleLoadNode(
        nodeInfoList.value[level].node,
        nodeInfoList.value[level].resolve
      )
    } else {
      initData()
    }
    // 关闭菜单
    handlecCloseMenu()
  }
)
watch(
  () => props.defaultHighLight,
  (val) => {
    proxy.$nextTick(() => {
      proxy.$refs.TreeComponent.setCurrentKey(val)
    })
  }
)
watch(
  () => props.defaultClicked,
  (val) => {
    if (!val.id) return
    const data = t ? t.valueInfo.value : loadInfo.value
    emits('handleEvent', 'leftClick', {
      data: getSelectData(data.key, props.baseData, val.id),
    })
  }
)

onMounted(() => {
  initData()
})

// 自定义渲染内容
function renderContent(h, { node, data, store }) {
  // let dom
  // // 懒加载图标设置
  // if (props.loadType === 2) {
  //   if (data.leaf) {
  //     dom = (
  //       <p class='custom-tree-node'>
  //         <img src={import('@/assets/image/doc.png')}></img>
  //         <span style='margin-left:5px;' title={data.desc}>
  //           {node.label}
  //         </span>
  //       </p>
  //     )
  //   } else {
  //     dom = (
  //       <p class='custom-tree-node'>
  //         <img
  //           src={
  //             node.expanded
  //               ? import('@/assets/image/file-open.png')
  //               : import('@/assets/image/file-close.png')
  //           }
  //         ></img>
  //         <span style='margin-left:5px;' title={data.desc}>
  //           {node.label}
  //         </span>
  //       </p>
  //     )
  //   }
  // } else {
  //   dom = (
  //     <p class='custom-tree-node' title={data.desc}>
  //       <span style='margin-left:5px;' title={data.desc}>
  //         {node.label}
  //       </span>
  //     </p>
  //   )
  // }
  // // <i class={node.expanded ? 'el-icon-albb-int' : 'el-icon-albb-earth'}></i>
  // return dom
}
// 过滤节点
function filterNode(value, data) {
  if (!value) return true
  return data.label.indexOf(value) !== -1
}
// 树盒子的右键点击事件
function handleTreeClick(e) {
  if (!props.rightClick) return
  // 初始菜单
  rightMenu.value.list = [
    {
      name: '刷新',
      type: 'refreshTree',
      data: null,
      node: null,
      vm: null,
      show: true,
    },
  ]
  // 显示菜单，并且根据点击的位置生成菜单显示的坐标
  rightMenu.value.show = true
  const h =
    window.innerHeight ||
    document.documentElement.clientHeight ||
    document.body.clientHeight
  const len = rightMenu.value.list.length
  let top
  if (len * 30 + e.clientY > h) {
    top = e.clientY - len * 30
  } else {
    top = e.clientY
  }
  rightMenu.value.left = e.clientX
  rightMenu.value.top = top
}
// 节点左键点击
function handleClickLeft(data, node, vm) {
  // 关闭菜单
  handlecCloseMenu()
  emits('handleEvent', 'leftClick', { data, node, vm })
}
// 右键的点击事件 => 参数依次为 event, 数据， 节点， 节点组件本身
function handleClickRight(e, data, node, vm) {
  if (!props.rightClick) return
  // 显示菜单，并且根据点击的位置生成菜单显示的坐标
  rightMenu.value.show = true
  const h =
    window.innerHeight ||
    document.documentElement.clientHeight ||
    document.body.clientHeight
  const len = rightMenu.value.list.length
  let top
  if (len * 30 + e.clientY > h) {
    top = e.clientY - len * 30
  } else {
    top = e.clientY
  }
  rightMenu.value.left = e.clientX
  rightMenu.value.top = top
  emits('handleEvent', 'rightClick', { data, node, vm })
}
// 右键的事件触发， 派发到父组件处理
function handleRightEvent(type, data, node, vm) {
  emits('handleEvent', 'rightEvent', { type, data, node, vm })
}
// 关闭右键菜单
function handlecCloseMenu() {
  rightMenu.value.show = false
}
// 选择框的点击事件
function handleCheck() {
  // 获取半选中的节点和key
  const halfs = proxy.$refs.TreeComponent.getHalfCheckedNodes()
  const halfKeys = proxy.$refs.TreeComponent.getHalfCheckedKeys()
  // 得到全选中的节点和key
  const checkeds = proxy.$refs.TreeComponent.getCheckedNodes()
  const checkedKeys = proxy.$refs.TreeComponent.getCheckedKeys()
  // 将当前选择的数据派发到父级处理
  emits('handleEvent', 'treeCheck', {
    // 半选中和全选中的节点
    keys: halfKeys.concat(checkedKeys),
    // 半选中和全选中的node
    nodes: halfs.concat(checkeds),
    // 半选中的节点
    halfKeys,
    // 全选中的节点
    checkedKeys,
    // 半选中的node
    halfs,
    // 全选中的node
    checkeds,
  })
}
// 是否可以放置, 设置为只能同一层级拖拽
function handleDrop(draggingNode, dropNode, type) {
  return draggingNode.level === dropNode.level && type !== 'inner'
}
// 正常通过接口加载
function initData() {
  // 非正常加载
  if (props.loadType !== 1) return
  // 加载loading
  treeLoading.value = true
  const treeProps = props.treeProps
  const loadInfo = loadInfo.value
  const params = loadInfo.params || {}
  let data
  if (params.type === 'url') {
    data = params.value
  } else if (params.type === 'query') {
    data = {}
    params.data.forEach((item) => {
      data[item.key] = item.value
    })
  } else {
    // console.log('没有传参数类型')
  }
  loadInfo
    .api(data)
    .then((res) => {
      let arr = []
      if (res.success) {
        let resData = res
        const resFieldList = loadInfo.resFieldList
        // 得到定义的响应成功的数据字段
        for (let i = 0; i < resFieldList.length; i++) {
          resData = resData[resFieldList[i]]
        }
        // 数据处理
        arr = JSON.parse(JSON.stringify(resData))
        arr.forEach((item) => {
          // 保证刷新之后key的唯一
          item.key = item[loadInfo.key]
          item[treeProps.label] = item[loadInfo.label]
        })
        // 得到数据后把数据给到父级，方便父级用到
        emits('update:baseData', arr)
        // 设置默认高亮
        if (props.defaultHighLight || props.defaultHighLight === 0) {
          proxy.$nextTick(() => {
            proxy.$refs.TreeComponent.setCurrentKey(props.defaultHighLight)
          })
        }
        // 设置默认点击
        if (
          props.defaultClicked &&
          (props.defaultClicked.id || props.defaultClicked.id === 0)
        ) {
          // 页面初始化，设置默认点击项， 并将点击事件派发到父级
          emits('handleEvent', 'leftClick', {
            data:
              getSelectData(
                loadInfo.key,
                props.baseData,
                props.defaultClicked.id
              ) || {},
          })
        }
      } else {
        proxy.$message({
          showClose: true,
          message: res.message,
          type: res.success ? 'success' : 'error',
          duration: 3500,
        })
      }
      // 加载loading
      treeLoading.value = false
    })
    .catch(() => {
      // 加载loading
      treeLoading.value = false
    })
}
// 在树状数据中找到某一条数据
function getSelectData(key, data, val) {
  for (const item of data) {
    if (item[key] === val) {
      return item
    }
  }
}
// 懒加载数据
function handleLoadNode(node, resolve) {
  // 非懒加载
  if (props.loadType !== 2) return
  // 加载loading
  if (node.level === 0) {
    treeLoading.value = true
  }
  // 存下每个懒加载的数据
  nodeInfoList.value['node' + node.level] = { node, resolve }
  // 懒加载延迟时间
  const timeStamp = 100
  const treeProps = props.treeProps
  const levelInfo = tInfo.value[node.level]
  const params = levelInfo.params
  let data
  if (params.type === 'url') {
    data =
      props.refreshLevel > 0
        ? node.data[levelInfo.key]
        : params.value || params.value === 0
        ? params.value
        : node.data[levelInfo.key]
  } else if (params.type === 'query') {
    params.data.forEach((item) => {
      data = {}
      data[item.key] = item.default || node.data[item.value]
    })
  } else {
    console.log('没有传参数类型')
  }
  levelInfo
    .api(data)
    .then((res) => {
      let arr = []
      if (res.success) {
        let resData = res
        const resFieldList = levelInfo.resFieldList
        // 得到定义的响应成功的数据字段
        for (let i = 0; i < resFieldList.length; i++) {
          resData = resData[resFieldList[i]]
        }
        // 数据处理
        arr = JSON.parse(JSON.stringify(resData))
        arr.forEach((item) => {
          // 保证key的唯一
          item.key = levelInfo.type + item[levelInfo.key]
          item['level' + node.level + 'data'] = node.data
          item[treeProps.label] = item[levelInfo.label]
          item.type = levelInfo.type
          item[treeProps.isLeaf] = levelInfo.leaf
        })
        // 得到数据后把数据给到父级，方便父级用到
        emits('update:baseData', [...props.baseData, ...arr])
        // 设置默认高亮
        if (props.defaultHighLight || props.defaultHighLight === 0) {
          proxy.$nextTick(() => {
            proxy.$refs.TreeComponent.setCurrentKey(props.defaultHighLight)
          })
        }
        // 设置默认点击
        if (
          props.defaultClicked &&
          (props.defaultClicked.id || props.defaultClicked.id === 0)
        ) {
          // 页面初始化，设置默认点击项， 并将点击事件派发到父级
          emits('handleEvent', 'leftClick', {
            data:
              getSelectData(
                levelInfo.key,
                props.baseData,
                props.defaultClicked.id
              ) || {},
          })
        }
      } else {
        proxy.$message({
          showClose: true,
          message: res.message,
          type: res.success ? 'success' : 'error',
          duration: 3500,
        })
      }
      // 延迟加载，保证加载动画
      setTimeout(() => {
        resolve(arr)
      }, timeStamp)
      // 加载loading
      if (node.level === 0) {
        treeLoading.value = false
      }
    })
    .catch(() => {
      // 延迟加载，保证加载动画
      setTimeout(() => {
        resolve([])
      }, timeStamp)
      // 加载loading
      if (node.level === 0) {
        treeLoading.value = false
      }
    })
}
</script>

<style lang="scss" scoped></style>
