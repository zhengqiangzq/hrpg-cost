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
          ref="pageFormRef"
          v-model:query="filterInfo.query"
          :filter-list="filterInfo.list"
      >
        <template #filter-productFinCategoryName>
          <el-input
              v-model="filterInfo.query.productFinCategoryName"
              class="not-mongolia"
              type="input"
              placeholder="请选择财务分类"
              :disabled="true"
          >
            <template #append>
              <el-icon @click="openSuppliesType"><Search /></el-icon>
            </template>
          </el-input>
        </template>
      </page-filter>
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
    <SelectSuppliesData
        v-if="suppliesInfo.visible"
        v-model:showDialog="suppliesInfo.visible"
        :query="suppliesInfo.query"
        :title="suppliesInfo.title"
        :api="suppliesInfo.api"
        :pager="suppliesInfo.pager"
        :check-box="suppliesInfo.checkBox"
        :fieldList="suppliesInfo.fieldList"
        :checkedList="suppliesInfo.checkedList"
        :filterInfoList="suppliesInfo.filters"
        :no-search="suppliesInfo.noSearch"
        highlight-row
        @callback="suppliesCallback"
    ></SelectSuppliesData>
  </div>
</template>

<script setup name="selectTableData">
import PageDialog from '../PageDialog/index'
import PageFilter from '../PageFilter/index'
import DialogTable from '@/components/DialogTable'
import {productFinCategorytree, productpage} from "@/api/personnelInfo";
import {getCurrentInstance, onMounted, ref, watch} from "vue";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
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
  checkBox: {
    type: Boolean,
    default: true,
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
  dialogClone: {
    type: Boolean,
    default: true,
  },
  checkedList: {
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

const { tableParameter, openDialog } = useSelectTableData()

const pageFormRef = ref()
// 过滤相关配置
const filterInfo = ref({
  query: {
    sort: 'create_time desc',
    status: 1,
    pageNo: 1,
    pageSize: 20,
  },
  list: [
    { label: '物资编码/名称', value: 'name', type: 'input' },
    { label: '财务分类', showLabel: true, value: 'productFinCategoryName', type: 'slot' },
    {type: 'button', label: '查询', event: search},
    {type: 'button', label: '重置', event: reset},
  ],
})
// 表格相关
const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  api: productpage,
  data: [],
  pager: true,
  fieldList: [
    { label: '物资编码', value: 'code' },
    { label: '物资名称', value: 'name' },
    { label: '物资分类编码', value: 'productFinCategoryCode' },
    { label: '物资分类名称', value: 'productFinCategoryName' },
    { label: '是否收费', value: 'isChargeName' },
  ],
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

const suppliesInfo = ref({
  visible: false,
  query: {},
  checkBox: true,
  title: '财务分类',
  checkedList: [],

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
  tableInfo.value.checkBox = props.checkBox
  // hack, 在table创建出来之后再去调用
  proxy.$nextTick(() => {
    getList()
    fullQuery()
  })
})

function fullQuery() {
  filterInfo.value.query = {
    ...filterInfo.value.query,
  }
  let filters = props.filterInfoList
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
  if (props.noSearch) {
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

function openSuppliesType() {
  tableParameter.title = '财务分类'
  tableParameter.checkBox = true
  tableParameter.saveEmpty = true
  tableParameter.api = productFinCategorytree
  tableParameter.query = {}
  tableParameter.callBack = (raw) => {
    console.log('1111111', raw)
    tableParameter.checkedList = raw
    filterInfo.value.query.productFinCategoryIdList = raw?.map((it) => it.id)
    filterInfo.value.query.productFinCategoryName = raw?.map((it) => it.name).join(',')
  }
  openDialog(pageFormRef.value, 'tree')
}



function search() {
  tableInfo.value.initCurpage = Math.random()
  getList()
}

function reset() {
  filterInfo.value.query = {
    sort: 'create_time desc',
    status: 1,
    pageNo: 1,
    pageSize: 20,
    ...props.query,
  }
  suppliesInfo.value.checkedList = []
  getList()
}

function save() {
  // emits('input', data)
  if (props.checkBox) {
    if (props.dialogClone) {
      handleClose()
    }
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

function suppliesCallback(raw) {
  if(!raw) return
  suppliesInfo.value.checkedList = raw
  filterInfo.value.query.productFinCategoryIdList = raw?.map((it) => it.id)
  filterInfo.value.query.productFinCategoryName = raw?.map((it) => it.name).json(',')
}

// 关闭弹窗前的回调
function handleClose() {
  shows.value = false
  emits('reset')
}
</script>

<style scoped></style>
