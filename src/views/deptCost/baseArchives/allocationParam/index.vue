<script setup name="allocationParam">
import {onMounted, watch} from "vue";
import {
  addAllocationParam,
  deleteAllocationParam, enableAllocationParam, exportAllocationParam,
  pageAllocationParam,
  updateAllocationParam
} from "@/api/allocationParam";
import {useStorage} from "@vueuse/core";
import {exportTemplateExcel} from "@/api/pub";
import {useUpload} from "@/hooks/useUpload";
import useUploadExcel from "@/components/UploadExcel/useUploadExcel";
const {proxy} = getCurrentInstance()
const setting = useStorage('setting', {}, sessionStorage)
const {
  beforeUpload
} = useUpload({}, undefined, '/apportionmentParam/importExcel', () => getList(), 'allocationParam:import')

const { uploadExcelBtns } = useUploadExcel({
  PERMISSION_CODE: 'allocationParam',
  type: '13020',
  action: '/apportionmentParam/import/excelRecord',
})
const filterInfo = ref({
  query: {
  },
  list: [
  ],
  btnList: [
    { type: 'button', label: '新增', show: proxy.$permission('allocationParam:add'), event: () => openModify() },
    { type: 'button', label: '启用', show: proxy.$permission('allocationParam:enable'), event: () => enable(1) },
    { type: 'button', label: '停用', show: proxy.$permission('allocationParam:enable'), event: () => enable(0) },
    { type: 'button', label: '下载模板', show: proxy.$permission('allocationParam:download'), event: downloadTemplate },
    ...uploadExcelBtns,
    { type: 'button', label: '导出Excel', show: proxy.$permission('allocationParam:export'), event: exportData },
  ]
})
const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  api: null,
  fieldList: [
    { label: '分摊参数编码', value: 'code' },
    { label: '分摊参数名称', value: 'name' },
    { label: '对应模板', value: 'templateValue' },
    { label: '启用状态', value: 'statusValue' },
    { label: 'sql', value: 'executeQuerySql' },
    { label: '是否内置', value: 'sysFlagValue' },
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
        show: proxy.$permission('allocationParam:update'),
        event: (row) => openModify(JSON.parse(JSON.stringify(row))),
        ifRender: (row) => row.sysFlag != '1'
      },
      {
        label: '删除',
        show: proxy.$permission('allocationParam:delete'),
        event: deleteRow,
        ifRender: (row) => row.sysFlag != '1'
      },
    ]
  },
  sectionRows: []
})
const dialogInfo = ref({
  ref: null,
  visible: false,
  labelWidth: '120px',
  title: '分摊参数',
  btnList: [
    {show: true, label: '取消', event: () => dialogInfo.value.visible = false},
    {show: true, type: 'primary', label: '保存', event: save},
  ],
  fieldList: [
    { label: '分摊参数编码', value: 'code', span: 12, type: 'input' },
    { label: '分摊参数名称', value: 'name', span: 12, type: 'input' },
    { label: '对应模板', value: 'template', span: 12, type: 'select-model', code: 'cost_apportionment_param_template' },
    { label: '备注', value: 'remark', span: 12, type: 'input' },
    { label: 'sql', labelTip: '查询参数字段别名为deptId,value; 条件参数为组织：@orgId,会计期间@periodMth', value: 'executeQuerySql', span: 24, type: 'textarea' },
  ],
  rules: {
    code: [{ required: true, message: '请输入分摊参数编码' }],
    name: [{ required: true, message: '请输入分摊参数名称' }],
    template: [{ required: true, message: '请选择对应模板' }],
  },
  data: {}
})

watch(() => tableInfo.value.sectionRows, (rows) => {
  const btns = filterInfo.value.btnList
  const enableBtn = btns.filter((it) => it.label === '启用')[0]
  const disableBtn = btns.filter((it) => it.label === '停用')[0]
  enableBtn.disabled = !rows.length || !!rows.filter(row => row.status == 1).length
  disableBtn.disabled = !rows.length || !!rows.filter(row => row.status != 1).length
}, { deep: true, immediate: true })

onMounted(() => {
  tableInfo.value.api = pageAllocationParam
  getList()
})

function getList() {
  tableInfo.value.refresh = Math.random()
  filterInfo.value.copyQuery = JSON.parse(JSON.stringify(filterInfo.value.query))
}
function reset() {
  filterInfo.value.query = {}
  getList()
}

// 下载模板
function downloadTemplate() {
  exportTemplateExcel('apportionmentParamTemplate', 'allocationParam:download').then((res) => {
    if (res) {
      proxy.$fn.parseExcel(res, '分摊参数导入模板')
    }
  })
}
function exportData() {
  exportAllocationParam(filterInfo.value.copyQuery).then(res => {
    if (res) {
      proxy.$fn.parseExcel(res)
    }
  })
}
function tableHandler(eventName, raw) {
  if (eventName === 'tableCheck') {
    tableInfo.value.sectionRows = raw
  }
}

function openModify(row) {
  dialogInfo.value.data = row || {
    orgId: setting.value.hospitalId
  }
  dialogInfo.value.fieldList[0].disabled = !!dialogInfo.value.data.id
  dialogInfo.value.title = `${!!row?.id ? '修改' : '新增'}分摊参数`
  dialogInfo.value.visible = true
}
function enable(flag) {
  enableAllocationParam({
    ids: tableInfo.value.sectionRows.map(it => it.id),
    status: flag
  }).then(res => {
    if (res.success) {
      proxy.$message.success('操作成功')
      getList()
    }
  })
}
function save() {
  dialogInfo.value.ref.validate((valid, data) => {
    if (valid) {
      const form = dialogInfo.value.data
      const api = form.id ? updateAllocationParam : addAllocationParam
      api(form).then(res => {
        if (res.success) {
          proxy.$message.success('保存成功')
          dialogInfo.value.visible = false
          getList()
        }
      })
    }
  })
}

function deleteRow(row) {
  proxy
      .$confirm('删除后将改变数据,是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
    deleteAllocationParam(row.id).then(({ code }) => {
      if (code === 200) {
        proxy.$message.success('删除成功')
        getList()
      }
    })
  })
}
</script>

<template>
  <div class="app-container">
    <div class="layui-card layui-col-md12">
      <div class="layui-card-body">
        <!-- 条件栏 -->
        <PageFilter
            v-model:query="filterInfo.query"
            :filter-list="filterInfo.list"
        ></PageFilter>
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
            :tabIndex="true"
            :pager="false"
            :field-list="tableInfo.fieldList"
            :handle="tableInfo.handle"
            @handleEvent="tableHandler"
        >
        </table-container>
      </div>
    </div>
    <page-dialog :title="dialogInfo.title" v-model:visible="dialogInfo.visible" :btList="dialogInfo.btnList">
      <!-- 这里的v-if是为了消除弹窗打开校验抖动 -->
      <div class="order-model-formBox" v-if="dialogInfo.visible">
        <page-form
            v-model:ref-obj="dialogInfo.ref"
            :data="dialogInfo.data"
            :field-list="dialogInfo.fieldList"
            :rules="dialogInfo.rules"
            :label-width="dialogInfo.labelWidth">
        </page-form>
      </div>
    </page-dialog>
  </div>
</template>

<style scoped lang="scss">

</style>
