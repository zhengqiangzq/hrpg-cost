<script setup>
import {computed, getCurrentInstance, onMounted, reactive, ref} from "vue";
import ModifyPage from "@/components/ModifyPage/ModifyPage.vue";
import {
  incomeDetail,
  exportIncomeDetail,
  costDetail,
  exportCostDetail,
} from "@/api/deptCost/hospitalBalanceTendency";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {dict_dept_level} from "@/views/comprehensiveAnalysis/common/fakeDict";
import {sectiontree} from "@/api/accountingDepartment";

const PERMISSION_CODE = 'dept:hospitalBalanceTendency'
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
    cost: exportCostDetail,
  }
}
const FILTER_FIELD = {
  income: [
    { label: '收入项目', value: 'incomeProjectName', showLabel: true, type: 'slot', event: getList },
  ],
  cost: [
    { label: '成本项目', value: 'costItemName', showLabel: true, type: 'slot', event: getList },
  ]
}
const TABLE_FIELD = {
  income: [
    { label: '核算科室编码', value: 'deptCode' },
    { label: '核算科室名称', value: 'deptName' },
    { label: '收入项目', value: 'incomeProjectName' },
  ],
  cost: [
    { label: '核算科室编码', value: 'deptCode' },
    { label: '核算科室名称', value: 'deptName' },
    { label: '成本项目编码', value: 'costItemCode' },
    { label: '成本项目名称', value: 'costItemName' },
    { label: '成本分类(成本大类)', value: 'rootCostCategoryName' },
  ]
}

const filterInfo = reactive({
  options: {
    deptLevel: dict_dept_level
  },
  query: {
    level: props.query.level || '2'
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

const selectIncomeProject = ref({
  visible: false,
  saveEmpty: true,
  query: {},
  checkedKey: {},
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
  tableInfo.api = (params) => {
    return new Promise((resolve, reject) => {
      API[props.type](params).then(res => {
        if (res.success) {
          const data = res.data
          if (data.length > 0) {
            data.forEach(row => {
              row.details.forEach(it => {
                if (props.type === 'income') {
                  row[it.accountingPeriodId + 'money'] = it.money
                } else {
                  row[it.accountingPeriodId + 'cost'] = it.cost
                }
                row[it.accountingPeriodId + props.type + 'TrendRate'] = it[props.type + 'TrendRate']
              })
            })
            const details = data[0].details.slice(0, 20)
            tableInfo.fieldList = [
                ...TABLE_FIELD[props.type],
                ...details.map((it, index) => {
                  const field = {
                    income: { label: '收入', value: it.accountingPeriodId + 'money', formatter: row => proxy.$fn.TripartiteMethod(row[it.accountingPeriodId + 'money']) },
                    cost: { label: '成本', value: it.accountingPeriodId + 'cost', formatter: row => proxy.$fn.TripartiteMethod(row[it.accountingPeriodId + 'cost']) },
                  }
                  let children = [
                    { ...field[props.type], headAlign: 'center', align: 'right' },
                  ]
                  if (index > 0) {
                    children.push({ label: '增长率(%)', value: it.accountingPeriodId + props.type + 'TrendRate', align: 'center' })
                  }
                  return { label: it.accountingPeriodName, type: 'multiHeader', children }
                })
            ]
          }
        }
        resolve(res)
      }).catch(err => {
        console.error(err)
        reject(err)
      })
    })
  }
  getList()
})

function getList() {
  tableInfo.refresh = Math.random()
}

function reset() {
  filterInfo.query = {
    level: props.query.level || '2'
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

function openCostItemSelector() {
  tableParameter.type = 'costItem'
  tableParameter.checkBox = true
  tableParameter.saveEmpty = false
  tableParameter.callBack = (raw) => {
    filterInfo.query.costItemIdList = raw.map(it => it.id)
    filterInfo.query.costItemName = raw.map(it => it.name).join(',')
  }
  openDialog(filterRef.value)
}

function openDeptSelector() {
  deptTreeInfo.checkBox = true
  deptTreeInfo.visible = true
}
function treeCallback(raw) {
  filterInfo.query.sectionIdList = raw.map(it => it.id)
  filterInfo.query.sectionName = raw.map(it => it.name).join(',')
}

function openIncomeProjectSelector() {
  selectIncomeProject.value.checkBox = true
  selectIncomeProject.value.visible = true
}
function selectIncomeProjectCallback(raw) {
  filterInfo.query.incomeProjectIdList = raw.map(it => it.id)
  filterInfo.query.incomeProjectName = raw.map(it => it.name).join(',')
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
        <template #filter-incomeProjectName>
          <el-input
              v-model="filterInfo.query.incomeProjectName"
              class="not-mongolia" placeholder="请选择收入项目" :disabled="true"
          >
            <template #append><el-icon @click="openIncomeProjectSelector"><Search /></el-icon></template>
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
    <SelectIncomeProject
        v-if="selectIncomeProject.visible"
        v-model:query="selectIncomeProject.query"
        v-model:show-dialog="selectIncomeProject.visible"
        title="收入项目"
        :checkStrictly="true"
        :check-box="selectIncomeProject.checkBox"
        :isLeaf="false"
        :highlightCurrent="true"
        :checkedKey="selectIncomeProject.checkedKey"
        :saveEmpty="selectIncomeProject.saveEmpty"
        @callback="selectIncomeProjectCallback"
    ></SelectIncomeProject>
  </ModifyPage>
</template>

<style scoped lang="scss">

</style>
