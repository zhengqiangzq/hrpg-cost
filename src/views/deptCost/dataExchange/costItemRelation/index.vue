<!-- 成本项目关系 -->
<script setup name="costItemRelation">
import {onMounted, watch} from "vue";
import {
  deleteCostItemRelation,
  exportCostItemRelation,
  pageCostItemRelationpage,
} from "@/api/costItemRelation";
import { exportTemplateExcel } from '@/api/pub.js'
import AddDetail from "./addDetail.vue";
import useUploadExcel from "@/components/UploadExcel/useUploadExcel";
const {proxy} = getCurrentInstance()

const { uploadExcelBtns } = useUploadExcel({
  PERMISSION_CODE: 'costItemRelation',
  BUTTON_CODE: 'upload',
  type: '13038',
  action: '/costItemAccountRelation/import/excelRecord',
})

const filterInfo = ref({
  query: {
  },
  list: [
    { label: '会计科目', value: 'accountName', showLabel: true, type: 'slot' },
    { label: '成本项目', value: 'costItemName', showLabel: true, type: 'slot' },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', event: reset, },
  ],
  btnList: [
    { type: 'button', btType: 'primary', label: '新增', show: proxy.$permission('costItemRelation:read'), event: readData },
    { type: 'button', label: '删除', show: proxy.$permission('costItemRelation:delete'), event: () => deleteData() },
    { type: 'button', label: '下载模板', show: proxy.$permission('costItemRelation:download'), event: downloadTemplate },
    ...uploadExcelBtns,
    { type: 'button', label: '导出Excel', show: proxy.$permission('costItemRelation:export'), event: exportData },
  ]
})
const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  api: null,
  fieldList: [
    { label: '科目编码', value: 'accountCode' },
    { label: '科目名称', value: 'accountName' },
    { label: '成本项目编码', value: 'costItemCode' },
    { label: '成本项目名称', value: 'costItemName' },
    { label: '资金来源', value: 'fundSourceValue' },
  ],
  summaryFieldList: [
  ],
  data: [],
  handle: {
    fixed: 'right',
    label: '操作',
    width: '130',
    btList: [
      {
        label: '编辑',
        show: proxy.$permission('costItemRelation:read'),
        event: openModify,
      },
      {
        label: '删除',
        show: proxy.$permission('costItemRelation:delete'),
        event: deleteData,
      },
    ]
  },
  sectionRows: []
})

const filterRef = ref()
const accassInfo = ref({
  visible: false,
  type: '',
  title: '会计科目',
  checkBox: false,
  callback: null,
  fieldList: [],
  query: {}
})
const tableParameter = ref({
  visible: false,
  type: 'costItem',
  title: '成本项目',
  checkBox: true,
  callback: null,
  fieldList: [],
  filters: [
    { type: 'input', label: '编码/名称', value: 'name' },
  ],
  query: {
    last: true,
  },
  checkedList: []
})
const dialogInfo = ref({
  visible: false,
  title: '成本项目关系'
})

watch(() => tableInfo.value.sectionRows, (rows) => {
  const btns = filterInfo.value.btnList
  const deleteBtn = btns.filter((it) => it.label === '删除')[0]
  deleteBtn.disabled = !rows.length
}, { immediate: true })

onMounted(async () => {
  tableInfo.value.api = pageCostItemRelationpage
  getList()
})

function getList() {
  filterInfo.value.copyQuery = {
    ...filterInfo.value.query
  }
  tableInfo.value.refresh = Math.random()
}
function reset() {
  filterInfo.value.query = {
  }
  getList()
}
const tableHandler = (eventName, raw) => {
  if (eventName === 'tableCheck') {
    tableInfo.value.sectionRows = raw
  }
  if(eventName === 'list') {
    handleData()
  }
}

// 处理数据
function handleData() {
  let header = []
  tableInfo.value.data.forEach((it) => {
    it.accassItemList && it.accassItemList.forEach((item) => {
      const flag = header && header.filter(head => head.value === item.name)[0]
      it[item.name] = item.accassValue ? item.accassValueCode + '/' + item.accassValue : '';
      if(!flag && item.id) {
        header.push({
          label: item.name,
          value: item.name,
        })
      }
    })
  })
  const hears = [
    { label: '科目编码', value: 'accountCode' },
    { label: '科目名称', value: 'accountName' },
    { label: '成本项目编码', value: 'costItemCode' },
    { label: '成本项目名称', value: 'costItemName' },
    { label: '资金来源', value: 'fundSourceValue' },
  ]
  hears.splice(2, 0, ...header)
  tableInfo.value.fieldList = hears

}

// 新增明细
const addDetailInfo = ref({
  visible: false,
  row: null
})
function readData() {
  addDetailInfo.value.row = {};
  addDetailInfo.value.title = '新增成本项目关系';
  addDetailInfo.value.visible = true;
}

function openModify(row) {
  addDetailInfo.value.row = row;
  addDetailInfo.value.title = '修改成本项目关系';
  addDetailInfo.value.visible = true;
}

function deleteData(row) {
  const ids = row ? [row.id] : tableInfo.value.sectionRows.map(it => it.id)
  if (ids.length === 0) {
    return
  }
  proxy
      .$confirm('删除后将改变数据,是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
    deleteCostItemRelation(ids).then(({ code }) => {
      if (code === 200) {
        proxy.$message.success('删除成功')
        getList()
      }
    })
  })
}

function exportData() {
  exportCostItemRelation(filterInfo.value.copyQuery).then(res => {
    if (res) {
      proxy.$fn.parseExcel(res)
    }
  })
}



function openAccountingSubjectsSelector() {
  accassInfo.value.title = '会计科目'
  accassInfo.value.type = 'costItemgetAccount'
  accassInfo.value.callBack = accountingSubjectsCallback
  accassInfo.value.visible = true
  filterRef.value.openDialog(accassInfo.value, 'table')
}

function accountingSubjectsCallback(raw) {
  filterInfo.value.query.accountId = raw.accountId
  filterInfo.value.query.accountName = raw.accountName
}
function openCostItemSelector() {
  tableParameter.value.visible = true
  tableParameter.value.callBack = costItemCallback
  filterRef.value.openDialog(tableParameter.value, 'table')
}
function costItemCallback(raw) {
  tableParameter.value.checkedList = raw
  filterInfo.value.query.costItemId = raw.map((it) => it.id).join(',')
  filterInfo.value.query.costItemName = raw.map((it) => it.name).join(',')
}

function addDetailCallback(raw) {
  addDetailInfo.value.visible = false
  if (!raw) return
    getList()
}

function downloadTemplate() {
  exportTemplateExcel('costItemAccountRelationTemplate').then((res) => {
    if (res) {
      proxy.$fn.parseExcel(res, '成本项目关系导入模板')
    }
  })
}

</script>

<template>
  <div class="app-container">
    <div class="layui-card layui-col-md12">
      <div class="layui-card-body">
        <!-- 条件栏 -->
        <div class="filter-wrapper">
          <NewPageFilter
              ref="filterRef"
              v-model:query="filterInfo.query"
              :filter-list="filterInfo.list"
              :filter-btn="filterInfo.filterbtn"
          >
            <template #filter-accountName>
              <el-input
                  v-model="filterInfo.query.accountName"
                  class="not-mongolia"
                  type="input"
                  placeholder="请选择会计科目"
                  :disabled="true"
              >
                <template #append>
                  <el-icon @click="openAccountingSubjectsSelector"><Search /></el-icon>
                </template>
              </el-input>
            </template>
            <template #filter-costItemName>
              <el-input
                  v-model="filterInfo.query.costItemName"
                  class="not-mongolia"
                  type="input"
                  placeholder="请选择成本项目"
                  :disabled="true"
              >
                <template #append>
                  <el-icon @click="openCostItemSelector"><Search /></el-icon>
                </template>
              </el-input>
            </template>
          </NewPageFilter>
        </div>
        <div class="filter-wrapper">
          <!-- 条件栏 -->
          <NewPageFilter :filter-btn="filterInfo.btnList">
          </NewPageFilter>
        </div>
        <!-- 表格 -->
        <table-container
            :refresh="tableInfo.refresh"
            :init-curpage="tableInfo.initCurpage"
            v-model:data="tableInfo.data"
            :api="tableInfo.api"
            :query="filterInfo.copyQuery"
            :summary="false"
            :summaryFieldList="tableInfo.summaryFieldList"
            :tabIndex="true"
            :pager="true"
            :check-box="true"
            :field-list="tableInfo.fieldList"
            :handle="tableInfo.handle"
            @handleEvent="tableHandler"
        >
        </table-container>
      </div>
    </div>
    <AddDetail
        :title="addDetailInfo.title"
        :table-row="addDetailInfo.row"
        :visible="addDetailInfo.visible"
        @callback="addDetailCallback"
    />
  </div>
</template>

<style scoped lang="scss">

</style>
