<script setup>
import Details from './details.vue'
import {onMounted} from "vue";
import {deptOtherCostDetailexportExcelDetail, deptOtherCostDetailpage} from "@/api/deptCost/costData/busOtherCost";
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
  data: {
  },
  list: [
    { label: '会计期间', value: 'periodName', showLabel: true, type: 'slot' },
    { label: '科室名称', value: 'deptName', showLabel: true, type: 'slot' },
    { label: '成本项目', value: 'costItemName', showLabel: true, type: 'slot' },
    { label: '资金来源', value: 'fundSource', type: 'select-model', multiple: true, code: 'asset_capital_source' },
    { label: '汇总显示', value: 'isGroup', type: 'checkbox' },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', event: reset, },
  ],
  btnList: [
    { type: 'button', label: '导出Excel', show: proxy.$permission('busOtherCost:detailexport'), event: exportData },
  ]
})
const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  api: null,
  fieldList: [
    { label: '单据号', value: 'docNum' },
    { label: '会计期间', value: 'periodName' },
    { label: '科室编码', value: 'deptCode' },
    { label: '科室名称', value: 'deptName' },
    { label: '成本项目编码', value: 'costItemCode' },
    { label: '成本项目名称', value: 'costItemName' },
    { label: '资金来源', value: 'fundSourceName' },
    { label: '金额', value: 'money', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.money) },
  ],
  summaryFieldList: [
    { value: 'money', formatter: proxy.$fn.TripartiteMethod },
  ],
  data: [],
  handle: null,
})
const detailsInfo = ref({
  visible: false,
})
const treeInfo = ref({
  title: '核算科室',
  visible: false,
  checkBox: true,
  checkStrictly: false,
  isLeaf: false,
  query: {},
  checkedList: [],
})
const tableParameter = ref({
  visible: false,
  type: '',
  title: '成本项目',
  checkBox: false,
  pager: false,
  callback: null,
  filters: [],
  fieldList: [],
  query: {},
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
  tableInfo.value.api = deptOtherCostDetailpage
  getList()
})

function getList() {
  filterInfo.value.copyQuery = {
    ...filterInfo.value.query,
    isGroup: filterInfo.value.query.isGroup ? '1' : '0',
    fundSourceList: filterInfo.value.query.fundSource ? filterInfo.value.query.fundSource.split(',') : []
  }
  delete filterInfo.value.copyQuery.fundSource
  if(filterInfo.value.query.isGroup) {
    tableInfo.value.fieldList = [
      { label: '会计期间', value: 'periodName' },
      { label: '科室编码', value: 'deptCode' },
      { label: '科室名称', value: 'deptName' },
      { label: '成本分类编码', value: 'costCategoryCode' },
      { label: '成本分类名称', value: 'costCategoryName' },
      { label: '资金来源', value: 'fundSourceName' },
      { label: '金额', value: 'money', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.money) },
    ]
  } else {
    tableInfo.value.fieldList = [
      { label: '单据号', value: 'docNum' },
      { label: '会计期间', value: 'periodName' },
      { label: '科室编码', value: 'deptCode' },
      { label: '科室名称', value: 'deptName' },
      { label: '成本项目编码', value: 'costItemCode' },
      { label: '成本项目名称', value: 'costItemName' },
      { label: '资金来源', value: 'fundSourceName' },
      { label: '金额', value: 'money', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.money) },
      { label: '备注', value: 'remark' },
    ]
  }
  tableInfo.value.refresh = Math.random()
}
function reset() {
  filterInfo.value.query = {
    isGroup: false
  }
  getList()
}

function detail(row) {
  detailsInfo.value.id = row.deptIncomeId
  detailsInfo.value.visible = true
}

function openAccountingPeriodSelector() {
  tableParameter.value.title = '会计期间'
  tableParameter.value.checkBox = false
  tableParameter.value.pager = true
  tableParameter.value.query.sort = 'begin_date desc'
  tableParameter.value.type = 'accountingPeriod'
  tableParameter.value.filters = []
  tableParameter.value.callBack = accountingPeriodCallback
  tableParameter.value.visible = true
  pageFilterRef.value.openDialog(tableParameter.value, 'table')
}

function accountingPeriodCallback(raw) {
  filterInfo.value.query.periodId = raw.id
  filterInfo.value.query.periodName = raw.periodYearAndMonth
}

function openProjectSelector() {
  tableParameter.value.title = '成本项目'
  tableParameter.value.visible = true
  tableParameter.value.checkBox = true
  tableParameter.value.pager = true
  tableParameter.value.type = 'costItem'
  tableParameter.value.query = {
    last: true,
  }
  tableParameter.filters = [
    { type: 'input', label: '编码/名称', value: 'name' }
  ]
  tableParameter.value.callBack = assetsCallback
  pageFilterRef.value.openDialog(tableParameter.value, 'table')
}
function assetsCallback(raw) {
  tableParameter.value.checkedList = raw
  filterInfo.value.query.costItemIdList = raw.map((it) => it.id)
  filterInfo.value.query.costItemCode = raw.map((it) => it.code)
  filterInfo.value.query.costItemName = raw.map((it) => it.name).join(',')
}

function exportData() {
  deptOtherCostDetailexportExcelDetail({
    ...filterInfo.value.query,
    isGroup: filterInfo.value.query.isGroup ? '1' : '0'
  }).then(res => {
    if (res) {
      proxy.$fn.parseExcel(res)
    }
  })
}
function openDeptSelector() {
  treeInfo.value.visible = true
}
function treeCallback(raw) {
  treeInfo.value.checkedList = raw
  const datas = raw?.filter((it) => !it.childList)
  filterInfo.value.query.deptId = datas?.map((it) => it.id);
  filterInfo.value.query.deptName = datas?.map((it) => it.name);
  filterInfo.value.query.deptIdList = datas?.map((it) => it.id);
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
            <template #filter-periodName>
              <el-input
                  v-model="filterInfo.query.periodName"
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
            <template #filter-deptName>
              <el-input
                  v-model="filterInfo.query.deptName"
                  class="not-mongolia"
                  type="input"
                  placeholder="请选择科室名称"
                  :disabled="true"
              >
                <template #append>
                  <el-icon @click="openDeptSelector"><Search /></el-icon>
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
                  <el-icon @click="openProjectSelector"><Search /></el-icon>
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
            :check-box="false"
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
        @callback="treeCallback" />
  </div>
</template>

<style scoped lang="scss">

</style>
