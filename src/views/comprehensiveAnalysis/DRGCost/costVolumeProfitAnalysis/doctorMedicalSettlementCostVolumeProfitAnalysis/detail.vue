<script setup>
import {computed, getCurrentInstance, onMounted, reactive, ref} from "vue";
import ModifyPage from "@/components/ModifyPage/ModifyPage.vue";
import {
  costDetail,
  exportCostDetail,
  exportIncomeDetail,
  incomeDetail
} from "@/api/DRGCost/doctorMedicalSettlementVolumeProfitAnalysis";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";

const PERMISSION_CODE = 'drg:doctorMedicalSettlementVolumeProfitAnalysis'
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
    { label: 'DRGs', value: 'drgDefinitionName', showLabel: true, type: 'slot', event: getList },
  ],
  cost: [
    { label: '成本项目', value: 'costItemName', showLabel: true, type: 'slot', event: getList },
  ]
}
const TABLE_FIELD = {
  income: [
    { label: '主诊医生', value: 'mainDoctorName' },
    { label: '执行科室编码', value: 'executeDeptCode' },
    { label: '执行科室名称', value: 'executeDeptName' },
    { label: 'DRGs编码', value: 'drgDefinitionCode' },
    { label: 'DRGs名称', value: 'drgDefinitionName' },
    { label: '支付标准', value: 'payStandard', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.payStandard) },
    { label: '病例数', value: 'paramValue', align: 'center' },
    { label: '结算金额', value: 'settle', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.settle) },
  ],
  cost: [
    { label: '主诊医生', value: 'mainDoctorName' },
    { label: 'DRGs编码', value: 'drgDefinitionCode' },
    { label: 'DRGs名称', value: 'drgDefinitionName' },
    { label: '成本项目编码', value: 'costItemCode' },
    { label: '成本项目名称', value: 'costItemName' },
    { label: '成本分类(成本大类)', value: 'topCostCategoryName' },
    { label: '成本属性', value: 'costAttribute' },
    { label: '成本金额', value: 'cost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.cost) },
  ]
}

const filterInfo = reactive({
  query: {},
  list: [
      ...FILTER_FIELD[props.type],
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', btType: 'primary', event: reset, },
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

function openDRGSelector() {
  tableParameter.type = 'DRGGroup'
  tableParameter.saveEmpty = false
  tableParameter.callBack = (raw) => {
    filterInfo.query.drgId = raw.id
    filterInfo.query.drgDefinitionName = raw.name
  }
  openDialog(filterRef.value)
}

function openCostItemSelector() {
  tableParameter.type = 'costItem'
  tableParameter.checkBox = true
  tableParameter.saveEmpty = false
  tableParameter.callBack = (raw) => {
    filterInfo.query.costItemIds = raw.map(it => it.id)
    filterInfo.query.costItemName = raw.map(it => it.name).join(',')
  }
  openDialog(filterRef.value)
}
</script>

<template>
  <ModifyPage v-model:visible="showDialog" no-full-button>
    <div class="filter-wrapper">
      <page-filter
          ref="filterRef"
          :listTypeInfo="filterInfo.options"
          v-model:query="filterInfo.query"
          :filter-list="filterInfo.list">
        <template #filter-drgDefinitionName>
          <el-input
              v-model="filterInfo.query.drgDefinitionName"
              class="not-mongolia" placeholder="请选择DRGs" :disabled="true"
          >
            <template #append><el-icon @click="openDRGSelector"><Search /></el-icon></template>
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
      </page-filter>
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