<script setup>
import {getCurrentInstance, onMounted, reactive} from "vue";
import {costDetail, exportCostDetail, exportIncomeDetail, incomeDetail} from "@/api/projectCost/basicSituationAnalysis";
import ModifyPage from "@/components/ModifyPage/ModifyPage.vue";

const PERMISSION_CODE = 'projectCost:basicSituationAnalysis'

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
    { label: '核算科室编码', value: 'executeDeptCode' },
    { label: '核算科室名称', value: 'executeDeptName' },
    { label: '服务项目编码', value: 'feeItemCode' },
    { label: '服务项目名称', value: 'feeItemName' },
    { label: '收费类别', value: 'feeCategoryName' },
    { label: '收入项目', value: 'feeItem' },
    { label: '总收入', value: 'money', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.money) },
    { label: '数量', value: 'number', align: 'center' },
    { label: '单价', value: 'price', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.price) },
  ],
  cost: [
    { label: '服务项目编码', value: 'feeItemCode' },
    { label: '服务项目名称', value: 'feeItemName' },
    { label: '成本项目编码', value: 'costItemCode' },
    { label: '成本项目名称', value: 'costItemName' },
    { label: '成本分类', value: 'costCategoryName' },
    { label: '成本分类(成本大类)', value: 'topCostCategoryName' },
    { label: '工作量', value: 'number', align: 'center' },
    { label: '单位成本', value: 'price', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.price) },
    { label: '成本金额', value: 'money', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.money) },
  ]
}

const filterInfo = reactive({
  copyQuery: {},
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

onMounted(() => {
  tableInfo.api = API[props.type]
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