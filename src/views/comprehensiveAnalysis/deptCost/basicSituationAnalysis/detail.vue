<script setup>
import {getCurrentInstance, onMounted, reactive, watch} from "vue";
import {costDetail, exportCostDetail, exportIncomeDetail, incomeDetail} from "@/api/deptCost/basicSituationAnalysis";
import ModifyPage from "@/components/ModifyPage/ModifyPage.vue";

const PERMISSION_CODE = 'dept:deptCostBasicSituationAnalysis'

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
const TABLE_FIELD = {
  income: [
    { label: '核算科室编码', value: 'sectionCode' },
    { label: '核算科室名称', value: 'sectionName' },
    { label: '收费项目编码', value: 'feeItemCode' },
    { label: '收费项目名称', value: 'feeItemName' },
    { label: '收入项目', value: 'incomeProjectName' },
    { label: '总收入', value: 'totalIncome', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.totalIncome) },
  ],
  cost: [
    { label: '核算科室编码', value: 'sectionCode' },
    { label: '核算科室名称', value: 'sectionName' },
    { label: '成本项目编码', value: 'costItemCode' },
    { label: '成本项目名称', value: 'costItemName' },
    { label: '成本分类', value: 'costCategoryName' },
    { label: '成本分类(成本大类)', value: 'rootCostCategoryName' },
    { label: '总成本', value: 'totalCost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.totalCost) },
  ]
}

const filterInfo = reactive({
  copyQuery: {},
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

watch(() => tableInfo.data, (data) => {
  if (data.length > 0) {
    const typeName = {
      income: '收入',
      cost: '成本'
    }[props.type]
    data[0].preData?.forEach(({ name }) => {
      tableInfo.fieldList.push({
        label: name,
        type: 'multiHeader',
        children: [
          { label: `本期${typeName}`, value: `${name}_currentData`, headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row[`${name}_currentData`]) },
          { label: `上期${typeName}`, value: `${name}_preMonthData`, headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row[`${name}_preMonthData`]) },
          { label: '环比增长率(%)', value: `${name}_preMonthRate` },
          { label: `去年同期${typeName}`, value: `${name}_preYearData`, headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row[`${name}_preYearData`]) },
          { label: '同步增减率(%)', value: `${name}_preYearRate` },
        ]
      })
    })
  }
})

onMounted(() => {
  tableInfo.api = (params) => {
    return new Promise((resolve, reject) => {
      API[props.type](params).then(res => {
        resolve({
          ...res,
          data: res.data.map(it => {
            const expandData = it.preData.reduce((prev, cur) => {
              prev[`${cur.name}_currentData`] = cur.currentData
              prev[`${cur.name}_preMonthData`] = cur.preMonthData
              prev[`${cur.name}_preMonthRate`] = cur.preMonthRate
              prev[`${cur.name}_preYearData`] = cur.preYearData
              prev[`${cur.name}_preYearRate`] = cur.preYearRate
              return prev
            }, {})
            return {
              ...it,
              ...expandData
            }
          })
        })
      }).catch(err => {
        reject(err)
      })
    })
  }
  getList()
})

function getList() {
  tableInfo.refresh = Math.random()
}

function exportData() {
  API.export[props.type]({
    ...props.query,
    ...filterInfo.copyQuery
  }).then((resp) => {
    if (resp) {
      proxy.$fn.parseExcel(resp)
    }
  })
}
</script>

<template>
  <ModifyPage v-model:visible="showDialog" no-full-button>
    <div class="filter-wrapper">
      <new-page-filter :filter-btn="filterInfo.btnList"></new-page-filter>
    </div>
    <table-container
        :api="tableInfo.api"
        :field-list="tableInfo.fieldList"
        :query="query"
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
