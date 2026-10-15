<script setup>
import {onMounted} from "vue";
import {costAccountexportCostAccount, costAccountqueryList} from "@/api/allocationJournal";
const {proxy} = getCurrentInstance()
const emit = defineEmits()
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  params: {
    type: Object,
    default: () => {
      return {}
    },
  },
})

const filterInfo = ref({
  query: {

  },
  btnList: [
    { type: 'button', label: '导出Excel', show: proxy.$permission('allocationCalc:export'), event: exportData },
  ]
})
const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  api: null,
  fieldList: [
    { label: '核算期间', value: 'monthName' },
    { label: '源科室编码', value: 'sourceDeptCode' },
    { label: '源科室名称', value: 'sourceDeptName' },
    { label: '源科室核算属性', value: 'sourceDeptAtrName', width: 140 },
    { label: '源科室分摊级次', value: 'levelName', width: 140 },
    { label: '承担科室编码', value: 'deptCode' },
    { label: '承担科室名称', value: 'deptName' },
    { label: '承担科室核算属性', value: 'deptAtrName', width: 150 },
    { label: '成本项目编码', value: 'costItemCode' },
    { label: '成本项目名称', value: 'costItemName' },
    { label: '成本分类编码', value: 'costCategoryCode' },
    { label: '成本分类名称', value: 'costCategoryName' },
    { label: '资金来源编码', value: 'fundsource' },
    { label: '资金来源名称', value: 'fundsourceName' },
    { label: '是否直接成本', value: 'isDirectName' },
    { label: '分摊参数', value: 'paramName' },
    { label: '分摊参数值', value: 'spreadValue' },
    { label: '总参数值', value: 'spreadTotalValue' },
    { label: '分摊成本', value: 'costMoney', align: 'right' },
    { label: '承担成本', value: 'spreadCostMoney', align: 'right' },
  ],
  summaryFieldList: [
    { value: 'costMoney', formatter: proxy.$fn.TripartiteMethod },
    { value: 'spreadCostMoney', formatter: proxy.$fn.TripartiteMethod },
  ],
  data: [],
})
const detailsInfo = ref({
  visible: false,
})
const showDialog = computed({
  get() {
    return props.visible
  },
  set(newValue) {
    emit('update:visible', newValue) // 更新父组件visible
  },
})

onMounted(() => {
  tableInfo.value.api = costAccountqueryList
  filterInfo.value.query = {...props.params}
  getList()
})

function getList() {
  filterInfo.value.copyQuery = {
    ...filterInfo.value.query,
  }
  tableInfo.value.refresh = Math.random()
}
function returnBack() {
  emit('returnBack')
}

function exportData() {
  costAccountexportCostAccount(filterInfo.value.copyQuery).then(res => {
    if (res) {
      proxy.$fn.parseExcel(res)
    }
  })
}
</script>

<template>
  <div class="view-fill" v-if="!detailsInfo.visible">
    <div class="app-container-flex">
      <NewFullScreen
          v-model="showDialog"
          title="成本明细"
          @returnBack="returnBack"
      >
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
            :handle="tableInfo.handle"
        >
        </table-container>
      </NewFullScreen>
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>
