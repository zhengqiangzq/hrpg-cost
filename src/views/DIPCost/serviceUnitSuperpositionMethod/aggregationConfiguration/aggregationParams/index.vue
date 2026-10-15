<!-- 归集参数 -->
<script setup name="DIPCostAggregationParams">
import {getCurrentInstance, onMounted, reactive, watch} from "vue";
import cloneDeep from "lodash/cloneDeep";
import {exportTemplateExcel} from "@/api/pub";
import {
  addAggregationParams, batchUpdateAggregationParams,
  deleteAggregationParams, exportAggregationParams,
  pageAggregationParams,
  updateAggregationParams
} from "@/api/DIPCost/DIPCostAggregationParams";
import {useUpload} from "@/hooks/useUpload";
import useUploadExcel from "@/components/UploadExcel/useUploadExcel";

const { proxy } = getCurrentInstance()
const PERMISSION_CODE = 'DIPCostAggregationParams'
const API = {
  query: pageAggregationParams,
  add: addAggregationParams,
  update: updateAggregationParams,
  batchUpdate: batchUpdateAggregationParams,
  delete: deleteAggregationParams,
  download: exportTemplateExcel,
  export: exportAggregationParams
}
const TEMPLATE_NAME = '归集参数导入模板'
const UPLOAD_PATH = '/dip/methodService/apportionService/import/excel'

const {
  downloadTemplate, exportData
} = useUpload(API, TEMPLATE_NAME, UPLOAD_PATH, () => getList(), 'DIPCostAggregationParams:import')

const { uploadExcelBtns } = useUploadExcel({
  PERMISSION_CODE: 'DIPCostAggregationParams',
  type: '13112',
  action: '/dip/methodService/apportionService/import/excelRecord',
})
const filterInfo = reactive({
  query: {},
  copyQuery: {},
  list: [
    { label: '归集参数编码', value: 'codeLike', type: 'input' },
    { label: '归集参数名称', value: 'nameLike', type: 'input' },
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', btType: 'primary', event: reset, },
  ],
  btnList: [
    { type: 'button', label: '新增', show: proxy.$permission(`${PERMISSION_CODE}:add`), event: () => openModify(), },
    { type: 'button', label: '删除', show: proxy.$permission(`${PERMISSION_CODE}:delete`), event: () => deleteData(), },
    { type: 'button', label: '启用', show: proxy.$permission(`${PERMISSION_CODE}:enable`), event: () => enableRow(), },
    { type: 'button', label: '停用', show: proxy.$permission(`${PERMISSION_CODE}:enable`), event: () => disabledRow(), },
    { type: 'button', label: '下载模板', show: proxy.$permission(`${PERMISSION_CODE}:download`), event: () => downloadTemplate('','DIPCostAggregationParams:download'), },
    ...uploadExcelBtns,
    { type: 'button', label: '导出Excel', show: proxy.$permission(`${PERMISSION_CODE}:export`), event: () => exportData(filterInfo.copyQuery), },
  ]
})
const tableInfo = reactive({
  initCurPage: 1,
  refresh: 1,
  fieldList: [
    { label: '归集参数编码', value: 'code' },
    { label: '归集参数名称', value: 'name' },
    { label: '启用状态', value: 'statusValue' },
    { label: '是否内置', value: 'sysFlagValue' },
    { label: 'sql', value: 'executeQuerySql' },
    { label: '备注', value: 'remark' },
  ],
  data: [],
  handle: {
    fixed: 'right',
    label: '操作',
    width: '130',
    btList: [
      {
        label: '编辑',
        show: proxy.$permission(`${PERMISSION_CODE}:update`),
        event: openModify,
        ifRender: (row) => row.status === '0' && row.sysFlag == '0'
      },
      {
        label: '删除',
        show: proxy.$permission(`${PERMISSION_CODE}:delete`),
        event: deleteData,
        ifRender: (row) => row.status === '0' && row.sysFlag == '0'
      },
    ]
  },
  sectionRows: []
})
const modifyInfo = reactive({
  refObj: null,
  row: {},
  title: '归集参数',
  btList: [
    { type: 'primary', label: '保存', event: saveData }
  ],
  fieldList: [
    { label: '归集参数编码', span: 12, value: 'code', type: 'input' },
    { label: '归集参数名称', span: 12, value: 'name', type: 'input' },
    { label: '备注', span: 12, value: 'remark', type: 'input' },
    { label: 'sql', labelTip: '查询参数字段别名为 服务单元主键IDserviceId，参数值value，条件参数为组织：@orgId，核算期间@intervalMth', value: 'executeQuerySql', span: 24, type: 'textarea' },
  ],
  rules: {
    code: [{ required: true, message: '请填写归集参数编码', trigger: 'blur' }],
    name: [{ required: true, message: '请填写归集参数名称', trigger: 'blur' }],
  },
  visible: false
})

watch(() => tableInfo.sectionRows, (rows) => {
  const btns = filterInfo.btnList
  const deleteBtn = btns.find(btn => btn.label === '删除')
  const enableBtn = btns.find(btn => btn.label === '启用')
  const disabledBtn = btns.find(btn => btn.label === '停用')
  deleteBtn.disabled = !rows.length || !!rows.find(it => it.status == 1 || it.sysFlag == 1)
  disabledBtn.disabled = !rows.length || !!rows.find(it => it.status == 0 || it.sysFlag == 1)
  enableBtn.disabled = !rows.length || !!rows.find(it => it.status == 1 || it.sysFlag == 1)
}, { immediate: true })

onMounted(() => {
  tableInfo.api = API.query
  getList()
})

// 查询
function getList() {
  filterInfo.copyQuery = cloneDeep(filterInfo.query)
  tableInfo.refresh = Math.random()
}

// 重置查询
function reset() {
  filterInfo.query = {}
  getList()
}

// 打开编辑页
// 当row不存在时，则打开的是新增页面
function openModify(row) {
  modifyInfo.row = cloneDeep(row) || {}
  modifyInfo.title = `${!!row?.id ? '修改' : '新增'}归集参数`
  modifyInfo.visible = true
}

// 删除数据
function deleteData(row) {
  const ids = row ? [row.id] : tableInfo.sectionRows.map(it => it.id)
  if (ids.length === 0) {
    return
  }
  proxy
      .$confirm('删除后将改变数据,是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
    API.delete(ids).then(({ code }) => {
      if (code === 200) {
        proxy.$message.success('删除成功')
        getList()
      }
    })
  })
}

function saveData() {
  modifyInfo.refObj.validate(flag => {
    if (flag) {
      const api = modifyInfo.row.id ? API.update: API.add
      api(modifyInfo.row).then(res => {
        if (res.success) {
          proxy.$message.success('保存成功')
          modifyInfo.visible = false
          getList()
        }
      })
    }
  })
}

function enableRow(row) {
  const rows = cloneDeep(row ? [row] : tableInfo.sectionRows)
  API.batchUpdate(rows.map(it => ({ ...it, status: 1 }))).then(res => {
    if (res.success) {
      proxy.$message.success('操作成功')
      getList()
    }
  })
}

function disabledRow(row) {
  const rows = cloneDeep(row ? [row] : tableInfo.sectionRows)
  API.batchUpdate(rows.map(it => ({ ...it, status: 0 }))).then(res => {
    if (res.success) {
      proxy.$message.success('操作成功')
      getList()
    }
  })
}


// 表格事件处理
const tableHandler = (eventName, raw) => {
  if (eventName === 'tableCheck') {
    tableInfo.sectionRows = raw
  }
}
</script>

<template>
  <div className="app-container">
    <div class="layui-card layui-col-md12">
      <div class="layui-card-body">
        <div class="filter-wrapper">
          <PageFilter
              ref="filterRef"
              v-model:query="filterInfo.query"
              :filter-list="filterInfo.list"
          ></PageFilter>
        </div>
        <div class="filter-wrapper">
          <!-- 条件栏 -->
          <NewPageFilter :filter-btn="filterInfo.btnList">
          </NewPageFilter>
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
        </table-container>
      </div>
    </div>
    <dialog-form :title="modifyInfo.title" :btList="modifyInfo.btList" v-model:visible="modifyInfo.visible">
      <page-form
          ref="dialogInfoRef"
          v-model:ref-obj="modifyInfo.refObj"
          :label-width="modifyInfo.labelWidth"
          :data="modifyInfo.row"
          :field-list="modifyInfo.fieldList"
          :rules="modifyInfo.rules"
      >
      </page-form>
    </dialog-form>
  </div>
</template>

<style scoped lang="scss">

</style>
