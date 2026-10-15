<script setup name="deptQuery">
import {getCurrentInstance, onMounted} from "vue";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {
  costledgergetCostResByDept,
  costledgergetCostResByDeptExport,
} from "@/api/costCountParameter";

const {proxy} = getCurrentInstance()
const filterInfo = ref({
  query: {},
  list: [
    {label: '核算期间', value: 'itemAccountingPeriodName', showLabel: true, type: 'slot'},
    {label: '核算科室', value: 'deptName', showLabel: true, type: 'slot'},
    {label: '收费类别', value: 'feeCategoryName', showLabel: true, type: 'slot'},
    {label: '收费项目', value: 'feeItemName', showLabel: true, type: 'slot'},
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', event: reset, },
  ],
  btnList: [
    {type: 'button', btType: 'primary', label: '导出Excel', show: proxy.$permission('deptQuery:export'), event: enableData},
  ]
})
const chargeType = ref([])
const chargePro = ref([])
const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  api: null,
  fieldList: [
    {label: '核算期间', value: 'itemAccountingPeriodName'},
    {label: '核算科室', value: 'deptName'},
    {label: '收费类别编码', value: 'feeCategoryCode'},
    {label: '收费类别名称', value: 'feeCategoryName'},
    {label: '收费项目编码', value: 'feeItemCode'},
    {label: '收费项目名称', value: 'feeItemName'},
    {label: '单价', value: 'price', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.price)},
    {label: '单位成本', value: 'unitCost', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.unitCost)},
    {label: '成本收益率', value: 'incomeRate', align: 'center'},
    {label: '工作量', value: 'workNum', align: 'center'},
    {label: '总收入', value: 'allIncome', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.allIncome)},
    {label: '总成本', value: 'allCost', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.allCost)},
    {label: '总收益', value: 'allBalance', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.allBalance)},
  ],
  data: [],
})

const filterRef = ref()

const { tableParameter, openDialog } = useSelectTableData()

onMounted(() => {
  tableInfo.value.api = costledgergetCostResByDept
  getList()
})

function getList() {
  filterInfo.value.copyQuery = {...filterInfo.value.query}
  tableInfo.value.refresh = Math.random()
}

function reset() {
  filterInfo.value.query = {}
  getList()
}

function enableData() {
  costledgergetCostResByDeptExport(filterInfo.value.copyQuery).then(res => {
    if (res) {
      proxy.$fn.parseExcel(res)
    }
  })
}

function openAccountingPeriodSelector() {
  tableParameter.type = 'itemaccountingPeriod'
  tableParameter.query = {}
  tableParameter.filters = []
  tableParameter.title = '核算期间'
  tableParameter.callBack = accountingPeriodCallback
  openDialog(filterRef.value)
}

function accountingPeriodCallback(raw) {
  filterInfo.value.query.itemAccountingPeriodId = raw.id
  filterInfo.value.query.itemAccountingPeriodName = raw.name
}

function openfeeCategorySelector() {
  tableParameter.type = 'feeCategory'
  tableParameter.title = '收费类别'
  tableParameter.checkedList = chargeType.value;
  tableParameter.query = {
    status: '1'
  }
  tableParameter.callBack = feeCategoryCallback
  openDialog(filterRef.value)
}
function feeCategoryCallback(raw) {
  chargeType.value = raw
  filterInfo.value.query.feeCategoryId = raw.map((it) => it.id).join(',')
  filterInfo.value.query.feeCategoryName = raw.map((it) => it.name).join(',')
}

function openFeeItemSelector(mark) {
  tableParameter.title = '收费项目'
  tableParameter.visible = true
  tableParameter.mark = mark
  tableParameter.checkBox = false
  tableParameter.pager = true
  tableParameter.checkedList = chargePro.value;
  tableParameter.filters = [
    { type: 'input', label: '编码/名称', value: 'keyword' }
  ]
  tableParameter.type = 'feeItem'
  tableParameter.query = { status: 1, feeCategoryId: filterInfo.value.query?.feeCategoryId }
  tableParameter.callBack = feeItemCallback
  openDialog(filterRef.value, 'table')
}
function feeItemCallback(raw) {
  chargePro.value = raw
  filterInfo.value.query.feeItemId = raw.map((it) => it.id).join(',')
  filterInfo.value.query.feeItemName = raw.map((it) => it.name).join(',')
}

// 核算科室
const deptTreeInfo = ref({
  title: '核算科室',
  visible: false,
  checkBox: true,
  checkStrictly: false,
  isLeaf: false,
  mark: null,
  query: {},
  checkedList: []
})
function openDeptSelector() {
  deptTreeInfo.value.visible = true
}
function treeCallback(raw) {
  deptTreeInfo.value.checkedList = raw
  const datas = raw?.filter((it) => !it.childList)
  filterInfo.value.query.deptId = datas.map(it => it.id);
  filterInfo.value.query.deptIdList = datas.map(it => it.id);
  filterInfo.value.query.deptName = datas.map(it => it.name);
}


</script>

<template>
  <!--  科室级查询 参数-->
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
            <template #filter-itemAccountingPeriodName>
              <el-input
                  v-model="filterInfo.query.itemAccountingPeriodName"
                  class="not-mongolia"
                  type="input"
                  placeholder="请选择核算期间"
                  :disabled="true"
              >
                <template #append>
                  <el-icon @click="openAccountingPeriodSelector">
                    <Search/>
                  </el-icon>
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
            <template #filter-feeCategoryName>
              <el-input
                  v-model="filterInfo.query.feeCategoryName"
                  class="not-mongolia"
                  type="input"
                  placeholder="请选择收费类别"
                  :disabled="true"
              >
                <template #append>
                  <el-icon @click="openfeeCategorySelector"><Search /></el-icon>
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
            :checkBox="false"
            :tabIndex="true"
            :pager="true"
            :field-list="tableInfo.fieldList"
        >
        </table-container>
      </div>
    </div>
    <!--    查询核算科室-->
    <SelectProDeptTree
        v-if="deptTreeInfo.visible"
        v-model:showDialog="deptTreeInfo.visible"
        :title="deptTreeInfo.title"
        :checkStrictly="deptTreeInfo.checkStrictly"
        :isLeaf="deptTreeInfo.isLeaf"
        :query="deptTreeInfo.query"
        :checkBox="deptTreeInfo.checkBox"
        :checkedList="deptTreeInfo.checkedList"
        :api="deptTreeInfo.api"
        :highlight-current="true"
        @callback="treeCallback" />
  </div>
</template>

<style scoped lang="scss">

</style>
