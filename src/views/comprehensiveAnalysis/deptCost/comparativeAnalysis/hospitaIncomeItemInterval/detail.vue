<script setup>
import {computed, getCurrentInstance, onMounted, reactive, ref} from "vue";
import ModifyPage from "@/components/ModifyPage/ModifyPage.vue";
import {
  incomeDetail,
  exportIncomeDetail,
} from "@/api/deptCost/hospitalIncomeItemInterval";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {dict_dept_level} from "@/views/comprehensiveAnalysis/common/fakeDict";
import {sectiontree} from "@/api/accountingDepartment";

const PERMISSION_CODE = 'dept:hospitaIncomeItemInterval'
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
  export: {
    income: exportIncomeDetail
  }
}
const FILTER_FIELD = {
  income: [
    { label: '收费项目', value: 'feeItemName', showLabel: true, type: 'slot', event: getList },
  ]
}
const TABLE_FIELD = {
  income: [
    { label: '收费项目编码', value: 'feeItemCode' },
    { label: '收费项目名称', value: 'feeItemName' },
    { label: '收费类别', value: 'feeCategoryName' },
    { label: '收入项目', value: 'incomeProjectName' },
    { label: '分析区间', type: 'multiHeader', children: [
        { label: '金额', value: 'analysisIncome', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.analysisIncome) },
        { label: '占比(%)', value: 'analysisIncomeProportion', align: 'center' },
      ]
    },
    { label: '对比区间', type: 'multiHeader', children: [
        { label: '金额', value: 'compareIncome', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.compareIncome) },
        { label: '占比(%)', value: 'compareIncomeProportion', align: 'center' },
      ]
    },
    { label: '差异金额', value: 'compareIncomeDifference', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.compareIncomeDifference) },
    { label: '对比增长率(%)', value: 'compareRate', align: 'center' },
  ]
}

const filterInfo = reactive({
  query: {
  },
  options: {
    deptLevel: dict_dept_level
  },
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

function openFeeItemSelector() {
  tableParameter.type = 'feeItem'
  tableParameter.checkBox = true
  tableParameter.saveEmpty = false
  tableParameter.callBack = (raw) => {
    filterInfo.query.feeItemIdList = raw.map(it => it.id)
    filterInfo.query.feeItemName = raw.map(it => it.name).join(',')
  }
  openDialog(filterRef.value)
}
</script>

<template>
  <ModifyPage v-model:visible="showDialog" no-full-button>
    <div class="filter-wrapper">
      <pNewPageFilter
          ref="filterRef"
          :listTypeInfo="filterInfo.options"
          v-model:query="filterInfo.query"
          :filter-btn="filterInfo.filterbtn"
          :filter-list="filterInfo.list">
        <template #filter-feeItemName>
          <el-input
              v-model="filterInfo.query.feeItemName"
              class="not-mongolia" placeholder="请选择费用项目" :disabled="true"
          >
            <template #append><el-icon @click="openFeeItemSelector"><Search /></el-icon></template>
          </el-input>
        </template>
      </pNewPageFilter>
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
  </ModifyPage>
</template>

<style scoped lang="scss">

</style>
