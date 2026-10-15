<!-- 银行划款 - 列表页 -->
<script setup name="bankTransfer">
import Modify from './modify.vue'
import Details from './details.vue'
import { getCurrentInstance, onMounted, ref } from "vue"

const { proxy } = getCurrentInstance()
const PERMISSION_CODE = 'bankTransfer'
const filterInfo = ref({
  query: {
    start: '',
    end: '',
    docNum: '',
    settlementMethodName: '',
    settlementMethodId: '',
    outBankAccountName: '',
    outBankAccountId: '',
    inBankAccountName: '',
    inBankAccountId: '',
    docStatus: '',
    settleStatus: '',
  },
  list: [
    { label: '业务日期', value: 'start', type: 'daterange', startPlaceholder: '开始日期', endPlaceholder: '结束日期' },
    { label: '单据号', value: 'docNum', type: 'input' },
    { label: '结算方式', value: 'settlementMethodName', showLabel: true, type: 'slot' },
    { label: '转出银行账户', value: 'outBankAccountName', showLabel: true, type: 'slot' },
    { label: '转入银行账户', value: 'inBankAccountName', showLabel: true, type: 'slot' },
    { label: '单据状态', value: 'docStatus', type: 'select-model', code: 'cost_document_status' },
    { label: '结算状态', value: 'settleStatus', type: 'select-model', code: 'settle_status' },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: getList },
    { type: 'button', label: '重置', event: reset },
  ],
  btnList: [
    { type: 'button', label: '新增', show: proxy.$permission(`${PERMISSION_CODE}:add`), event: () => openModify() },
    { type: 'button', label: '删除', show: proxy.$permission(`${PERMISSION_CODE}:delete`), event: () => handleDelete() },
    { type: 'button', label: '银行划款导入', show: proxy.$permission(`${PERMISSION_CODE}:import`), event: () => importData() },
    { type: 'button', label: '导入日志', show: proxy.$permission(`${PERMISSION_CODE}:log`), event: () => openImportLog() },
    { type: 'button', label: '导入模版', show: proxy.$permission(`${PERMISSION_CODE}:template`), event: downloadTemplate },
    { type: 'button', label: '导出Excel', show: proxy.$permission(`${PERMISSION_CODE}:export`), event: exportData },
  ]
})

const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  api: null,
  fieldList: [
    { label: '序号', value: 'index', type: 'index', width: '60' },
    { label: '组织信息', value: 'organizationName' },
    { label: '单据号', value: 'docNum', type: 'slot' },
    { label: '业务日期', value: 'docTime' },
    { label: '结算方式', value: 'settlementMethod' },
    { label: '是否网银', value: 'isOnlineBanking' },
    { label: '转出银行账户', value: 'outBankAccount' },
    { label: '网银开通状态', value: 'onlineStatus' },
    { label: '转入银行账户', value: 'inBankAccount' },
    { label: '转账金额', value: 'transferMoney', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.transferMoney) },
    { label: '备注', value: 'remark' },
  ],
  data: [],
  handle: {
    fixed: 'right',
    label: '操作',
    width: '160',
    btList: [
      {
        label: '详情',
        show: true,
        event: detail,
      },
      {
        label: '删除',
        show: proxy.$permission(`${PERMISSION_CODE}:delete`),
        event: handleDelete,
        ifRender: (row) => row.docStatus === '0'
      },
      {
        label: '提交',
        show: proxy.$permission(`${PERMISSION_CODE}:submit`),
        event: submitData,
        ifRender: (row) => row.docStatus === '0'
      },
      {
        label: '编辑',
        show: proxy.$permission(`${PERMISSION_CODE}:update`),
        event: openModify,
        ifRender: (row) => row.docStatus !== '0'
      },
    ]
  },
  sectionRows: []
})

const dialogInfo = ref({
  visible: false,
  title: '银行划款'
})

const detailsInfo = ref({
  visible: false,
  id: ''
})

const importLogInfo = ref({
  visible: false
})

const filterRef = ref()

watch(() => tableInfo.value.sectionRows, (rows) => {
  const btns = filterInfo.value.btnList
  const deleteBtn = btns.filter((it) => it.label === '删除')[0]
  deleteBtn.disabled = !rows.length || !!rows.filter(row => row.docStatus !== '0').length
}, { immediate: true })

onMounted(() => {
  getList()
})

function getList() {
  filterInfo.value.copyQuery = {
    ...filterInfo.value.query,
  }
  tableInfo.value.refresh = Math.random()
}

function reset() {
  filterInfo.value.query = {
    start: '',
    end: '',
    docNum: '',
    settlementMethodName: '',
    settlementMethodId: '',
    outBankAccountName: '',
    outBankAccountId: '',
    inBankAccountName: '',
    inBankAccountId: '',
    docStatus: '',
    settleStatus: '',
  }
  getList()
}

const tableHandler = (eventName, raw) => {
  if (eventName === 'tableCheck') {
    tableInfo.value.sectionRows = raw
  }
}

function openModify(row) {
  dialogInfo.value.id = row?.id
  dialogInfo.value.title = `${!!row?.id ? '修改' : '新增'}银行划款`
  dialogInfo.value.visible = true
}

function detail(row) {
  detailsInfo.value.id = row.id
  detailsInfo.value.visible = true
}

function handleDelete(row) {
  const ids = row ? [row.id] : tableInfo.value.sectionRows.map(it => it.id)
  if (ids.length === 0) {
    return
  }
  const deleteCount = ids.length
  const message = deleteCount === 1 ? '删除后将改变数据,是否继续?' : `确定删除选中的 ${deleteCount} 条数据吗?`
  proxy
    .$confirm(message, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }).then(() => {
      proxy.$message.success('删除成功')
      getList()
    })
}

function submitData(row) {
  proxy.$confirm('确定提交该数据?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    proxy.$message.success('提交成功')
    getList()
  })
}

function importData() {
  proxy.$message.info('请选择要导入的文件')
}

function openImportLog() {
  importLogInfo.value.visible = true
}

function downloadTemplate() {
  proxy.$message.success('下载模板成功')
}

function exportData() {
  proxy.$message.success('导出成功')
}

function openSettlementMethodSelector() {
  proxy.$message.info('请选择结算方式')
}

function openOutBankAccountSelector() {
  proxy.$message.info('请选择转出银行账户')
}

function openInBankAccountSelector() {
  proxy.$message.info('请选择转入银行账户')
}
</script>

<template>
  <div class="app-container">
    <div class="layui-card layui-col-md12" v-show="!detailsInfo.visible && !dialogInfo.visible && !importLogInfo.visible">
      <div class="layui-card-body">
        <div class="titleTab">
          <div class="tab currentTab">列表页</div>
        </div>
        <div>
          <div class="filter-wrapper">
            <NewPageFilter
              ref="filterRef"
              v-model:query="filterInfo.query"
              :filter-list="filterInfo.list"
              :filter-btn="filterInfo.filterbtn"
            >
              <template #filter-settlementMethodName>
                <el-input
                  v-model="filterInfo.query.settlementMethodName"
                  class="not-mongolia"
                  type="input"
                  placeholder="请选择结算方式"
                  :disabled="true"
                >
                  <template #append>
                    <el-icon @click="openSettlementMethodSelector"><Search /></el-icon>
                  </template>
                </el-input>
              </template>
              <template #filter-outBankAccountName>
                <el-input
                  v-model="filterInfo.query.outBankAccountName"
                  class="not-mongolia"
                  type="input"
                  placeholder="请选择转出银行账户"
                  :disabled="true"
                >
                  <template #append>
                    <el-icon @click="openOutBankAccountSelector"><Search /></el-icon>
                  </template>
                </el-input>
              </template>
              <template #filter-inBankAccountName>
                <el-input
                  v-model="filterInfo.query.inBankAccountName"
                  class="not-mongolia"
                  type="input"
                  placeholder="请选择转入银行账户"
                  :disabled="true"
                >
                  <template #append>
                    <el-icon @click="openInBankAccountSelector"><Search /></el-icon>
                  </template>
                </el-input>
              </template>
            </NewPageFilter>
          </div>
          <div class="filter-wrapper">
            <NewPageFilter :filter-btn="filterInfo.btnList"></NewPageFilter>
          </div>
        </div>
        <table-container
          :refresh="tableInfo.refresh"
          :init-curpage="tableInfo.initCurpage"
          v-model:data="tableInfo.data"
          :api="tableInfo.api"
          :query="filterInfo.copyQuery"
          :tabIndex="true"
          :field-list="tableInfo.fieldList"
          :handle="tableInfo.handle"
          @handleEvent="tableHandler"
        >
          <template #col-docNum="{ row }">
            <span class="slip-edit" @click="detail(row)">{{ row.docNum }}</span>
          </template>
        </table-container>
      </div>
    </div>
    <Modify
      v-if="dialogInfo.visible"
      :id="dialogInfo.id"
      v-model:visible="dialogInfo.visible"
      :title="dialogInfo.title"
      @returnModify="getList"
    />
    <Details
      v-if="detailsInfo.visible"
      :id="detailsInfo.id"
      v-model:visible="detailsInfo.visible"
      @returnBack="detailsInfo.visible = false"
    />
  </div>
</template>