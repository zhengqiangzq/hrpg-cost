<script setup>
import Details from './details.vue'
import {onMounted} from "vue";
import moment from "moment";
import {exportCostAllocationDetail, pageCostAllocationDetail} from "@/api/costAllocation";
const {proxy} = getCurrentInstance()
const emit = defineEmits()
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
})

const filterInfo = ref({
  query: {
  },
  list: [
    { label: '会计期间', value: 'accountingPeriodName', showLabel: true, type: 'slot' },
    { label: '单据开始日期', value: 'startDocTime', type: 'date', valueFormat: 'YYYY-MM-DD' },
    { label: '单据结束日期', value: 'endDocTime', type: 'date', valueFormat: 'YYYY-MM-DD' },
    { label: '单据号', value: 'docNum', type: 'input' },
    { label: '科室信息', value: 'deptName', showLabel: true, type: 'slot' },
    { label: '成本分类', value: 'costCategoryName', showLabel: true, type: 'slot' },
    { label: '成本项目', value: 'costItemName', showLabel: true, type: 'slot' },
    { label: '资金来源', value: 'assetCapitalCode', type: 'select-model', multiple: true, code: 'asset_capital_source' },
    { label: '汇总显示', value: 'isGroup', type: 'checkbox' },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', event: reset, },
  ],
  btnList: [
    { type: 'button', label: '导出Excel', show: proxy.$permission('costAllocation:export'), event: exportData },
  ]
})
const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  api: null,
  fieldList: [
    { label: '单据号', value: 'docNum' },
    { label: '单据日期', value: 'docTime', formatter: (row) => moment(row.docTime).format('YYYY-MM-DD') },
    { label: '会计期间', value: 'accountingPeriodValue' },
    { label: '科室编码', value: 'deptCode' },
    { label: '科室名称', value: 'deptName' },
    { label: '成本项目编码', value: 'costItemCode' },
    { label: '成本项目名称', value: 'costItemName' },
    { label: '资金来源', value: 'assetCapitalValue' },
    { label: '直接计入金额', value: 'directCountMoney', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.directCountMoney) },
    { label: '计算计入金额', value: 'calcuCountMoney', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.calcuCountMoney) },
    { label: '金额', value: 'totalMoney', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.totalMoney) },
    { label: '备注', value: 'remark' },
  ],
  summaryFieldList: [
    { value: 'directCountMoney', formatter: proxy.$fn.TripartiteMethod },
    { value: 'calcuCountMoney', formatter: proxy.$fn.TripartiteMethod },
    { value: 'totalMoney', formatter: proxy.$fn.TripartiteMethod },
  ],
  data: [],
  handle: null,
})
const detailsInfo = ref({
  visible: false,
})
const treeInfo = ref({
  title: '',
  visible: false,
  checkBox: true,
  checkStrictly: false,
  isLeaf: false,
  query: {},
  checkedList: []
})
const tableParameter = ref({
  visible: false,
  type: '',
  title: '成本项目',
  checkBox: false,
  pager: true,
  callback: null,
  filters: [],
  fieldList: [],
  query: {last: true},
  checkedList: []
})
const pageFilterRef = ref()
const showDialog = computed({
  get() {
    return props.visible
  },
  set(newValue) {
    emit('update:visible', newValue) // 更新父组件visible
  },
})

onMounted(() => {
  tableInfo.value.api = pageCostAllocationDetail
  getList()
})

function getList() {
  const isGroup = filterInfo.value.query.isGroup ? '1' : '0'
  if (filterInfo.value.copyQuery?.isGroup !== isGroup) {
    tableInfo.value.curPage = 1
    tableInfo.value.data = []
  }
  filterInfo.value.copyQuery = {
    ...filterInfo.value.query,
    isGroup,
    deptId: undefined,
    deptName: undefined,
    assetCapitalCodeList: filterInfo.value.query.assetCapitalCode ? filterInfo.value.query.assetCapitalCode.split(',') : []
  }

  if (isGroup === '1') {
    tableInfo.value.fieldList = [
      { label: '会计期间', value: 'accountingPeriodValue' },
      { label: '科室编码', value: 'deptCode' },
      { label: '科室名称', value: 'deptName' },
      { label: '成本分类', value: 'costCategoryName' },
      { label: '资金来源', value: 'assetCapitalValue' },
      { label: '直接计入金额', value: 'directCountMoney' },
      { label: '计算计入金额', value: 'calcuCountMoney' },
      { label: '金额', value: 'totalMoney' },
    ]
  } else {
    tableInfo.value.fieldList = [
      { label: '单据号', value: 'docNum' },
      { label: '单据日期', value: 'docTime', formatter: (row) => moment(row.docTime).format('YYYY-MM-DD') },
      { label: '会计期间', value: 'accountingPeriodValue' },
      { label: '科室编码', value: 'deptCode' },
      { label: '科室名称', value: 'deptName' },
      { label: '成本分类', value: 'costCategoryName' },
      { label: '成本项目编码', value: 'costItemCode' },
      { label: '成本项目名称', value: 'costItemName' },
      { label: '资金来源', value: 'assetCapitalValue' },
      { label: '直接计入金额', value: 'directCountMoney' },
      { label: '计算计入金额', value: 'calcuCountMoney' },
      { label: '金额', value: 'totalMoney' },
      { label: '备注', value: 'remark' },
    ]
  }
  tableInfo.value.refresh = Math.random()
}
function reset() {
  filterInfo.value.query = {isGroup: false}
  treeInfo.value.checkedList = [];
  tableParameter.value.checkedList = [];
  costTypeInfo.checkedList = [];
  getList()
}

function detail(row) {
  detailsInfo.value.id = row.deptCostSplitRuleId
  detailsInfo.value.visible = true
}

function exportData() {
  exportCostAllocationDetail({
    ...filterInfo.value.query,
    isGroup: filterInfo.value.query.isGroup ? '1' : '0',
    type: 'all'
  }).then(res => {
    if (res) {
      proxy.$fn.parseExcel(res)
    }
  })
}
function openDeptSelector() {
  treeInfo.value.title = '科室'
  treeInfo.value.callback = treeCallback
  treeInfo.value.visible = true
}
function treeCallback(raw) {
  treeInfo.value.checkedList = raw;
  let datas = raw?.filter((it) => !it.childList)
  filterInfo.value.query.deptId = datas.map((it) => it.id)
  filterInfo.value.query.deptName = datas.map((it) => it.name)
  filterInfo.value.query.deptIdList = datas.map((it) => it.id)
}
function openCostItemSelector() {
  tableParameter.value.title = '成本项目'
  tableParameter.value.checkBox = true
  tableParameter.value.visible = true
  tableParameter.value.type = 'costItem'
  tableParameter.value.filters = [
    { type: 'input', label: '编码/名称', value: 'name' }
  ]
  tableParameter.value.callBack = costItemCallback
  pageFilterRef.value.openDialog(tableParameter.value, 'table')
}
function costItemCallback(raw) {
  tableParameter.value.checkedList = raw
  filterInfo.value.query.costItemId = raw.map((it) => it.id)
  filterInfo.value.query.costItemName = raw.map((it) => it.name).join(',')
}

function openAccountingPeriodSelector() {
  tableParameter.value.title = '会计期间'
  tableParameter.value.checkBox = false
  tableParameter.value.pager = true
  tableParameter.value.type = 'accountingPeriod'
  tableParameter.value.callBack = accountingPeriodCallback
  tableParameter.value.visible = true
  pageFilterRef.value.openDialog(tableParameter.value, 'table')
}

function accountingPeriodCallback(raw) {
  filterInfo.value.query.accountingPeriodId = raw.id
  filterInfo.value.query.accountingPeriodName = raw.periodYearAndMonth
}

const costTypeInfo = reactive({
  title: '成本分类',
  visible: false,
  checkBox: true,
  checkStrictly: false,
  isLeaf: false,
  query: {},
  checkedList: []
})

function openCostCategorySelector() {
  costTypeInfo.visible = true
}
function costCategoryCallback(raw) {
  costTypeInfo.checkedList = raw;
  let datas = raw?.filter((it) => !it.children)
  filterInfo.value.query.costCategoryId = datas?.map((it) => it.id)
  filterInfo.value.query.costCategoryIdList = datas?.map((it) => it.id)
  filterInfo.value.query.costCategoryName = datas?.map((it) => it.name)
}

</script>

<template>
  <div class="view-fill">
    <div class="layui-card layui-col-md12" v-if="!detailsInfo.visible">
      <div class="layui-card-body">
        <div class="titleTab">
          <div class="tab otherTab" @click="showDialog = false">列表页</div>
          <div class="tab currentTab">明细页</div>
        </div>
        <div>
        <!-- 条件栏 -->
        <div class="filter-wrapper">
          <NewPageFilter
              ref="pageFilterRef"
              v-model:query="filterInfo.query"
              :filter-list="filterInfo.list"
              :filter-btn="filterInfo.filterbtn"
          >
            <template #filter-accountingPeriodName>
              <el-input
                  v-model="filterInfo.query.accountingPeriodName"
                  class="not-mongolia"
                  type="input"
                  placeholder="请选择会计期间"
                  :disabled="true"
              >
                <template #append>
                  <el-icon @click="openAccountingPeriodSelector"><Search /></el-icon>
                </template>
              </el-input>
            </template>
            <template #filter-costCategoryName>
              <el-input
                  v-model="filterInfo.query.costCategoryName"
                  class="not-mongolia"
                  type="input"
                  placeholder="请选择成本分类"
                  :disabled="true"
              >
                <template #append>
                  <el-icon @click="openCostCategorySelector"><Search /></el-icon>
                </template>
              </el-input>
            </template>
            <template #filter-costItemName>
              <el-input
                  v-model="filterInfo.query.costItemName"
                  class="not-mongolia"
                  type="input"
                  placeholder="请选择成本项目"
                  :disabled="true"
              >
                <template #append>
                  <el-icon @click="openCostItemSelector"><Search /></el-icon>
                </template>
              </el-input>
            </template>
            <template #filter-deptName>
              <el-input
                  v-model="filterInfo.query.deptName"
                  class="not-mongolia"
                  type="input"
                  placeholder="请选择科室信息"
                  :disabled="true"
              >
                <template #append>
                  <el-icon @click="openDeptSelector"><Search /></el-icon>
                </template>
              </el-input>
            </template>
          </NewPageFilter>
        </div>
        <div class="filter-wrapper">
          <!-- 条件栏 -->
          <NewPageFilter :filter-btn="filterInfo.btnList">
          </NewPageFilter>
        </div>
        </div>
        <!-- 表格 -->
        <table-container
            :refresh="tableInfo.refresh"
            :init-curpage="tableInfo.initCurpage"
            v-model:data="tableInfo.data"
            :api="tableInfo.api"
            :query="filterInfo.copyQuery"
            :summary="true"
            :summaryFieldList="tableInfo.summaryFieldList"
            :tabIndex="true"
            :field-list="tableInfo.fieldList"
            :handle="tableInfo.handle"
        >
          <template #col-docNum="{ row }">
            <span class="slip-edit" @click="detail(row)">{{ row.docNum }}</span>
          </template>
        </table-container>
      </div>
    </div>
    <Details
        v-if="detailsInfo.visible"
        :id="detailsInfo.id"
        v-model:visible="detailsInfo.visible"
        @returnBack="getList"
    ></Details>
    <SelectDeptArchivesTree
        v-if="treeInfo.visible"
        v-model:showDialog="treeInfo.visible"
        :title="treeInfo.title"
        :checkStrictly="treeInfo.checkStrictly"
        :isLeaf="treeInfo.isLeaf"
        :query="treeInfo.query"
        :checkBox="treeInfo.checkBox"
        :checkedList="treeInfo.checkedList"
        :api="treeInfo.api"
        :highlight-current="true"
        @callback="treeInfo.callback" />
    <SelectCostType
        v-if="costTypeInfo.visible"
        v-model:showDialog="costTypeInfo.visible"
        :title="costTypeInfo.title"
        :checkStrictly="costTypeInfo.checkStrictly"
        :isLeaf="costTypeInfo.isLeaf"
        :checkedList="costTypeInfo.checkedList"
        :query="costTypeInfo.query"
        :checkBox="costTypeInfo.checkBox"
        @callback="costCategoryCallback"
    />
  </div>
</template>

<style scoped lang="scss">

</style>
