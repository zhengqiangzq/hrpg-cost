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
      <div>
        <el-button
          style="margin: 5px !important"
          :plain="true"
          :disabled="!canAllocation"
          @click="allocation"
          >重新分配</el-button
        >
        <el-button
          style="margin: 5px !important"
          :plain="true"
          :disabled="!canCancelAllocation"
          @click="cancelAllocation"
          >取消分配</el-button
        >
      </div>
      <dialog-table
        ref="dialogTable"
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
        :pager="false"
        :reserve-selection="true"
        :checked-row-list="checkedRowList"
        :checkedList="checkBox ? checkedList : []"
        @handleEvent="handleEvent"
      />
    </page-dialog>
  </div>
</template>

<script setup>
import PageDialog from '../PageDialog/index'
import PageFilter from '../PageFilter/index'
import DialogTable from '../DialogTable/index'
import { getAllocationOrg } from '@/api/base.js'
const emits = defineEmits()
const { proxy } = getCurrentInstance()
const props = defineProps({
  title: {
    type: String,
    default: '分配详情',
  },
  highlightRow: {
    type: Boolean,
    default: false,
  },
  checkBox: {
    type: Boolean,
    default: true,
  },
  api: {
    type: Function,
    default: getAllocationOrg,
  },
  cancelApi: {
    type: Function,
    default: undefined,
  },
  allocationApi: {
    type: Function,
    default: undefined,
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
    default: false,
  },
  checkedList: {
    type: Array,
    default: function () {
      return []
    },
  },
  loids: {
    type: Array,
    default: function () {
      return []
    },
  },
  codes: {
    type: Array,
    default: function () {
      return []
    },
  },
  fieldList: {
    type: Array,
    default: function () {
      return [
        { label: '组织编码', value: 'orgCode' },
        { label: '组织名称', value: 'orgName' },
        { label: '分配来源机构', value: 'createOrgName' },
        { label: '分配状态', value: 'allocationResultValue' },
        { label: '分配时间', value: 'allocationTime' },
        { label: '失败原因', value: 'errorReason' },
      ]
    },
  },
  filterInfoList: {
    type: Array,
    default: function () {
      return []
    },
  },
  businessType: {
    type: String,
    default: '',
  },
})

// 过滤相关配置
const filterInfo = ref({
  query: {
    sort: 'create_time desc',
    ...props.query,
  },
  list: [
    {
      type: 'input',
      label: '编码',
      value: 'orgCodeLike',
      event: search,
    },
    {
      type: 'input',
      label: '名称',
      value: 'orgNameLike',
      event: search,
    },
    {
      type: 'select-model',
      label: '分配状态',
      code: 'success_status',
      clearable: true,
      value: 'allocationResult',
      event: search,
    },
    { type: 'button', label: '查询', event: search },
    { type: 'button', label: '重置', event: clearSearch },
  ],
})
// 表格相关
const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  api: undefined,
  data: [],
  selections: [],
  fieldList: props.fieldList,
  handle: {
    fixed: 'right',
    label: '操作',
    width: '140',
    btList: [
      {
        label: '取消分配',
        show: true,
        event: cancelAllocation,
        ifRender: function (row) {
          return row.allocationResult === '1'
        },
      },
      {
        label: '重新分配',
        show: true,
        event: allocation,
        ifRender: function (row) {
          return row.allocationResult === '0'
        },
      },
    ],
  },
})
// 弹窗相关
const dialogInfo = ref({
  width: '1200px',
  title: props.title,
  btLoading: false,
  btList: [{ label: '取消', event: handleClose, show: true }],
})
const isDrug = ref(proxy.$route?.path.includes('/drug/'))
const canCancelAllocation = computed(() => {
  return (
    tableInfo.value.selections.length &&
    !tableInfo.value.selections.filter((item) => item.allocationResult !== '1')
      .length
  )
})
const canAllocation = computed(() => {
  return (
    tableInfo.value.selections.length &&
    !tableInfo.value.selections.filter((item) => item.allocationResult !== '0')
      .length
  )
})
const shows = computed({
  get() {
    return props.showDialog
  },
  set(newValue) {
    emits('update:showDialog', newValue) // 更新父组件shows
  },
})

onMounted(() => {
  // hack, 在table创建出来之后再去调用
  proxy.$nextTick(() => {
    getList()
    fullQuery()
  })
})
function fullQuery() {
  if (props.filterInfoList.length) {
    let arr = [
      { type: 'button', label: '查询' },
      {
        type: 'button',
        label: '重置',
        value: 'clearSearch',
        event: clearSearch,
      },
    ]
    filterInfo.value.list = props.filterInfoList.concat(arr)
    filterInfo.value.list.forEach((item) => {
      if (item.value !== 'clearSearch') {
        item.event = search
      }
    })
  }
}
function cancelAllocation(row) {
  let params = {
    loids: props.loids,
    codeList: props.codes,
    businessType: isDrug.value ? '4' : '0',
    groupOrgList: [],
  }
  proxy
      .$confirm(props.codes.length ? '取消分配后被分配的组织的附件要求说明会清空，请确认是否取消全部分配?' : '请确认是否取消全部分配?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
      .then(() => {
        if (row && row.id) {
          params.groupOrgList = [
            {
              groupId: row.groupId,
              orgId: row.orgId,
            },
          ]
        } else {
          tableInfo.value.selections.map((item) => {
            let obj = {
              groupId: item.groupId,
              orgId: item.orgId,
            }
            params.groupOrgList.push(obj)
          })
        }
        if (props.businessType) {
          params.businessType = props.businessType
        }
        props.cancelApi(params).then((res) => {
          if (res && res.success) {
            proxy.$message.success({
              message: '操作成功',
              duration: 3000,
              showClose: true,
            })
            tableInfo.value.selections = []
            proxy.$refs.dialogTable.clearSelection()
            search()
          }
        })
      })
}
function allocation(row) {
  let params = {
    loids: props.loids,
    codeList: props.codes,
    businessType: isDrug.value ? '4' : '0',
    groupOrgList: [],
  }
  if (row && row.id) {
    params.groupOrgList = [
      {
        groupId: row.groupId,
        orgId: row.orgId,
      },
    ]
  } else {
    tableInfo.value.selections.map((item) => {
      let obj = {
        groupId: item.groupId,
        orgId: item.orgId,
      }
      params.groupOrgList.push(obj)
    })
  }
  if (props.businessType) {
    params.businessType = props.businessType
  }
  props.allocationApi(params).then((res) => {
    if (res && res.success) {
      proxy.$message.success({
        message: '操作成功',
        duration: 3000,
        showClose: true,
      })
      tableInfo.value.selections = []
      proxy.$refs.dialogTable.clearSelection()
      search()
    }
  })
}
// 获取列表
function getList() {
  tableInfo.value.api = props.api
  tableInfo.value.refresh = Math.random()
}
function search() {
  tableInfo.value.api = props.api
  tableInfo.value.initCurpage = Math.random()
  tableInfo.value.refresh = Math.random()
}
function clearSearch() {
  filterInfo.value.query = {
    sort: 'create_time desc',
    ...props.query,
  }
  search()
}
function handleEvent(event, data) {
  switch (event) {
    case 'tableCheck':
      tableInfo.value.selections = data
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
