<script setup>
import {computed, getCurrentInstance, onMounted, reactive, ref} from "vue";
import ModifyPage from "@/components/ModifyPage/ModifyPage.vue";
import {
  incomeDetail,
  exportIncomeDetail,
} from "@/api/deptCost/deptIncomeTendency";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";

const PERMISSION_CODE = 'dept:deptIncomeTendency'
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
  export: {
    income: exportIncomeDetail,
  }
}
const FILTER_FIELD = {
  income: [
    { label: '收费项目', value: 'feeItemName', showLabel: true, type: 'slot', event: getList },
  ]
}
const TABLE_FIELD = {
  income: [
    { label: '核算科室编码', value: 'deptCode' },
    { label: '核算科室名称', value: 'deptName' },
    { label: '收费项目编码', value: 'feeItemCode' },
    { label: '收费项目名称', value: 'feeItemName' },
    { label: '收费分类', value: 'feeCategoryName' },
    { label: '收入项目', value: 'incomeProjectName' },
  ]
}

const filterInfo = reactive({
  options: {
  },
  query: {
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
                row[it.accountingPeriodId + 'money'] = it.money
                row[it.accountingPeriodId + props.type + 'TrendRate'] = it[props.type + 'TrendRate']
              })
            })
            const details = data[0].details.slice(0, 20)
            tableInfo.fieldList = [
                ...TABLE_FIELD[props.type],
                ...details.map((it, index) => {
                  const field = {
                    income: { label: '收入', value: it.accountingPeriodId + 'money', formatter: row => proxy.$fn.TripartiteMethod(row[it.accountingPeriodId + 'money']) },
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
  tableParameter.type = 'feeItem'
  tableParameter.checkBox = true
  tableParameter.saveEmpty = false
  tableParameter.callBack = (raw) => {
    filterInfo.query.feeItemIdList = raw.map(it => it.id)
    filterInfo.query.feeItemName = raw.map(it => it.name).join(',')
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
        <template #filter-feeItemName>
          <el-input
              v-model="filterInfo.query.feeItemName"
              class="not-mongolia" placeholder="请选择收费项目" :disabled="true">
            <template #append><el-icon @click="openFeeItemSelector"><Search /></el-icon></template>
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
