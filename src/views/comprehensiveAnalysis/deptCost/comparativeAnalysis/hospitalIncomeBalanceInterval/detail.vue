<script setup>
import {computed, getCurrentInstance, onMounted, reactive, ref} from "vue";
import ModifyPage from "@/components/ModifyPage/ModifyPage.vue";
import {
  costDetail,
  exportCostDetail,
  exportIncomeDetail,
  incomeDetail
} from "@/api/deptCost/hospitalIncomeBalanceInterval";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";

const PERMISSION_CODE = 'dept:hospitalIncomeBalanceInterval'
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
    { label: '收入项目', value: 'incomeProjectName', showLabel: true, type: 'slot', event: getList },
  ],
  cost: [
    { label: '成本项目', value: 'costItemName', showLabel: true, type: 'slot', event: getList },
  ]
}
const TABLE_FIELD = {
  income: [
    { label: '核算科室编码', value: 'deptCode' },
    { label: '核算科室名称', value: 'deptName' },
    { label: '收入项目', value: 'incomeProjectName' },
    { label: '分析区间', type: 'multiHeader', children: [
        { label: '分析金额', value: 'analysisCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.analysisIncome) },
        { label: '占比(%)', value: 'analysisIncomeProportion', align: 'center' },
      ]
    },
    { label: '对比区间', type: 'multiHeader', children: [
        { label: '对比金额', value: 'compareIncome', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.compareIncome) },
        { label: '占比(%)', value: 'compareIncomeProportion', align: 'center' },
      ]
    },
    { label: '对比差异', value: 'compareIncomeDifference' },
    { label: '对比增长率', value: 'compareRate' },
  ],
  cost: [
    { label: '核算科室编码', value: 'deptCode' },
    { label: '核算科室名称', value: 'deptName' },
    { label: '成本项目编码', value: 'costItemCode' },
    { label: '成本项目名称', value: 'costItemName' },
    { label: '成本分类(成本大类)', value: 'rootCostCategoryName' },
    { label: '分析区间', type: 'multiHeader', children: [
        { label: '分析金额', value: 'analysisCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.analysisCost) },
        { label: '占比(%)', value: 'analysisCostProportion', align: 'center' },
      ]
    },
    { label: '对比区间', type: 'multiHeader', children: [
        { label: '对比金额', value: 'compareCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.compareCost) },
        { label: '占比(%)', value: 'compareCostProportion', align: 'center' },
      ]
    },
    { label: '对比差异', value: 'compareCostDifference', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.compareCostDifference) },
    { label: '对比增长率', value: 'compareRate', align: 'center' },
  ]
}

const filterInfo = reactive({
  query: {},
  list: [
      ...FILTER_FIELD[props.type],
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', event: reset, },
  ],
  btnList: [
    { type: 'button', label: '导出', show: proxy.$permission(`${PERMISSION_CODE}:export`), event: () => exportData() }
  ]
})
const tableInfo = reactive({
  refresh: 1,
  api: null,
  fieldList: TABLE_FIELD[props.type],
  data: [],
})

const selectIncomeProject = ref({
  visible: false,
  saveEmpty: true,
  query: {},
  checkedKey: {},
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

function openIncomeProjectSelector() {
  selectIncomeProject.value.checkBox = true
  selectIncomeProject.value.visible = true
}
function selectIncomeProjectCallback(raw) {
  filterInfo.query.incomeProjectIdList = raw.map(it => it.id)
  filterInfo.query.incomeProjectName = raw.map(it => it.name).join(',')
}

function openCostItemSelector() {
  tableParameter.type = 'costItem'
  tableParameter.checkBox = true
  tableParameter.saveEmpty = false
  tableParameter.callBack = (raw) => {
    filterInfo.query.costItemIdList = raw.map(it => it.id)
    filterInfo.query.costItemName = raw.map(it => it.name).join(',')
  }
  openDialog(filterRef.value)
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
        <template #filter-incomeProjectName>
          <el-input
              v-model="filterInfo.query.incomeProjectName"
              class="not-mongolia" placeholder="请选择收入项目" :disabled="true"
          >
            <template #append><el-icon @click="openIncomeProjectSelector"><Search /></el-icon></template>
          </el-input>
        </template>
        <template #filter-costItemName>
          <el-input
              v-model="filterInfo.query.costItemName"
              class="not-mongolia" placeholder="请选择成本项目" :disabled="true"
          >
            <template #append><el-icon @click="openCostItemSelector"><Search /></el-icon></template>
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
    <SelectIncomeProject
        v-if="selectIncomeProject.visible"
        v-model:query="selectIncomeProject.query"
        v-model:show-dialog="selectIncomeProject.visible"
        title="收入项目"
        :checkStrictly="true"
        :check-box="selectIncomeProject.checkBox"
        :isLeaf="false"
        :highlightCurrent="true"
        :checkedKey="selectIncomeProject.checkedKey"
        :saveEmpty="selectIncomeProject.saveEmpty"
        @callback="selectIncomeProjectCallback"
    ></SelectIncomeProject>
  </ModifyPage>
</template>

<style scoped lang="scss">

</style>
