<script setup>
import Details from './details.vue'
import {onMounted} from "vue";
import moment from "moment";
import {exportIncomeDataDetailQuery, pageIncomeDataDetailQuery} from "@/api/incomeData";
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
    { label: '会计期间', value: 'accountingPeriod', showLabel: true, type: 'slot' },
    { label: '业务开始日期', value: 'businessTimeStart', type: 'date', valueFormat: 'YYYY-MM-DD' },
    { label: '业务结束日期', value: 'businessTimeEnd', type: 'date', valueFormat: 'YYYY-MM-DD' },
    { label: '单据号', value: 'docNum', type: 'input' },
    { label: '收费类别', value: 'feeCategoryName', showLabel: true, type: 'slot' },
    { label: '收费项目', value: 'feeItemName', showLabel: true, type: 'slot' },
    { label: '开单科室', value: 'orderDeptName', showLabel: true, type: 'slot' },
    { label: '执行科室', value: 'executeDeptName', showLabel: true, type: 'slot' },
    { label: '汇总显示', value: 'isGroup', type: 'checkbox' },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', event: reset, },
  ],
  btnList: [
    { type: 'button', label: '导出Excel', show: proxy.$permission('costData:export'), event: exportData },
  ]
})
const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  api: null,
  fieldList: [
    { label: '单据号', value: 'docNum' },
    { label: '业务日期', value: 'docTimeDate', formatter: (row) => moment(row.docTimeDate).format('YYYY-MM-DD') },
    { label: '会计期间', value: 'accountingPeriod' },
    { label: '收费类别编码', value: 'feeCategoryCode' },
    { label: '收费类别名称', value: 'feeCategoryName' },
    { label: '收费项目编码', value: 'feeItemCode' },
    { label: '收费项目名称', value: 'feeItemName' },
    { label: '开单科室编码', value: 'orderDeptCode' },
    { label: '开单科室名称', value: 'orderDeptName' },
    { label: '执行科室编码', value: 'executeDeptCode' },
    { label: '执行科室名称', value: 'executeDeptName' },
    { label: '数量', value: 'qty', align: 'center' },
    { label: '单价', value: 'unitPrice', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.unitPrice) },
    { label: '金额', value: 'money', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.money) },
    { label: '备注', value: 'remark' },
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

const spurceDept = ref([])
const bearDept = ref([])
const chargeType = ref([])
const chargePro = ref([])
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
  tableInfo.value.api = pageIncomeDataDetailQuery
  getList()
})

function getList() {
  filterInfo.value.copyQuery = {
    ...filterInfo.value.query,
    isGroup: filterInfo.value.query.isGroup ? '1' : '0',
  }
  if(filterInfo.value.query.isGroup) {
    tableInfo.value.fieldList = [
      { label: '会计期间', value: 'accountingPeriod' },
      { label: '收费类别编码', value: 'feeCategoryCode' },
      { label: '收费类别名称', value: 'feeCategoryName' },
      { label: '开单科室编码', value: 'orderDeptCode' },
      { label: '开单科室名称', value: 'orderDeptName' },
      { label: '执行科室编码', value: 'executeDeptCode' },
      { label: '执行科室名称', value: 'executeDeptName' },
      { label: '数量', value: 'qty' },
      { label: '金额', value: 'money' },
    ]
  } else {
    tableInfo.value.fieldList = [
      { label: '单据号', value: 'docNum' },
      { label: '业务日期', value: 'docTimeDate', formatter: (row) => moment(row.docTimeDate).format('YYYY-MM-DD') },
      { label: '会计期间', value: 'accountingPeriod' },
      { label: '收费类别编码', value: 'feeCategoryCode' },
      { label: '收费类别名称', value: 'feeCategoryName' },
      { label: '收费项目编码', value: 'feeItemCode' },
      { label: '收费项目名称', value: 'feeItemName' },
      { label: '开单科室编码', value: 'orderDeptCode' },
      { label: '开单科室名称', value: 'orderDeptName' },
      { label: '执行科室编码', value: 'executeDeptCode' },
      { label: '执行科室名称', value: 'executeDeptName' },
      { label: '数量', value: 'qty' },
      { label: '单价', value: 'unitPrice' },
      { label: '金额', value: 'money' },
      { label: '备注', value: 'remark' },
    ]
  }
  tableInfo.value.refresh = Math.random()
}
function reset() {
  filterInfo.value.query = {isGroup: false}
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
  filterInfo.value.query.accountingPeriod = raw.periodYearAndMonth
  // filterInfo.value.query.period = raw.periodYearAndMonth
}

function openFeeCategorySelector() {
  tableParameter.value.title = '收费类别'
  tableParameter.value.visible = true
  tableParameter.value.checkBox = true
  tableParameter.value.pager = true
  tableParameter.value.type = 'feeCategory'
  tableParameter.value.checkedList = chargeType.value
  tableParameter.value.query = { status: 1 }
  tableParameter.value.callBack = feeCategoryCallback
  pageFilterRef.value.openDialog(tableParameter.value, 'table')
}

function feeCategoryCallback(raw) {
  chargeType.value = raw;
  filterInfo.value.query.feeCategoryIdList = raw.map((it) => it.id)
  filterInfo.value.query.feeCategoryName = raw.map((it) => it.name).join(',')
}

function openFeeItemSelector() {
  tableParameter.value.title = '收费项目'
  tableParameter.value.visible = true
  tableParameter.value.checkBox = true
  tableParameter.value.pager = true
  tableParameter.value.filters = [
    { type: 'input', label: '编码/名称', value: 'keyword' }
  ]
  tableParameter.value.checkedList = chargePro.value
  tableParameter.value.type = 'feeItem'
  tableParameter.value.query = { status: 1, feeCategoryId: filterInfo.value.data?.feeCategoryId }
  tableParameter.value.callBack = feeItemCallback
  pageFilterRef.value.openDialog(tableParameter.value, 'table')
}
function feeItemCallback(raw) {
  chargePro.value = raw;
  filterInfo.value.query.chargeItemIdList = raw.map((it) => it.id)
  filterInfo.value.query.feeItemName = raw.map((it) => it.name).join(',')
}

function exportData() {
  exportIncomeDataDetailQuery(filterInfo.value.copyQuery).then(res => {
    if (res) {
      proxy.$fn.parseExcel(res)
    }
  })
}
function openDeptSelector(target) {
  treeInfo.value.title = target === 'order' ? '开单科室' : '执行科室'
  treeInfo.value.target = target
  treeInfo.value.checkedList = target === 'order' ? spurceDept.value : bearDept.value
  treeInfo.value.visible = true
}
function treeCallback(raw) {
  const datas = raw?.filter((it) => !it.childList)
  if (treeInfo.value.target === 'order') {
    spurceDept.value = raw;
    filterInfo.value.query.orderDeptId = datas?.map((it) => it.id);
    filterInfo.value.query.orderDeptName = datas?.map((it) => it.name);
    filterInfo.value.query.orderDeptIdList = datas?.map((it) => it.id);
  } else {
    bearDept.value = raw;
    filterInfo.value.query.executeDeptId = datas?.map((it) => it.id);
    filterInfo.value.query.executeDeptName = datas?.map((it) => it.name);
    filterInfo.value.query.executeDeptIdList = datas?.map((it) => it.id);
  }
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
            <template #filter-feeCategoryName>
              <el-input
                  v-model="filterInfo.query.feeCategoryName"
                  class="not-mongolia"
                  type="input"
                  placeholder="请选择收费类别"
                  :disabled="true"
              >
                <template #append>
                  <el-icon @click="openFeeCategorySelector"><Search /></el-icon>
                </template>
              </el-input>
            </template>
            <template #filter-feeItemName>
              <el-input
                  v-model="filterInfo.query.feeItemName"
                  class="not-mongolia"
                  type="input"
                  placeholder="请选择收费项目"
                  :disabled="true"
              >
                <template #append>
                  <el-icon @click="openFeeItemSelector"><Search /></el-icon>
                </template>
              </el-input>
            </template>
            <template #filter-accountingPeriod>
              <el-input
                  v-model="filterInfo.query.accountingPeriod"
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
            <template #filter-orderDeptName>
              <el-input
                  v-model="filterInfo.query.orderDeptName"
                  class="not-mongolia"
                  type="input"
                  placeholder="请选择开单科室"
                  :disabled="true"
              >
                <template #append>
                  <el-icon @click="openDeptSelector('order')"><Search /></el-icon>
                </template>
              </el-input>
            </template>
            <template #filter-executeDeptName>
              <el-input
                  v-model="filterInfo.query.executeDeptName"
                  class="not-mongolia"
                  type="input"
                  placeholder="请选择执行科室"
                  :disabled="true"
              >
                <template #append>
                  <el-icon @click="openDeptSelector('')"><Search /></el-icon>
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
