<script setup>
import {getCurrentInstance, onMounted, reactive, watch} from "vue";
import {deletePullDataLog, pullDataLog} from "@/api/incomeData";
import { exportExcel } from "@/api/pub.js"

const { proxy } = getCurrentInstance()
const emits = defineEmits(['returnBack'])

const props = defineProps({
  businessType: null,
  noReturn: {
    type: Boolean,
    default: false
  }
})

const filterInfo = reactive({
  query: {},
  listTypeInfo: {
    status: [
      { key: '采集成功', value: 0 },
      { key: '采集中', value: 1 },
      { key: '采集失败', value: 2 },
    ]
  },
  list: [
    {
      type: 'date',
      label: '开始时间',
      value: 'date',
      event: getList,
    },
    {
      type: 'select',
      list: 'status',
      label: '状态',
      value: 'status',
      event: getList,
    },
  ],
  searchBtn: [
    { type: 'button', label: '查询', event: getList },
    { type: 'button', label: '重置', event: reset },
  ],
  btnList: [
  ]
})
const tableInfo = reactive({
  initCurpage: 1,
  refresh: 1,
  api: null,
  data: [],
  sections: [],
  fieldList: [
    { label: '执行期间', value: 'periodMonth' },
    { label: '业务类型', value: 'businessTypeName' },
    { label: '开始时间', value: 'createTime' },
    { label: '结束时间', value: 'updateTime' },
    { label: '执行说明', value: 'remark' },
    { label: '状态', value: 'statusName' },
    { label: '操作人', value: 'createUserName' },
  ],
  handle: null
})

onMounted(() => {
  tableInfo.api = pullDataLog
  reset()
})

function getList() {
  const times = (filterInfo.query.date || ',').split(',')
  filterInfo.copyQuery = {
    ...filterInfo.query,
    createTimeEqAndGre: times[0] ? `${times[0]} 00:00:00` : null,
    updateTimeEqAndLes: times[1] ? `${times[1]} 23:59:59` : null,
    date: undefined,
    sort : "create_time desc,id asc",
    businessTypeLike: props.businessType
  }
  tableInfo.refresh = Math.random()
}
function reset() {
  filterInfo.query = {
    businessTypeLike: props.businessType
  }
  getList()
}

function deleteData(rows) {
  let ids = rows ? [rows.id] : tableInfo.sections.map(row => row.id)
  proxy
      .$confirm('删除后将改变数据,是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
      .then(() => {
        deletePullDataLog(ids).then(res => {
          if (res && res.success) {
            getList()
          }
        })
      })
}


function handleEvent(event, data) {
  switch (event) {
    case 'tableCheck':
      tableInfo.sections = data
      break
  }
}

function returnBack() {
  emits('returnBack')
}
</script>

<template>
  <div class="app-container-flex">
    <NewFullScreen
      title="执行日志"
      @returnBack="returnBack"
    >
      <div class="filter-wrapper">
        <NewPageFilter
            v-model:query="filterInfo.query"
            :query-more-json="false"
            :filter-list="filterInfo.list"
            :filter-btn="filterInfo.searchBtn"
            :listTypeInfo="filterInfo.listTypeInfo"
        >
        </NewPageFilter>
      </div>
      <div class="filter-wrapper" style="display: flex;">
        <NewPageFilter :filter-btn="filterInfo.btnList">
        </NewPageFilter>
      </div>
      <TableContainer
          :refresh="tableInfo.refresh"
          :init-curpage="tableInfo.initCurpage"
          :query="filterInfo.copyQuery"
          v-model:data="tableInfo.data"
          :api="tableInfo.api"
          :pager="true"
          :check-box="true"
          :tab-index="true"
          :field-list="tableInfo.fieldList"
          :handle="tableInfo.handle"
          @handleEvent="handleEvent"
      >
      </TableContainer>
    </NewFullScreen>
  </div>
</template>

<style scoped lang="scss">
.app-container-flex {
  width: 100%;
  height: 100%;
  flex-direction: column;
}
</style>
