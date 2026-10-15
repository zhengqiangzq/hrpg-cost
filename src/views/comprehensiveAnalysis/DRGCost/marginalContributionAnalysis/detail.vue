<script setup>
import {getCurrentInstance, onMounted, reactive, watch} from "vue";
import {exportIncomeDetail, incomeDetail} from "@/api/deptCost/contributionDrg";
import ModifyPage from "@/components/ModifyPage/ModifyPage.vue";
import {
  sectiontree,
} from "@/api/accountingDepartment";

const PERMISSION_CODE = 'drg:marginalContributionAnalysis'

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


const filterInfo = reactive({
  copyQuery: {},
  query: {},
  list: [
    { label: '患者信息', value: 'patientName', showLabel: true, type: 'input' },
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
  fieldList: [
    { label: '住院号', value: 'hospitalAdmissionNumber' },
    { label: '患者姓名', value: 'patientName' },
    { label: '核算科室编码', value: 'deptCode' },
    { label: '核算科室名称', value: 'deptName' },
    { label: '住院床日', value: 'totalDays' },
    { label: '总收入', value: 'income', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.income) },
    { label: '总成本', value: 'cost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.cost) },
    { label: '收益', value: 'profit', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.profit) },
    { label: '收益率(%)', value: 'profitRate', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.profitRate) },
  ],
  data: [],
})
// 核算科室
const depttreeInfo = ref({
  title: '核算科室',
  visible: false,
  checkBox: false,
  checkStrictly: false,
  isLeaf: false,
  api: sectiontree,
  query: {}
})

const filterRef = ref()

const tableQuery = computed(() => {
  return {
    ...props.query,
    ...filterInfo.query
  }
})
onMounted(() => {
  tableInfo.api = incomeDetail
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
  exportIncomeDetail(tableQuery.value).then((resp) => {
    if (resp) {
      proxy.$fn.parseExcel(resp)
    }
  })
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
