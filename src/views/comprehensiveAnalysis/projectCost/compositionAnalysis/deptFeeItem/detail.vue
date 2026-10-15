<script setup>
import {computed, getCurrentInstance, onMounted, reactive, ref} from "vue";
import ModifyPage from "@/components/ModifyPage/ModifyPage.vue";
import {
  costDetail,
  exportCostDetail,
} from "@/api/projectCost/deptFeeItemComposition";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {dict_dept_level} from "@/views/comprehensiveAnalysis/common/fakeDict";
import {sectiontree} from "@/api/accountingDepartment";

const PERMISSION_CODE = 'projectCost:deptFeeItemComposition'
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
    { label: '核算科室', value: 'deptName', showLabel: true, type: 'slot' },
    { label: '科室级次', value: 'level', type: 'select', clearable: false, required: true, list: 'deptLevel' },
    { label: '成本项目', value: 'costItemName', showLabel: true, type: 'slot', event: getList },
  ]
}
const TABLE_FIELD = {
  cost: [
    { label: '核算科室编码', value: 'deptCode' },
    { label: '核算科室名称', value: 'deptName' },
    { label: '服务项目编码', value: 'feeItemCode' },
    { label: '服务项目名称', value: 'feeItemName' },
    { label: '成本项目编码', value: 'costItemCode' },
    { label: '成本项目名称', value: 'costItemName' },
    { label: '成本分类', value: 'costCategoryName' },
    { label: '成本分类(成本大类)', value: 'topCostCategoryName' },
    { label: '成本属性', value: 'costAttribute' },
    { label: '金额', value: 'money', headAlign: 'center', align: 'right', formatter: row => proxy.$fn.TripartiteMethod(row.money) },
  ]
}

const filterInfo = reactive({
  options: {
    deptLevel: dict_dept_level
  },
  query: {
    level: dict_dept_level[dict_dept_level.length - 1].value,
  },
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
    level: dict_dept_level[dict_dept_level.length - 1].value,
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

function openFeeItemSelector() {
  tableParameter.title = '服务项目'
  tableParameter.type = 'feeItem'
  tableParameter.saveEmpty = false
  tableParameter.callBack = (raw) => {
    filterInfo.query.feeItemId = raw.id
    filterInfo.query.feeItemName = raw.name
  }
  openDialog(filterRef.value)
}

function openCostItemSelector() {
  tableParameter.type = 'ModelgetCostItem'
  tableParameter.checkBox = true
  tableParameter.saveEmpty = false
  tableParameter.callBack = (raw) => {
    filterInfo.query.costItemIds = raw.map(it => it.id)
    filterInfo.query.costItemName = raw.map(it => it.name).join(',')
  }
  openDialog(filterRef.value)
}

function openDeptSelector() {
  deptTreeInfo.checkBox = true
  deptTreeInfo.visible = true
}
function treeCallback(raw) {
  filterInfo.query.deptIds = raw.map(it => it.id)
  filterInfo.query.deptName = raw.map(it => it.name).join(',')
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
        <template #filter-feeItemName>
          <el-input
              v-model="filterInfo.query.feeItemName"
              class="not-mongolia" placeholder="请选择服务项目" :disabled="true"
          >
            <template #append><el-icon @click="openFeeItemSelector"><Search /></el-icon></template>
          </el-input>
        </template>
        <template #filter-deptName>
          <el-input
              v-model="filterInfo.query.deptName"
              class="not-mongolia" placeholder="请选择核算科室" :disabled="true">
            <template #append><el-icon @click="openDeptSelector"><Search /></el-icon></template>
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