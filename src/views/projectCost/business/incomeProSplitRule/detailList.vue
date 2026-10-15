<script setup>
import Details from './details.vue'
import {onMounted} from "vue";
import {ItemIncomeSplitRuledetailexport, ItemIncomeSplitRuleDetailpage} from "@/api/projectCost/incomeProSplitRule";
const {proxy} = getCurrentInstance()
const emit = defineEmits()
const PERMISSION_CODE = 'incomeProSplitRule'
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
})

const filterInfo = ref({
  query: {
  },
  listType: {
    splitList: [
      { key: '按总额拆分', value: 1 },
      { key: '按收费分类拆分', value: 2 },
      { key: '按收费项目拆分', value: 3 },
    ]
  },
  list: [
    { label: '核算期间', value: 'accountingPeriodName', showLabel: true, type: 'slot' },
    { label: '源科室', value: 'sourceDeptName', showLabel: true, type: 'slot' },
    { label: '承担科室', value: 'deptName', showLabel: true, type: 'slot' },
    { label: '拆分方法', value: 'splitMethod', type: 'select', list: 'splitList' },
    { label: '收费类别', value: 'feeCategoryName', showLabel: true, type: 'slot' },
    { label: '收费项目', value: 'feeItemName', showLabel: true, type: 'slot' },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', event: reset, },
  ],
  btnList: [
    { type: 'button', label: '导出Excel', show: proxy.$permission(`${PERMISSION_CODE}:modexport`), event: exportData },
  ]
})
const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  api: null,
  fieldList: [
    { label: '核算期间', value: 'accountingPeriodName' },
    { label: '源科室编码', value: 'sourceDeptCode' },
    { label: '源科室名称', value: 'sourceDeptName' },
    { label: '拆分方法', value: 'splitMethodName' },
    { label: '备注', value: 'remark' },
    { label: '收费类别编码', value: 'feeCategoryCode' },
    { label: '收费类别名称', value: 'feeCategoryName' },
    { label: '收费项目编码', value: 'feeItemCode' },
    { label: '收费项目名称', value: 'feeItemName' },
    { label: '承担科室编码', value: 'deptCode' },
    { label: '承担科室名称', value: 'deptName' },
    { label: '参数值来源', value: 'paramSourceName' },
    { label: '参数', value: 'apportionmentParamName' },
    { label: '参数值', value: 'paramValue', align: 'center' },
  ],
  summaryFieldList: [
    { value: 'paramValue', formatter: proxy.$fn.TripartiteMethod },
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
  title: '收费项目',
  checkBox: false,
  pager: false,
  callback: null,
  filters: [],
  fieldList: [],
  query: {
    last: true,
  },
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
  tableInfo.value.api = ItemIncomeSplitRuleDetailpage
  getList()
})

function getList() {
  const times = (filterInfo.value.query.docTime || ',').split(',')
  filterInfo.value.copyQuery = {
    ...filterInfo.value.query,
    startDocTime: times[0],
    endDocTime: times[1],
    docTime: undefined
  }
  tableInfo.value.refresh = Math.random()
}
function reset() {
  filterInfo.value.query = {}
  getList()
}

function detail(row) {
  detailsInfo.value.id = row.deptCostSplitRuleId
  detailsInfo.value.visible = true
}

function exportData() {
  ItemIncomeSplitRuledetailexport({
    ...filterInfo.value.query,
    // type: 'all'
  }).then(res => {
    if (res) {
      proxy.$fn.parseExcel(res)
    }
  })
}
function openDeptSelector(target) {
  treeInfo.value.type = target
  treeInfo.value.title = target === 'source' ? '源科室' : '承担科室'
  treeInfo.value.checkedList = target === 'source' ? spurceDept.value : bearDept.value
  treeInfo.value.callback = treeCallback
  treeInfo.value.visible = true
}
function treeCallback(raw) {
  const datas = raw?.filter((it) => !it.childList)
  if (treeInfo.value.type === 'source') {
    spurceDept.value = raw;
    filterInfo.value.query.sourceDeptName = datas.map((it) => it.name).join(',')
    filterInfo.value.query.sourceDeptList = datas.map((it) => it.id)
  } else {
    bearDept.value = raw;
    filterInfo.value.query.deptName = datas.map((it) => it.name).join(',')
    filterInfo.value.query.deptIds = datas.map((it) => it.id)
  }
}
function openCostTypeSelector() {
  tableParameter.value.title = '收费类别'
  tableParameter.value.visible = true
  tableParameter.value.type = 'feeCategory'
  tableParameter.value.pager = false
  tableParameter.value.checkBox = true
  tableParameter.value.checkedList = chargeType.value
  tableParameter.value.callBack = (raw) => {
    chargeType.value = raw;
    filterInfo.value.query.feeCategoryList = raw.map((it) => it.id)
    filterInfo.value.query.feeCategoryName = raw.map((it) => it.name).join(',')
  }
  pageFilterRef.value.openDialog(tableParameter.value, 'table')
}
function openCostItemSelector() {
  tableParameter.value.title = '收费项目'
  tableParameter.value.visible = true
  tableParameter.value.type = 'feeItem'
  tableParameter.value.pager = true
  tableParameter.value.checkBox = true
  tableParameter.value.checkedList = chargePro.value
  tableParameter.value.filters = [
    { type: 'input', label: '编码/名称', value: 'keyword' }
  ]
  tableParameter.value.query = { status: 1, accountingStatus: '1', feeCategoryId: filterInfo.value.data?.feeCategoryId }
  tableParameter.value.callBack = costItemCallback
  pageFilterRef.value.openDialog(tableParameter.value, 'table')
}
function costItemCallback(raw) {
  chargePro.value = raw;
  filterInfo.value.query.feeItemList = raw.map((it) => it.id)
  filterInfo.value.query.feeItemName = raw.map((it) => it.name).join(',')
}

function openAccountingPeriodSelector() {
  tableParameter.value.title = '核算期间'
  tableParameter.value.checkBox = false
  tableParameter.value.pager = true
  tableParameter.value.type = 'itemaccountingPeriod'
  tableParameter.value.callBack = accountingPeriodCallback
  tableParameter.value.visible = true
  pageFilterRef.value.openDialog(tableParameter.value, 'table')
}

function accountingPeriodCallback(raw) {
  filterInfo.value.query.accountingPeriodId = raw.id
  filterInfo.value.query.accountingPeriodName = raw.name
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
              :listTypeInfo="filterInfo.listType"
              :filter-btn="filterInfo.filterbtn"
          >
            <template #filter-accountingPeriodName>
              <el-input
                  v-model="filterInfo.query.accountingPeriodName"
                  class="not-mongolia"
                  type="input"
                  placeholder="请选择核算期间"
                  :disabled="true"
              >
                <template #append>
                  <el-icon @click="openAccountingPeriodSelector"><Search /></el-icon>
                </template>
              </el-input>
            </template>
            <template #filter-feeCategoryName>
              <el-input
                  v-model="filterInfo.query.feeCategoryName"
                  class="not-mongolia"
                  type="input"
                  placeholder="请选择收费类别"
                  :disabled="true"
              >
                <template #append>
                  <el-icon @click="openCostTypeSelector"><Search /></el-icon>
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
                  <el-icon @click="openCostItemSelector"><Search /></el-icon>
                </template>
              </el-input>
            </template>
            <template #filter-sourceDeptName>
              <el-input
                  v-model="filterInfo.query.sourceDeptName"
                  class="not-mongolia"
                  type="input"
                  placeholder="请选择源科室"
                  :disabled="true"
              >
                <template #append>
                  <el-icon @click="openDeptSelector('source')"><Search /></el-icon>
                </template>
              </el-input>
            </template>
            <template #filter-deptName>
              <el-input
                  v-model="filterInfo.query.deptName"
                  class="not-mongolia"
                  type="input"
                  placeholder="请选择承担科室"
                  :disabled="true"
              >
                <template #append>
                  <el-icon @click="openDeptSelector('target')"><Search /></el-icon>
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
            :checkBox="false"
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
  </div>
</template>

<style scoped lang="scss">

</style>
