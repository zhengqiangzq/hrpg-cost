<script setup>
import {getCurrentInstance, onMounted, reactive, watch} from "vue";
import {costDetail, exportCostDetail, exportIncomeDetail, incomeDetail} from "@/api/deptCost/contributionVisitCost";
import ModifyPage from "@/components/ModifyPage/ModifyPage.vue";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";

const PERMISSION_CODE = 'visitCost:marginalContributionAnalysis'

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
    {label: '收费项目', value: 'feeName', showLabel: true, type: 'slot', event: getList},
  ],
  cost: [
    {label: '成本项目', value: 'costItemName', showLabel: true, type: 'slot', event: getList},
  ]
}
const TABLE_FIELD = {
  income: [
    {label: '核算科室编码', value: 'deptCode'},
    {label: '核算科室名称', value: 'deptName'},
    { label: '收费项目编码', value: 'feeCode' },
    { label: '收费项目名称', value: 'feeName' },
    {label: '收费类别', value: 'feeCategoryName'},
    {label: '收入项目', value: 'incomeProjectName'},
    {
      label: '数量',
      value: 'qty',
      headAlign: 'center',
      align: 'right',
      formatter: row => proxy.$fn.TripartiteMethod(row.qty)
    },
    {
      label: '总收入',
      value: 'income',
      headAlign: 'center',
      align: 'right',
      formatter: row => proxy.$fn.TripartiteMethod(row.income)
    },
    {
      label: '单价',
      value: 'price',
      headAlign: 'center',
      align: 'right',
      formatter: row => proxy.$fn.TripartiteMethod(row.price)
    },
    {
      label: '占比',
      value: 'rate',
      headAlign: 'center',
      align: 'right',
    },
  ],
  cost: [
    {label: '核算科室编码', value: 'deptCode'},
    {label: '核算科室名称', value: 'deptName'},
    {label: '成本项目编码', value: 'costItemCode'},
    {label: '成本项目名称', value: 'costItemName'},
    {label: '成本分类(大类)', value: 'rootCostCategoryName'},
    {label: '成本属性', value: 'costAttributeName'},
    {
      label: '直接成本',
      value: 'directCost',
      headAlign: 'center',
      align: 'right',
      formatter: row => proxy.$fn.TripartiteMethod(row.directCost)
    },
    {
      label: '间接成本',
      value: 'indirectCost',
      headAlign: 'center',
      align: 'right',
      formatter: row => proxy.$fn.TripartiteMethod(row.indirectCost)
    },
    {
      label: '总成本',
      value: 'totalCost',
      headAlign: 'center',
      align: 'right',
      formatter: row => proxy.$fn.TripartiteMethod(row.totalCost)
    },
    {
      label: '占比(%)',
      value: 'rate',
      headAlign: 'center',
      align: 'right',
    },
  ]
}

const filterInfo = reactive({
  copyQuery: {},
  query: {},
  list: [
    ...FILTER_FIELD[props.type],
  ],
  filterbtn: [
    {type: 'button', label: '查询', btType: 'primary', event: getList,},
    {type: 'button', label: '重置', event: reset,},
  ],
  btnList: [
    {
      type: 'button',
      label: '导出Excel',
      show: proxy.$permission(`${PERMISSION_CODE}:export`),
      event: () => exportData()
    }
  ]
})
const tableInfo = reactive({
  refresh: 1,
  api: null,
  fieldList: TABLE_FIELD[props.type],
  data: [],
})

const filterRef = ref()
const {tableParameter, openDialog} = useSelectTableData()

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

function openFeeItemSelector() {
  tableParameter.type = 'feeItem'
  tableParameter.checkBox = false
  tableParameter.saveEmpty = false
  tableParameter.callBack = (raw) => {
    filterInfo.query.feeItemId = raw.id
    filterInfo.query.feeName = raw.name
  }
  openDialog(filterRef.value)
}

function openCostItemSelector() {
  tableParameter.type = 'costItem'
  tableParameter.checkBox = false
  tableParameter.saveEmpty = false
  tableParameter.callBack = (raw) => {
    filterInfo.query.costItemId = raw.id
    filterInfo.query.costItemName = raw.name
    // filterInfo.query.costItemIdList = raw.map(it => it.id)
    // filterInfo.query.costItemName = raw.map(it => it.name).join(',')
  }
  openDialog(filterRef.value)
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
        <template #filter-feeName>
          <el-input
              v-model="filterInfo.query.feeName"
              class="not-mongolia" placeholder="请选择费用项目" :disabled="true"
          >
            <template #append>
              <el-icon @click="openFeeItemSelector">
                <Search/>
              </el-icon>
            </template>
          </el-input>
        </template>
        <template #filter-costItemName>
          <el-input
              v-model="filterInfo.query.costItemName"
              class="not-mongolia" placeholder="请选择成本项目" :disabled="true"
          >
            <template #append>
              <el-icon @click="openCostItemSelector">
                <Search/>
              </el-icon>
            </template>
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
  </ModifyPage>
</template>

<style scoped lang="scss">

</style>
