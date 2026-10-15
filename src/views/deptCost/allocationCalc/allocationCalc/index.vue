<!-- 分摊计算页面 -->
<script setup name="allocationCalc">
import {onMounted, watch} from "vue";
import moment from "moment";
import {
  calcAllocationCalc,
  cancelCalcAllocationCalc,
  checkAllocationCalc, exportCalcAllocationCalc,
  pageAllocationCalc
} from "@/api/allocationCalc";
import {useStorage} from "@vueuse/core";
import {periodMonthByDate} from "@/api/base";
import {useUpload} from "@/hooks/useUpload";
import {dict_cost_type, dict_dept_level} from "@/views/comprehensiveAnalysis/common/fakeDict";
import Details from "./details.vue";
const {proxy} = getCurrentInstance()

const setting = useStorage('setting', {}, sessionStorage)

const { exportData } = useUpload({
  export: exportCalcAllocationCalc
})

const defaultQuery = {
  deptLevel: dict_dept_level[dict_dept_level.length - 1].value,
  costType: '3',
  deptIds: [],
  orgId: setting.value.hospitalId
}

const filterInfo = ref({
  query: {
    ...defaultQuery
  },
  options: {
    deptLevel: dict_dept_level,
    costType: dict_cost_type,
  },
  list: [
    { label: '会计期间', value: 'periodName', required: true, showLabel: true, type: 'slot' },
    { label: '核算科室', value: 'deptName', showLabel: true, type: 'slot' },
    { label: '科室级次', value: 'deptLevel', clearable: false, type: 'select', list: 'deptLevel' },
    { label: '成本类型', value: 'costType', clearable: false, type: 'select', list: 'costType' },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', event: reset, },
  ],
  btnList: [
    { type: 'button', btType: 'primary', label: '分摊检查', show: proxy.$permission('allocationCalc:check'), event: checkData },
    { type: 'button', label: '分摊计算', show: proxy.$permission('allocationCalc:calc'), event: calcData },
    { type: 'button', label: '取消计算', show: proxy.$permission('allocationCalc:calc'), event: cancelCalcData },
    { type: 'button', label: '生成报表', show: proxy.$permission('allocationCalc:build'), event: null },
    { type: 'button', label: '导出Excel', show: proxy.$permission('allocationCalc:export'), event: () => exportData(filterInfo.value.copyQuery) },
  ]
})
const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  api: null,
  fieldList: [
    { label: '科室编码', value: 'deptCode' },
    { label: '科室名称', value: 'deptName' },
    { label: '核算属性', value: 'deptAtrName' },
    { label: '直接成本', value: 'directCostMoney', type: 'slot', align: 'right' },
    { label: '一级分摊', value: 'firstLevelMoney', type: 'slot', align: 'right' },
    { label: '二级分摊', value: 'secondLevelMoney', type: 'slot', align: 'right' },
    { label: '三级分摊', value: 'thirdLevelMoney', type: 'slot', align: 'right' },
    { label: '四级分摊', value: 'fourthLevelMoney', type: 'slot', align: 'right' },
    { label: '五级分摊', value: 'fifthLevelMoney', type: 'slot', align: 'right' },
    { label: '六级分摊', value: 'sixLevelMoney', type: 'slot', align: 'right' },
    { label: '七级分摊', value: 'sevenLevelMoney', type: 'slot', align: 'right' },
    { label: '八级分摊', value: 'eightLevelMoney', type: 'slot', align: 'right' },
    { label: '全成本', value: 'allCostMoney', type: 'slot', align: 'right' },
  ],
  summaryFieldList: [
    { value: 'directCostMoney', formatter: proxy.$fn.TripartiteMethod },
    { value: 'firstLevelMoney', formatter: proxy.$fn.TripartiteMethod },
    { value: 'secondLevelMoney', formatter: proxy.$fn.TripartiteMethod },
    { value: 'thirdLevelMoney', formatter: proxy.$fn.TripartiteMethod },
    { value: 'fourthLevelMoney', formatter: proxy.$fn.TripartiteMethod },
    { value: 'fifthLevelMoney', formatter: proxy.$fn.TripartiteMethod },
    { value: 'sixLevelMoney', formatter: proxy.$fn.TripartiteMethod },
    { value: 'sevenLevelMoney', formatter: proxy.$fn.TripartiteMethod },
    { value: 'eightLevelMoney', formatter: proxy.$fn.TripartiteMethod },
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
const checkDialog = ref({
  title: '',
  fieldList: [{ label: '警告级别', value: 'levelName', width: '120' }, { label: '内容', value: 'message' }],
  visible: false,
  data: []
})

watch(() => tableInfo.value.data, (rows) => {
  const fieldList = tableInfo.value.fieldList;
  ['first', 'second', 'third', 'fourth', 'fifth', 'six', 'seven', 'eight'].forEach(key => {
    fieldList.find(it => it.value === `${key}LevelMoney`).hidden = rows.filter(it => it[`${key}LevelMoney`] != null).length === 0
  })
})

onMounted(async () => {
  tableInfo.value.api = pageAllocationCalc
  updatePeriodMonth()
})

const updatePeriodMonth = () => {
  periodMonthByDate({ beginDate: moment("2025-11-03").format('YYYY-MM-DD 00:00:00') }).then(({ data }) => {
    const _data = data ? data[0] : {}
    filterInfo.value.query.periodId = _data?.id
    filterInfo.value.query.periodName = _data?.periodYearAndMonth
    getList()
  })
}

function getList() {
  filterInfo.value.copyQuery = {
    ...filterInfo.value.query
  }
  if(!filterInfo.value.copyQuery.periodId) return proxy.$message.warning('请选择会计期间')
  tableInfo.value.refresh = Math.random()
}
function reset() {
  filterInfo.value.query = {
    ...defaultQuery
  }
  updatePeriodMonth()
}
const tableHandler = (eventName, raw) => {
  if (eventName === 'tableCheck') {
    tableInfo.value.sectionRows = raw
  }
}

function checkData() {
  if(!filterInfo.value.query.periodId) return proxy.$message.warning('请选择会计期间')
  checkAllocationCalc(filterInfo.value.query).then(res => {
    if (res.code === 200) {
      if(res.data.length === 0) {
        return proxy.$message.success('校验成功')
      }
      checkDialog.value.data = res.data
      checkDialog.value.visible = true
      checkDialog.value.title = '分摊检查'
    }
  })
}

function calcData() {
  if(!filterInfo.value.query.periodId) return proxy.$message.warning('请选择会计期间')
  calcAllocationCalc(filterInfo.value.query).then(res => {
    if (res.code === 200) {
      checkDialog.value.data = res.data
      checkDialog.value.visible = true
      checkDialog.value.title = '分摊计算'
    }
  })
}

function cancelCalcData() {
  if(!filterInfo.value.query.periodId) return proxy.$message.warning('请选择会计期间')
  cancelCalcAllocationCalc(filterInfo.value.query).then(res => {
    if (res.code === 200) {
      proxy.$message.success('操作成功')
      getList()
    }
  })
}
const treeInfo = ref({
  title: '核算科室',
  visible: false,
  checkBox: true,
  checkStrictly: false,
  isLeaf: false,
  query: {}
})

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
function openDeptSelector() {
  treeInfo.value.visible = true
}
function treeCallback(raw) {
  const datas = raw?.filter((it) => !it.childList)
  filterInfo.value.query.deptIds = datas?.map((it) => it.id);
  filterInfo.value.query.deptName = datas?.map((it) => it.name);
}
const detailsInfo = ref({
  visible: false,
  params: {}
})
function detail(row, type = '0') {
  detailsInfo.value.params = {
    deptId: row.deptId,
    isDirect: type,
    orgId: filterInfo.value.query.orgId,
    costType: filterInfo.value.query.costType,
    periodId: filterInfo.value.query.periodId,
  }
  detailsInfo.value.visible = true
}

function checkDialogClose() {
  getList()
}
</script>

<template>
  <div class="app-container">
    <div class="layui-card layui-col-md12" v-show="!detailsInfo.visible">
      <div class="layui-card-body">
        <!-- 条件栏 -->
        <div class="filter-wrapper">
          <NewPageFilter
              ref="filterRef"
              v-model:query="filterInfo.query"
              :filter-list="filterInfo.list"
              :filter-btn="filterInfo.filterbtn"
              :listTypeInfo="filterInfo.options"
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
                  placeholder="请选择核算科室"
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
        <!-- 表格 -->
        <table-container
            :refresh="tableInfo.refresh"
            :init-curpage="tableInfo.initCurpage"
            v-model:data="tableInfo.data"
            :api="tableInfo.api"
            :query="filterInfo.copyQuery"
            :summary="true"
            row-key="deptCode"
            :summaryFieldList="tableInfo.summaryFieldList"
            :tabIndex="true"
            :pager="false"
            :check-box="false"
            :field-list="tableInfo.fieldList"
            :handle="tableInfo.handle"
            @handleEvent="tableHandler"
        >
          <template #col-directCostMoney="{ row }">
            <span class="slip-edit" @click="detail(row, '1')">{{ proxy.$fn.TripartiteMethod(row.directCostMoney) }}</span>
          </template>
          <template #col-firstLevelMoney="{ row }">
            <span class="slip-edit" @click="detail(row)">{{ proxy.$fn.TripartiteMethod(row.firstLevelMoney) }}</span>
          </template>
          <template #col-secondLevelMoney="{ row }">
            <span class="slip-edit" @click="detail(row)">{{ proxy.$fn.TripartiteMethod(row.secondLevelMoney) }}</span>
          </template>
          <template #col-thirdLevelMoney="{ row }">
            <span class="slip-edit" @click="detail(row)">{{ proxy.$fn.TripartiteMethod(row.thirdLevelMoney) }}</span>
          </template>
          <template #col-fourthLevelMoney="{ row }">
            <span class="slip-edit" @click="detail(row)">{{ proxy.$fn.TripartiteMethod(row.fourthLevelMoney) }}</span>
          </template>
          <template #col-fifthLevelMoney="{ row }">
            <span class="slip-edit" @click="detail(row)">{{ proxy.$fn.TripartiteMethod(row.fifthLevelMoney) }}</span>
          </template>
          <template #col-sixLevelMoney="{ row }">
            <span class="slip-edit" @click="detail(row)">{{ proxy.$fn.TripartiteMethod(row.sixLevelMoney) }}</span>
          </template>
          <template #col-sevenLevelMoney="{ row }">
            <span class="slip-edit" @click="detail(row)">{{ proxy.$fn.TripartiteMethod(row.sevenLevelMoney) }}</span>
          </template>
          <template #col-eightLevelMoney="{ row }">
            <span class="slip-edit" @click="detail(row)">{{ proxy.$fn.TripartiteMethod(row.eightLevelMoney) }}</span>
          </template>
          <template #col-allCostMoney="{ row }">
            <span class="slip-edit" @click="detail(row)">{{ proxy.$fn.TripartiteMethod(row.allCostMoney) }}</span>
          </template>
        </table-container>
      </div>
    </div>

    <Details
        v-if="detailsInfo.visible"
        :params="detailsInfo.params"
        v-model:visible="detailsInfo.visible"
        @returnBack="getList"
    ></Details>
  </div>
  <el-dialog :title="checkDialog.title" v-model="checkDialog.visible" @close="checkDialogClose">
    <dialog-table :check-box="false" :pager="false" :fieldList="checkDialog.fieldList" :data="checkDialog.data" />
  </el-dialog>
  <SelectDeptArchivesTree
      v-if="treeInfo.visible"
      v-model:showDialog="treeInfo.visible"
      :title="treeInfo.title"
      :checkStrictly="treeInfo.checkStrictly"
      :isLeaf="treeInfo.isLeaf"
      :query="treeInfo.query"
      :checkBox="treeInfo.checkBox"
      :api="treeInfo.api"
      :highlight-current="true"
      @callback="treeCallback" />
</template>

<style scoped lang="scss">

</style>
