<script setup>
import Details from './details.vue'
import {onMounted} from "vue";
import {deptDrugCostDetailexportExcelDetail, deptDrugCostDetailpage} from "@/api/deptCost/costData/drugData";
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
    { label: '会计期间', value: 'period', showLabel: true, type: 'slot' },
    // { label: '科室名称', value: 'deptName', showLabel: true, type: 'slot' },
    { label: '药品分类', value: 'drugFinCategoryName', showLabel: true, type: 'slot' },
    { label: '药品字典', value: 'drugName', showLabel: true, type: 'slot' },
    { label: '资金来源', value: 'fundSource', type: 'select-model', multiple: true, code: 'asset_capital_source' },
    { label: '是否收费', value: 'isCharge', type: 'select-model', code: 'yes_or_no' },
    { label: '汇总显示', value: 'isGroup', type: 'checkbox' },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', event: reset, },
  ],
  btnList: [
    { type: 'button', label: '导出Excel', show: proxy.$permission('drugData:detailexport'), event: exportData },
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
    { label: '药品编码', value: 'drugCode' },
    { label: '药品名称', value: 'drugName' },
    { label: '药品分类编码', value: 'drugFinCategoryCode' },
    { label: '药品分类名称', value: 'drugFinCategoryName' },
    { label: '资金来源', value: 'fundSourceName' },
    { label: '是否收费', value: 'isChargeName' },
    { label: '数量', value: 'qty', align: 'center' },
    { label: '单价', value: 'unitPrice', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.unitPrice) },
    { label: '金额', value: 'money', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.money) },
  ],
  summaryFieldList: [
    { value: 'qty', formatter: proxy.$fn.TripartiteMethod },
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
  query: {}
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
  tableInfo.value.api = deptDrugCostDetailpage
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
      { label: '药品分类编码', value: 'drugFinCategoryCode' },
      { label: '药品分类名称', value: 'drugFinCategoryName' },
      { label: '资金来源', value: 'fundSourceName' },
      { label: '金额', value: 'money', align: 'right', },
    ]
  } else {
    tableInfo.value.fieldList = [
      { label: '单据号', value: 'docNum' },
      { label: '会计期间', value: 'periodName' },
      { label: '科室编码', value: 'deptCode' },
      { label: '科室名称', value: 'deptName' },
      { label: '药品编码', value: 'drugCode' },
      { label: '药品名称', value: 'drugName' },
      { label: '药品分类编码', value: 'drugFinCategoryCode' },
      { label: '药品分类名称', value: 'drugFinCategoryName' },
      { label: '资金来源', value: 'fundSourceName' },
      { label: '是否收费', value: 'isChargeName' },
      { label: '数量', value: 'qty', align: 'center', },
      { label: '单价', value: 'unitPrice', align: 'right', },
      { label: '金额', value: 'money', align: 'right', },
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
  filterInfo.value.query.accountingPeriodId = raw.id
  filterInfo.value.query.periodId = raw.id
  filterInfo.value.query.accountingPeriod = raw.periodYearAndMonth
  filterInfo.value.query.period = raw.periodYearAndMonth
}

const assetsInfo = ref({
  title: '药品分类',
  visible: false,
  checkBox: true,
  checkStrictly: false,
  isLeaf: false,
  query: {},
  checkedList: [],
})
function opendrugTypeSelector() {
  assetsInfo.value.visible = true
}
function treeassetsCallback(raw) {
  assetsInfo.value.checkedList = raw;
  const datas = raw?.filter(it => !it.childList)
  filterInfo.value.query.drugFinCategoryId = datas.map(it => it.id)
  filterInfo.value.query.drugFinCategoryIdList = datas.map(it => it.id)
  filterInfo.value.query.drugFinCategoryName = datas.map(it => it.name)
}
function openassetsSelector() {
  tableParameter.value.title = '药品信息'
  tableParameter.value.visible = true
  tableParameter.value.checkBox = false
  tableParameter.value.pager = true
  tableParameter.value.type = 'drugItem'
  tableParameter.value.query = { status: 1, drugFinCategoryIdList: filterInfo.value.query?.drugFinCategoryIdList }
  tableParameter.value.callBack = assetsCallback
  pageFilterRef.value.openDialog(tableParameter.value, 'table')
}
function assetsCallback(raw) {
  filterInfo.value.query.drugId = raw.id
  filterInfo.value.query.drugCode = raw.code
  filterInfo.value.query.drugName = raw.name
}

function exportData() {
  deptDrugCostDetailexportExcelDetail({
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
            <template #filter-period>
              <el-input
                  v-model="filterInfo.query.period"
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
            <template #filter-drugFinCategoryName>
              <el-input
                  v-model="filterInfo.query.drugFinCategoryName"
                  class="not-mongolia"
                  type="input"
                  placeholder="请选择药品分类"
                  :disabled="true"
              >
                <template #append>
                  <el-icon @click="opendrugTypeSelector"><Search /></el-icon>
                </template>
              </el-input>
            </template>
            <template #filter-drugName>
              <el-input
                  v-model="filterInfo.query.drugName"
                  class="not-mongolia"
                  type="input"
                  placeholder="请选择药品卡片"
                  :disabled="true"
              >
                <template #append>
                  <el-icon @click="openassetsSelector"><Search /></el-icon>
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

    <SelectDrugTree
        v-if="assetsInfo.visible"
        v-model:showDialog="assetsInfo.visible"
        :title="assetsInfo.title"
        :checkStrictly="assetsInfo.checkStrictly"
        :isLeaf="assetsInfo.isLeaf"
        :query="assetsInfo.query"
        :checkBox="assetsInfo.checkBox"
        :checkedList="assetsInfo.checkedList"
        :api="assetsInfo.api"
        :highlight-current="true"
        @callback="treeassetsCallback" />
  </div>
</template>

<style scoped lang="scss">

</style>
