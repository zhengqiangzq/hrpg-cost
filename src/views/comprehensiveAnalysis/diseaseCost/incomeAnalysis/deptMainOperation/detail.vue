<script setup>
import {computed, getCurrentInstance, onMounted, reactive, ref} from "vue";
import ModifyPage from "@/components/ModifyPage/ModifyPage.vue";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {exportIncomeDeptMainOperationDetail, incomeDeptMainOperationDetail} from "@/api/diseaseCost/deptMainOperation";

const PERMISSION_CODE = 'disease:deptMainOperation'
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
  income: incomeDeptMainOperationDetail,
  export: {
    income: exportIncomeDeptMainOperationDetail,
  }
}
const FILTER_FIELD = {
  income: [
    { label: '住院号', value: 'hospitalAdmissionNumber', type: 'input', event: getList },
  ],
}
const TABLE_FIELD = {
  income: [
    { label: '住院号', value: 'hospitalAdmissionNumber' },
    { label: '病种编码', value: 'drgDefinitionCode' },
    { label: '病种名称', value: 'drgDefinitionName' },
    { label: '主要诊断代码', value: 'fcode' },
    { label: '主要诊断名称', value: 'fname' },
    { label: '主要手术代码', value: 'ecode' },
    { label: '主要手术名称', value: 'ename' },
    { label: '收费', value: 'income', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.income) },
    { label: '成本', value: 'cost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.cost) },
    { label: '收益', value: 'profit', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.profit) },
    { label: '收益率(%)', value: 'profitRate', align: 'center' },
  ],
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
</script>

<template>
  <ModifyPage v-model:visible="showDialog" no-full-button>
    <div class="filter-wrapper">
      <page-filter
          ref="filterRef"
          :listTypeInfo="filterInfo.options"
          v-model:query="filterInfo.query"
          :filter-list="filterInfo.list">
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
    ></table-container>
  </ModifyPage>
</template>

<style scoped lang="scss">

</style>