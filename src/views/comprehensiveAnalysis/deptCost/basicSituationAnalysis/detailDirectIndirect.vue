<script setup>
import {getCurrentInstance, onMounted, reactive, watch} from "vue";
import {
  basicdeptDirectCostDetail,
  basicdeptIndirectCostDetail,
  basicexportDeptDirectCostDetail,
  basicexportDeptIndirectCostDetail,
} from "@/api/deptCost/basicSituationAnalysis";
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
  direct: basicdeptDirectCostDetail,
  indirect: basicdeptIndirectCostDetail,
  export: {
    direct: basicexportDeptDirectCostDetail,
    indirect: basicexportDeptIndirectCostDetail
  }
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
  fieldList: [
    { label: '核算科室编码', value: 'deptCode' },
    { label: '核算科室名称', value: 'deptName' },
    { label: '成本分类', value: 'costCategoryName' },
    { label: '成本项目编码', value: 'costItemCode' },
    { label: '成本项目名称', value: 'costItemName' },
    { label: '成本类型', value: 'costTypeName' },
    { label: '源科室编码', value: 'sourceDeptCode' },
    { label: '源科室名称', value: 'sourceDeptName' },
    { label: '金额', value: 'cost', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.cost) },
  ],
  data: [],
})


onMounted(() => {
  getList()
})

function getList() {
  tableInfo.api = API[props.type];
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
