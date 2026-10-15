<script setup>
import Details from './details.vue'
import {onMounted} from "vue";
import {exportCostSplitRuleDetail, pageCostSplitRuleDetail} from "@/api/deptCostSplitRule";
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
    { label: '源科室', value: 'sourceDeptName', showLabel: true, type: 'slot', event: getList },
    { label: '承担科室', value: 'deptName', showLabel: true, type: 'slot', event: getList },
    { label: '拆分方法', value: 'way', type: 'select-model', code: 'cost_split_method' },
    { label: '成本分类', value: 'costTypeName', showLabel: true, type: 'slot', event: getList },
    { label: '成本项目', value: 'costItemName', showLabel: true, type: 'slot', event: getList },
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
    { label: '会计期间', value: 'accountingPeriodValue' },
    { label: '源科室编码', value: 'sourceDeptCode' },
    { label: '源科室名称', value: 'sourceDeptName' },
    { label: '拆分方法', value: 'wayValue' },
    { label: '备注', value: 'remark' },
    { label: '成本分类编码', value: 'costTypeCode' },
    { label: '成本分类名称', value: 'costTypeName' },
    { label: '成本项目编码', value: 'costItemCode' },
    { label: '成本项目名称', value: 'costItemName' },
    { label: '承担科室编码', value: 'deptCode' },
    { label: '承担科室名称', value: 'deptName' },
    { label: '参数值来源', value: 'paramSourceValue' },
    { label: '参数', value: 'apportionmentParamName' },
    { label: '参数值', value: 'value', align: 'center' },
  ],
  summaryFieldList: [
  ],
  data: [],
  handle: null,
})
const detailsInfo = ref({
  visible: false,
})

const spurceDept = ref([])
const bearDept = ref([])
const chargePro = ref([])
const treeInfo = ref({
  title: '',
  visible: false,
  checkBox: true,
  checkStrictly: false,
  isLeaf: false,
  query: {
    last: true,
  },
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
  query: {last: true,},
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
  tableInfo.value.api = pageCostSplitRuleDetail
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
  spurceDept.value = []
  bearDept.value = []
  costTypeInfo.checkedList = []
  tableParameter.value.checkedList = []
  getList()
}

function detail(row) {
  detailsInfo.value.id = row.deptCostSplitRuleId
  detailsInfo.value.visible = true
}

function exportData() {
  exportCostSplitRuleDetail({
    ...filterInfo.value.query,
    type: 'all'
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
    filterInfo.value.query.deptIds = datas.map((it) => it.id).join(',')
  } else {
    bearDept.value = raw;
    filterInfo.value.query.deptName = datas.map((it) => it.name).join(',')
    filterInfo.value.query.targetDeptIds = datas.map((it) => it.id).join(',')
  }
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
function openCostTypeSelector() {
  costTypeInfo.visible = true;
}
function costCategoryCallback(raw) {
  costTypeInfo.checkedList = raw;
  let datas = raw?.filter((it) => !it.children)
  filterInfo.value.query.costCategory = datas?.map((it) => it.id).join(',')
  filterInfo.value.query.costTypeName = datas?.map((it) => it.name).join(',')
}
function openCostItemSelector() {
  tableParameter.value.title = '成本项目'
  tableParameter.value.visible = true
  tableParameter.value.checkBox = true
  tableParameter.value.type = 'costItem'
  tableParameter.value.pager = true
  tableParameter.value.checkedList = chargePro.value
  tableParameter.value.filters = [
    { type: 'input', label: '编码/名称', value: 'name' }
  ]
  tableParameter.value.callBack = costItemCallback
  pageFilterRef.value.openDialog(tableParameter.value, 'table')
}
function costItemCallback(raw) {
  chargePro.value = raw;
  filterInfo.value.query.costItem = raw.map((it) => it.id).join(',')
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
            <template #filter-costTypeName>
              <el-input
                  v-model="filterInfo.query.costTypeName"
                  class="not-mongolia"
                  type="input"
                  placeholder="请选择成本分类"
                  :disabled="true"
              >
                <template #append>
                  <el-icon @click="openCostTypeSelector"><Search /></el-icon>
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
