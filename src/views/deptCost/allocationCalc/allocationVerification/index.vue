<!-- 分摊验证 -->
<script setup name="allocationVerification">
import {onMounted} from "vue";
import {sectiontree} from "@/api/accountingDepartment";
import {costAccountqueryVerify,costAccountexportVerify} from "@/api/allocationJournal";
const {proxy} = getCurrentInstance()
import {useStorage} from "@vueuse/core";
import {getToDay} from "@/utils/slp";
import moment from "moment";
import {periodMonthByDate} from "@/api/base";
const setting = useStorage('setting', {}, sessionStorage)
const filterInfo = ref({
  query: {
    orgId: setting.value.hospitalId,
  },
  list: [
    { label: '科室信息', value: 'deptName', showLabel: true, type: 'slot' },
    { label: '会计期间', value: 'periodName', showLabel: true, type: 'slot' },
    { label: '级次', value: 'levelName', showLabel: true, type: 'slot' },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: search, },
    { type: 'button', label: '重置', event: clearSearch, },
  ],
  btnList: [
    {
      label: '导出Excel',
      btType: 'primary',
      show: proxy.$permission('allocationVerification:exportExcel'),
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
    { label: '会计期间', value: 'periodName' },
    { label: '分摊级次', value: 'levelName' },
    { label: '核算属性', value: 'deptAtrName' },
    { label: '科室编码', value: 'deptCode' },
    { label: '科室名称', value: 'deptName' },
    { label: '直接成本', value: 'directCostMoney', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.directCostMoney) },
    { label: '分摊接受成本', value: 'receiveCostMoney', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.receiveCostMoney) },
    { label: '全成本', value: 'allCostMoney', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.allCostMoney) },
    { label: '分摊成本', value: 'spreadCostMoney', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.spreadCostMoney) },
    { label: '差额', value: 'balance', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.balance) },
  ],
  summaryFieldList: [
    { value: 'directCostMoney', formatter: proxy.$fn.TripartiteMethod },
    { value: 'balance', formatter: proxy.$fn.TripartiteMethod },
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
  tableInfo.value.api = costAccountqueryVerify
  PeriodMonth()
})

function search() {
  filterInfo.value.copyQuery = {
    ...filterInfo.value.query,
  }
  tableInfo.value.refresh = Math.random()
}
function clearSearch() {
  filterInfo.value.query = {
    orgId: setting.value.hospitalId,
  }
  search()
}

const PeriodMonth = () => {
  const date = getToDay()
  periodMonthByDate({beginDate: moment(date).format('YYYY-MM-DD 00:00:00')}).then(({data}) => {
    const _data = data ? data[0] : {}
    filterInfo.value.query.periodId = _data.id
    filterInfo.value.query.periodName = _data.periodYearAndMonth
    search()
  })
}

// 导出
function showExportExcel() {

  costAccountexportVerify(filterInfo.value.query).then((resp) => {
    if (resp) {
      proxy.$fn.parseExcel(resp)
    }
  })
}
// 系统科室
const depttreeInfo = ref({
  title: '科室信息',
  visible: false,
  checkBox: true,
  checkStrictly: false,
  isLeaf: false,
  api: sectiontree,
  query: {},
  checkedList: []
})

function openDeptSelector() {
  depttreeInfo.value.visible = true;
}

function treeCallback(raw) {
  depttreeInfo.value.checkedList = raw;
  let datas = raw?.filter((it) => !it.childList)
  depttreeInfo.value.visible = false
  filterInfo.value.query.deptName = datas?.map((it) => it.name);
  filterInfo.value.query.deptId = datas?.map((it) => it.id);
  filterInfo.value.query.deptIdList = datas?.map((it) => it.id);
}

// 会计期间
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

// 分摊级次
const Levelinfo = ref({
  title: '分摊级次',
  visible: false,
  checkBox: false,
  checkStrictly: false,
  isLeaf: false,
  pager: false,
  type: 'Level',
  callBack: callBackName,
  query: {}
})
const formRef = ref()

function openshareLevel() {
  Levelinfo.value.visible = true
  filterRef.value.openDialog(Levelinfo.value, 'table')
}
function callBackName(data) {
  filterInfo.value.query.levelName = data.name;
  filterInfo.value.query.levelId = data.id;
  Levelinfo.value.visible = false
}



</script>

<template>
<!--  分摊验证-->
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
            <template #filter-levelName>
              <el-input
                  v-model="filterInfo.query.levelName"
                  class="not-mongolia"
                  type="input"
                  placeholder="请选择级次"
                  :disabled="true"
              >
                <template #append>
                  <el-icon @click="openshareLevel"><Search /></el-icon>
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
            :checkBox="false"
            :summaryFieldList="tableInfo.summaryFieldList"
            :tabIndex="true"
            :field-list="tableInfo.fieldList"
        >
        </table-container>
      </div>
    </div>
    <!--    查询核算科室-->
    <SelectDeptArchivesTree
        v-if="depttreeInfo.visible"
        v-model:showDialog="depttreeInfo.visible"
        :title="depttreeInfo.title"
        :checkStrictly="depttreeInfo.checkStrictly"
        :isLeaf="depttreeInfo.isLeaf"
        :query="depttreeInfo.query"
        :checkBox="depttreeInfo.checkBox"
        :api="depttreeInfo.api"
        :highlight-current="true"
        @callback="treeCallback" />
  </div>
</template>

<style scoped lang="scss">

</style>
