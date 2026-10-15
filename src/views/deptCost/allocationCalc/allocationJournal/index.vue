<!-- 分摊流水账 -->
<script setup name="allocationJournal">
import {onMounted} from "vue";
import moment from "moment";
import {useStorage} from "@vueuse/core";
import {costAccountqueryList, costAccountexportCostAccount} from "@/api/allocationJournal";
import {periodMonthByDate} from "@/api/base";
const {proxy} = getCurrentInstance()
const setting = useStorage('setting', {}, sessionStorage)
const filterInfo = ref({
  query: {
    orgId: setting.value.hospitalId,
  },
  list: [
    { label: '会计期间', value: 'periodName', showLabel: true, type: 'slot' },
    { label: '源科室', value: 'sourceName', showLabel: true, type: 'slot' },
    { label: '科室', value: 'deptName', showLabel: true, type: 'slot' },
    { label: '成本分类', value: 'costCategoryName', showLabel: true, type: 'slot' },
    { label: '成本项目', value: 'costItemName', showLabel: true, type: 'slot' },
    { label: '资金来源', value: 'fundsource', type: 'select-model', multiple: true, code: 'asset_capital_source' },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', event: clearSearch, },
  ],
  btnList: [
    {
      label: '导出Excel',
      btType: 'primary',
      show: proxy.$permission('allocationJournal:exportExcel'),
      event: showExportExcel,
      type: 'button',
    },
  ]
})
const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  api: null,
  fieldList: [
    { label: '源科室编码', value: 'sourceDeptCode' },
    { label: '源科室名称', value: 'sourceDeptName' },
    { label: '源科室核算属性', value: 'sourceDeptAtrName' },
    { label: '科室编码', value: 'deptCode' },
    { label: '科室名称', value: 'deptName' },
    { label: '目的核算属性', value: 'deptAtrName' },
    { label: '成本分类', value: 'costCategoryName' },
    { label: '成本项目编码', value: 'costItemCode' },
    { label: '成本项目名称', value: 'costItemName' },
    { label: '资金来源', value: 'fundsourceName' },
    { label: '是否直接成本', value: 'isDirectName' },
    { label: '是否分摊成本', value: 'isSpreadName' },
    { label: '分摊参数', value: 'paramName' },
    { label: '分摊参数值', value: 'spreadValue', align: 'center' },
    { label: '总参数值', value: 'spreadTotalValue', align: 'center' },
    { label: '原科室成本', value: 'costMoney', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.costMoney) },
    { label: '分摊成本', value: 'spreadCostMoney', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.spreadCostMoney) },
  ],
  summaryFieldList: [
    { value: 'costMoney', formatter: proxy.$fn.TripartiteMethod },
    { value: 'spreadCostMoney', formatter: proxy.$fn.TripartiteMethod },
  ],
  data: [],
  sectionRows: []
})

const filterRef = ref()
const tableParameter = ref({
  visible: false,
  type: '',
  title: '会计期间',
  checkBox: false,
  pager: false,
  callback: null,
  filters: [],
  fieldList: [],
  query: {}
})

onMounted(() => {
  tableInfo.value.api = costAccountqueryList
  updatePeriodMonth()
})


const updatePeriodMonth = () => {
  periodMonthByDate({ beginDate: moment(new Date()).format('YYYY-MM-DD 00:00:00') }).then(({ data }) => {
    const _data = data ? data[0] : {}
    filterInfo.value.query.periodId = _data?.id
    filterInfo.value.query.periodName = _data?.periodYearAndMonth
    getList()
  })
}
function getList() {
  filterInfo.value.copyQuery = {
    ...filterInfo.value.query,
    fundSourceCodeList: filterInfo.value.query.fundsource ? filterInfo.value.query.fundsource.split(',') : []
  }
  if(!filterInfo.value.copyQuery.periodId) return proxy.$message.warning('请选择会计期间')
  tableInfo.value.refresh = Math.random()
}
function clearSearch() {
  filterInfo.value.query = {
    orgId: setting.value.hospitalId
  }
  updatePeriodMonth()
}
const tableHandler = (eventName, raw) => {
  if (eventName === 'tableCheck') {
    tableInfo.value.sectionRows = raw
  }
}

function showExportExcel() {
  costAccountexportCostAccount(filterInfo.value.query).then((resp) => {
    if (resp) {
      proxy.$fn.parseExcel(resp)
    }
  })
}



function openAccountingPeriodSelector() {
  tableParameter.value.title = '会计期间'
  tableParameter.value.checkBox = false
  tableParameter.value.pager = true
  tableParameter.value.type = 'accountingPeriod'
  tableParameter.value.callBack = accountingPeriodCallback
  tableParameter.value.visible = true
  filterRef.value.openDialog(tableParameter.value, 'table')
}

function accountingPeriodCallback(raw) {
  filterInfo.value.query.periodId = raw.id
  filterInfo.value.query.periodName = raw.periodYearAndMonth
}

const spurceDept = ref([])
const bearDept = ref([])
// 系统科室
const treeInfo = ref({
  title: '源科室',
  visible: false,
  checkBox: true,
  checkStrictly: false,
  isLeaf: false,
  api: null,
  query: {},
  checkedList: []
})

// Source源科室
function openSourceDeptSelector() {
  treeInfo.value.title = "源科室";
  treeInfo.value.visible = true;
  treeInfo.value.checkedList = spurceDept.value;
}
// 科室
function openDeptSelector() {
  treeInfo.value.title = "科室";
  treeInfo.value.visible = true;
  treeInfo.value.checkedList = bearDept.value;
}


function treeCallback(raw) {
  let datas = raw?.filter((it) => !it.childList)
  treeInfo.value.visible = false
  if(treeInfo.value.title === '源科室') {
    spurceDept.value = raw;
    filterInfo.value.query.sourceName = datas?.map((it) => it.name);
    filterInfo.value.query.sourceIdList = datas?.map((it) => it.id);
  } else {
    bearDept.value = raw;
    filterInfo.value.query.deptName = datas?.map((it) => it.name);
    filterInfo.value.query.deptIdList = datas?.map((it) => it.id);
  }
}

/**
 * 查询成本项目
 */
const selectCostProject = ref({
  title: '成本项目',
  visible: false,
  saveEmpty: true,
  type: 'costItem',
  query: {status: '1',last: true },
  checkBox: true,
  checkedKey: {},
  checkedList: [],
  callBack: callBackName,
})

function openparentList() {
  selectCostProject.value.visible = true
  filterRef.value.openDialog(selectCostProject.value, 'table')
}
function callBackName(data) {
  filterInfo.value.query.costItemName = data.map((it) => it.name).join(',');
  filterInfo.value.query.costItemIdList = data.map((it) => it.id);
  selectCostProject.value.checkedList = data
  selectCostProject.value.visible = false
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
  filterInfo.value.query.costCategoryIdList = datas?.map((it) => it.id)
  filterInfo.value.query.costCategoryName = datas?.map((it) => it.name)
}


</script>

<template>
  <div class="app-container">
    <div class="layui-card layui-col-md12">
      <div class="layui-card-body">
        <!-- 条件栏 -->
        <div class="filter-wrapper">
          <NewPageFilter
              ref="filterRef"
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
            <template #filter-sourceName>
              <el-input
                  v-model="filterInfo.query.sourceName"
                  class="not-mongolia"
                  type="input"
                  placeholder="请选择源科室"
                  :disabled="true"
              >
                <template #append>
                  <el-icon @click="openSourceDeptSelector"><Search /></el-icon>
                </template>
              </el-input>
            </template>
            <template #filter-deptName>
              <el-input
                  v-model="filterInfo.query.deptName"
                  class="not-mongolia"
                  type="input"
                  placeholder="请选择科室"
                  :disabled="true"
              >
                <template #append>
                  <el-icon @click="openDeptSelector"><Search /></el-icon>
                </template>
              </el-input>
            </template>
            <template #filter-costItemName>
              <el-input
                  class="not-mongolia"
                  type="input"
                  :disabled="true"
                  placeholder="请选择成本项目"
                  v-model="filterInfo.query.costItemName"
              >
                <template #append>
                  <el-icon @click="openparentList"><Search /></el-icon>
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
            @handleEvent="tableHandler"
        >
        </table-container>
      </div>
    </div>
    <!--    查询核算科室-->
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
