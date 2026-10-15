<script setup>
import {computed, getCurrentInstance, onMounted, reactive, ref} from "vue";
import ModifyPage from "@/components/ModifyPage/ModifyPage.vue";
import {
  costDetail,
  exportCostDetail,
} from "@/api/deptCost/hospitalCostItemInterval";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {dict_cost_type, dict_dept_level, dict_income_type} from "@/views/comprehensiveAnalysis/common/fakeDict";
import {sectiontree} from "@/api/accountingDepartment";

const PERMISSION_CODE = 'dept:hospitalCostItemInterval'
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
  cost: costDetail,
  export: {
    cost: exportCostDetail
  }
}
const FILTER_FIELD = {
  cost: [
    { label: '核算科室', value: 'deptName', showLabel: true, type: 'slot', event: getList },
    { label: '科室级次', value: 'level', type: 'select', clearable: false, required: true, list: 'deptLevel' },
  ]
}
const TABLE_FIELD = {
  cost: [
    { label: '核算科室编码', value: 'deptCode' },
    { label: '核算科室名称', value: 'deptName' },
    { label: '成本项目编码', value: 'costItemCode' },
    { label: '成本项目名称', value: 'costItemName' },
    { label: '成本分类', value: 'costCategoryName' },
    { label: '成本分类(成本大类)', value: 'rootCostCategoryName' },
    { label: '成本属性', value: 'costAttribute' },
    { label: '分析区间', type: 'multiHeader', children: [
        { label: '本期金额', value: 'analysisCost', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.analysisCost) },
        { label: '本期占比(%)', value: 'analysisCostProportion', align: 'center' },
      ]
    },
    { label: '对比区间', type: 'multiHeader', children: [
        { label: '对比金额', value: 'compareCost', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.compareCost) },
        { label: '占比(%)', value: 'compareCostProportion', align: 'center' },
      ]
    },
    { label: '对比差异', value: 'compareCostDifference', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.compareCostDifference) },
    { label: '对比增长率(%)', value: 'compareRate', align: 'center' },
  ]
}

const filterInfo = reactive({
  query: {
    level: dict_dept_level[dict_dept_level.length - 1].value
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

// 核算科室
const deptTreeInfo = reactive({
  title: '核算科室',
  visible: false,
  checkBox: false,
  checkStrictly: true,
  isLeaf: false,
  mark: null,
  api: sectiontree,
  query: {}
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
  filterInfo.query = {
    level: dict_dept_level[dict_dept_level.length - 1].value
  }
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
  deptTreeInfo.checkBox = true
  deptTreeInfo.visible = true
}
function treeCallback(raw) {
  filterInfo.query.sectionIdList = raw.map(it => it.id)
  filterInfo.query.deptName = raw.map(it => it.name).join(',')
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
    <!--    查询核算科室-->
    <SelectDeptArchivesTree
        v-if="deptTreeInfo.visible"
        v-model:showDialog="deptTreeInfo.visible"
        :title="deptTreeInfo.title"
        :checkStrictly="deptTreeInfo.checkStrictly"
        :isLeaf="deptTreeInfo.isLeaf"
        :query="deptTreeInfo.query"
        :checkBox="deptTreeInfo.checkBox"
        :api="deptTreeInfo.api"
        :highlight-current="true"
        @callback="treeCallback" />
  </ModifyPage>
</template>

<style scoped lang="scss">

</style>
