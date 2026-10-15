<script setup>
import {getCurrentInstance, onMounted, reactive, watch} from "vue";
import {costDetail, exportCostDetail, exportIncomeDetail, incomeDetail} from "@/api/deptCost/contributionProject";
import ModifyPage from "@/components/ModifyPage/ModifyPage.vue";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {
  sectiontree,
} from "@/api/accountingDepartment";

const PERMISSION_CODE = 'projectCost:marginalContributionAnalysis'

const { proxy } = getCurrentInstance()
const emits = defineEmits(['update:visible'])
const props = defineProps({
  type: {
    type: String,
    required: true
  },
  visible: {
    type: Boolean,
    required: true
  },
  query: {
    type: Object,
    required: true,
  }
})

const showDialog = computed({
  get() {
    return props.visible
  },
  set(newValue) {
    // 更新父组件visible
    emits('update:visible', newValue)
  },
})

const API = {
  income: incomeDetail,
  cost: costDetail,
  export: {
    income: exportIncomeDetail,
    cost: exportCostDetail
  }
}
const FILTER_FIELD = {
  income: [
    { label: '科室信息', value: 'deptName', showLabel: true, type: 'slot', event: getList },
  ],
  cost: [
    { label: '科室信息', value: 'deptName', showLabel: true, type: 'slot', event: getList },
  ]
}
const TABLE_FIELD = {
  income: [
    { label: '核算科室编码', value: 'deptCode' },
    { label: '核算科室名称', value: 'deptName' },
    { label: '服务项目编码', value: 'feeCode' },
    { label: '服务项目名称', value: 'feeName' },
    { label: '收费类别', value: 'feeCategoryName' },
    { label: '收入项目', value: 'incomeProjectName' },
    { label: '数量', value: 'qty', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.qty) },
    { label: '单价', value: 'price', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.price) },
    { label: '金额', value: 'income', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.income) },
    { label: '占比(%)', value: 'rate', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.rate) },
  ],
  cost: [
    { label: '核算科室编码', value: 'deptCode' },
    { label: '核算科室名称', value: 'deptName' },
    { label: '服务项目编码', value: 'feeItemCode' },
    { label: '服务项目名称', value: 'feeItemName' },
    { label: '工作量', value: 'workNum' },
    { label: '单位成本', value: 'avgTotalCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.avgTotalCost) },
    { label: '总成本', value: 'totalCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.totalCost) },
    { label: '直接成本', value: 'directCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.directCost) },
    { label: '间接成本', value: 'indirectCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.indirectCost) },
    { label: '占比', value: 'rate', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.rate) },
  ]
}

const filterInfo = reactive({
  copyQuery: {},
  query: {},
  list: [
    ...FILTER_FIELD[props.type],
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', event: reset, },
  ],
  btnList: [
    { type: 'button', label: '导出Excel', show: proxy.$permission(`${PERMISSION_CODE}:export`), event: () => exportData() }
  ]
})
const tableInfo = reactive({
  refresh: 1,
  api: null,
  fieldList: TABLE_FIELD[props.type],
  data: [],
})
// 核算科室
const depttreeInfo = ref({
  title: '核算科室',
  visible: false,
  checkBox: true,
  checkStrictly: false,
  isLeaf: false,
  api: sectiontree,
  query: {},
  checkedList: []
})

const filterRef = ref()
const { tableParameter, openDialog } = useSelectTableData()

const tableQuery = computed(() => {
  return {
    ...props.query,
    ...filterInfo.query
  }
})
onMounted(() => {
  tableInfo.api = API[props.type]
  getList()
})

function getList() {
  tableInfo.refresh = Math.random()
}
function reset() {
  filterInfo.query = {}
  getList()
}

function exportData() {
  API.export[props.type](tableQuery.value).then((resp) => {
    if (resp) {
      proxy.$fn.parseExcel(resp)
    }
  })
}

function openDeptSelector() {
  depttreeInfo.value.visible = true
}
function treeCallback(data) {
  depttreeInfo.value.visible = false
  depttreeInfo.value.checkedList = data || []
  filterInfo.query.deptIdList = data.map(it => it.id)
  filterInfo.query.deptName = data.map(it => it.name).join(',')
}

</script>

<template>
  <ModifyPage v-model:visible="showDialog" no-full-button>
    <div class="filter-wrapper">
      <NewPageFilter
          ref="filterRef"
          :listTypeInfo="filterInfo.options"
          v-model:query="filterInfo.query"
          :filter-btn="filterInfo.filterbtn"
          :filter-list="filterInfo.list">
        <template #filter-deptName>
          <el-input
              v-model="filterInfo.query.deptName"
              class="not-mongolia" placeholder="请选择核算科室" :disabled="true"
          >
            <template #append><el-icon @click="openDeptSelector"><Search /></el-icon></template>
          </el-input>
        </template>
      </NewPageFilter>
    </div>
    <div class="filter-wrapper">
      <new-page-filter :filter-btn="filterInfo.btnList"></new-page-filter>
    </div>
    <table-container
        :api="tableInfo.api"
        :field-list="tableInfo.fieldList"
        :query="tableQuery"
        :check-box="false"
        :refresh="tableInfo.refresh"
        v-model:data="tableInfo.data"
        tabIndex
        :pager="true"
    ></table-container>
    <!--    查询开单科室-->
    <SelectProDeptTree
        v-if="depttreeInfo.visible"
        v-model:showDialog="depttreeInfo.visible"
        :title="depttreeInfo.title"
        :checkStrictly="depttreeInfo.checkStrictly"
        :isLeaf="depttreeInfo.isLeaf"
        :query="depttreeInfo.query"
        :checkBox="depttreeInfo.checkBox"
        :checkedList="depttreeInfo.checkedList"
        :api="depttreeInfo.api"
        :highlight-current="true"
        @callback="treeCallback" />
  </ModifyPage>
</template>

<style scoped lang="scss">

</style>
