<script setup>
import {computed, getCurrentInstance, onMounted, reactive, ref} from "vue";
import ModifyPage from "@/components/ModifyPage/ModifyPage.vue";
import {
  costDetail,
  exportCostDetail,
} from "@/api/visitCost/hospitalCostCategoryTendency";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";

const PERMISSION_CODE = 'visitCost:hospitalCostCategoryTendency'
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
    cost: exportCostDetail,
  }
}
const FILTER_FIELD = {
  cost: [
    { label: '成本项目', value: 'costItemName', showLabel: true, type: 'slot', event: getList },
  ]
}
const TABLE_FIELD = {
  cost: [
    { label: '成本项目编码', value: 'costItemCode' },
    { label: '成本项目名称', value: 'costItemName' },
    { label: '成本分类', value: 'costCategoryName' },
    { label: '成本分类(成本大类)', value: 'rootCostCategoryName' },
  ]
}

const filterInfo = reactive({
  options: {
  },
  query: {
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
                row[it.accountingPeriodId + 'cost'] = it.cost
                row[it.accountingPeriodId + props.type + 'TrendRate'] = it[props.type + 'TrendRate']
              })
            })
            const details = data[0].details.slice(0, 20)
            tableInfo.fieldList = [
                ...TABLE_FIELD[props.type],
                ...details.map((it, index) => {
                  const field = {
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
</script>

<template>
  <ModifyPage v-model:visible="showDialog" no-full-button>
    <div class="filter-wrapper">
      <page-filter
          ref="filterRef"
          :listTypeInfo="filterInfo.options"
          v-model:query="filterInfo.query"
          :filter-list="filterInfo.list">
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