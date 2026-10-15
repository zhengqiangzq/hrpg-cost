<!-- 选择预算项目 -->
<template>
  <div>
    <page-dialog
        :title="dialogInfo.title"
        v-model:visible="shows"
        :width="dialogInfo.width"
        :bt-loading="dialogInfo.btLoading"
        :bt-list="dialogInfo.btList"
    >
      <!-- 条件栏 -->
      <page-filter
          v-model:query="filterInfo.query"
          :filter-list="filterInfo.list"
      />
      <DialogTable
          :refresh="tableInfo.refresh"
          :init-curpage="tableInfo.initCurpage"
          v-model:data="tableInfo.data"
          :api="tableInfo.api"
          row-key="id"
          :query="filterInfo.query"
          :field-list="tableInfo.fieldList"
          :handle="tableInfo.handle"
          :highlight-row="highlightRow"
          :check-box="checkBox"
          :pager="tableInfo.pager === false ? false : pager"
          :reserve-selection="true"
          :checked-row-list="checkedRowList"
          :checkedList="checkBox ? checkedList : []"
          @handleEvent="handleEvent"
      />
    </page-dialog>
  </div>
</template>

<script setup name="selectTableData">
import PageDialog from '../PageDialog/index'
import PageFilter from '../PageFilter/index'
import DialogTable from '@/components/DialogTable'
import {tableHeader} from "@/components/SelectTableData/table";
const emits = defineEmits()
const { proxy } = getCurrentInstance()
const props = defineProps({
  title: {
    type: String,
  },
  highlightRow: {
    type: Boolean,
    default: false,
  },
  pager: {
    type: Boolean,
    default: true
  },
  checkBox: {
    type: Boolean,
    default: true,
  },
  api: {
    type: Function,
  },
  showDialog: {
    type: Boolean,
  },
  query: {
    type: Object,
    default: function () {
      return {}
    },
  },
  checkedRowList: {
    type: Array,
    default: function () {
      return []
    },
  },
  saveEmpty: {
    type: Boolean,
    default: true,
  },
  modelType: {
    type: String,
  },
  checkedList: {
    type: Array,
    default: function () {
      return []
    },
  },
  fieldList: {
    type: Array,
    default: function () {
      return []
    },
  },
  filterInfoList: {
    type: Array,
  },
  noSearch: {
    type: Boolean
  }
})

// 过滤相关配置
const filterInfo = ref({
  query: {
    sort: 'create_time desc',
    status: 1,
    pageNo: 1,
    pageSize: 20,
  },
  list: [
    {
      type: 'input',
      label: '编码',
      value: 'code',
      event: search,
    },
    {
      type: 'input',
      label: '名称',
      value: 'name',
      event: search,
    },
    {type: 'button', label: '查询', event: search},
    {type: 'button', label: '重置', event: reset},
  ],
})
// 表格相关
const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  api: undefined,
  data: [],
  fieldList: [],
})
// 弹窗相关
const dialogInfo = ref({
  title: props.title,
  btLoading: false,
  btList: [
    {label: '取消', event: handleClose, show: true},
    {
      label: '确定',
      type: 'primary',
      disabled: !props.saveEmpty,
      event: save,
      show: true,
    },
  ],
})
const selectRow = ref('')

const shows = computed({
  get() {
    return props.showDialog
  },
  set(newValue) {
    emits('update:showDialog', newValue) // 更新父组件shows
  },
})

onMounted(() => {
  const from = tableHeader(props.modelType)
  dialogInfo.value.title = props.title || from.title
  tableInfo.value.fieldList = from.header.concat(props.fieldList);
  tableInfo.value.checkBox = props.checkBox ?? from.checkBox
  tableInfo.value.api = from.api;
  tableInfo.value.pager = from.pager
  // hack, 在table创建出来之后再去调用
  proxy.$nextTick(() => {
    getList()
    fullQuery()
  })
})

function fullQuery() {
  const form = tableHeader(props.modelType)
  filterInfo.value.query = {
    ...filterInfo.value.query,
    ...form.query
  }
  let filters = form.filters || props.filterInfoList
  if (filters) {
    filterInfo.value.list = filters.length > 0 ? [
        ...filters.map(filter => {
        return {
          ...filter,
          event: search
        }
      }),
      {type: 'button', label: '查询',event: search},
      ...(filters.length ? [{type: 'button', label: '重置',event: reset}] : [])
    ] : []
  }
  if (form.noSearch || props.noSearch) {
    filterInfo.value.list = []
  }
}

// 获取列表
function getList() {
  filterInfo.value.query = {
    ...filterInfo.value.query,
    ...props.query,
  }
  tableInfo.value.refresh = Math.random()
}

function search() {
  tableInfo.value.initCurpage = Math.random()
  getList()
}

function reset() {
  const form = tableHeader(props.modelType)
  filterInfo.value.query = {
    sort: 'create_time desc',
    status: 1,
    pageNo: 1,
    pageSize: 20,
    ...form.query,
    ...props.query,
  }
  getList()
}

function save() {
  // emits('input', data)
  if (props.checkBox) {
    handleClose()
    emits('callback', selectRow.value || [])
  } else {
    handleClose()
    emits('callback', selectRow.value)
    // proxy.$message({
    //   type: "warning",
    //   duration: 3500,
    //   showClose: true,
    //   message: "请选择部门"
    // });
  }
}

function handleEvent(event, data) {
  console.log(456)
  console.log(data)
  switch (event) {
    case 'tableClickRow':
      selectRow.value = data
      if (!props.saveEmpty) {
        dialogInfo.value.btList[1].disabled = !selectRow.value
      }
      break
    case 'tableCheck':
      selectRow.value = data
      if (!props.saveEmpty) {
        dialogInfo.value.btList[1].disabled = !selectRow.value
      }
      break
  }
}

// 关闭弹窗前的回调
function handleClose() {
  shows.value = false
  emits('reset')
}
</script>

<style scoped></style>
