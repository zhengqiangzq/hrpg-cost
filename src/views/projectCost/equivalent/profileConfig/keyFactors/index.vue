<!-- 关键因素设置 -->
<script setup name="profileConfigKeyFactors">
import {getCurrentInstance, onMounted, reactive, ref, watch} from "vue";
import cloneDeep from "lodash/cloneDeep";
import {exportTemplateExcel} from "@/api/pub";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {
    addProfileConfigKeyFactors,
    deleteProfileConfigKeyFactors, disableProfileConfigKeyFactors,
    enableProfileConfigKeyFactors,
    exportProfileConfigKeyFactors,
    pageProfileConfigKeyFactors,
    updateProfileConfigKeyFactors
} from "@/api/projectCost/profileConfigKeyFactors";
import useUploadExcel from "@/components/UploadExcel/useUploadExcel";

const { proxy } = getCurrentInstance()
const PERMISSION_CODE = 'profileConfigKeyFactors'
const API = {
  query: pageProfileConfigKeyFactors,
  add: addProfileConfigKeyFactors,
  update: updateProfileConfigKeyFactors,
  delete: deleteProfileConfigKeyFactors,
    enable: enableProfileConfigKeyFactors,
    disable: disableProfileConfigKeyFactors,
  download: exportTemplateExcel,
  export: exportProfileConfigKeyFactors
}
const TEMPLATE_NAME = 'itemKeyFactorSettingTemplate'
const UPLOAD_PATH = '/item/keyFactorSetting/import/excel'

const { uploadExcelBtns } = useUploadExcel({
  PERMISSION_CODE: PERMISSION_CODE,
  type: '13060',
  action: '/item/keyFactorSetting/import/excelRecord',
})
const filterRef = ref()
const filterInfo = reactive({
  query: {},
  copyQuery: {},
  list: [
  ],
  btnList: [
    { type: 'button', label: '新增', show: proxy.$permission(`${PERMISSION_CODE}:add`), event: () => openModify(), },
    { type: 'button', label: '删除', show: proxy.$permission(`${PERMISSION_CODE}:delete`), event: () => deleteData(), },
    { type: 'button', label: '启用', show: proxy.$permission(`${PERMISSION_CODE}:enable`), event: () => enableData(), },
    { type: 'button', label: '停用', show: proxy.$permission(`${PERMISSION_CODE}:enable`), event: () => disableData(), },
    { type: 'button', label: '下载模板', show: proxy.$permission(`${PERMISSION_CODE}:download`), event: () => downloadTemplate(), },
    ...uploadExcelBtns,
    { type: 'button', label: '导出Excel', show: proxy.$permission(`${PERMISSION_CODE}:export`), event: () => exportData(), },
  ]
})
const tableInfo = reactive({
  initCurPage: 1,
  refresh: 1,
  fieldList: [
    { label: '关键因素编码', value: 'code' },
    { label: '关键因素名称', value: 'name' },
    { label: '启用状态', value: 'statusName' },
    { label: 'sql', value: 'executeQuerySql' },
    { label: '是否内置', value: 'builtInName' },
  ],
  data: [],
  handle: {
    fixed: 'right',
    label: '操作',
    width: '130',
    btList: [
        {
            label: '启用',
            show: proxy.$permission(`${PERMISSION_CODE}:enable`),
            ifRender: (row) => row.status != '1',
            event: enableData,
        },
        {
            label: '停用',
            show: proxy.$permission(`${PERMISSION_CODE}:enable`),
            ifRender: (row) => row.status == '1',
            event: disableData,
        },
      {
        label: '编辑',
        show: proxy.$permission(`${PERMISSION_CODE}:update`),
        ifRender: (row) => row.status != '1',
        event: openModify,
      },
      {
        label: '删除',
        show: proxy.$permission(`${PERMISSION_CODE}:delete`),
        ifRender: (row) => row.status != '1',
        event: deleteData,
      },
    ]
  },
  sectionRows: []
})
const dialogRef = ref()
const dialogInfo = reactive({
  refObj: null,
  row: {},
  title: '关键因素',
  visible: false,
  fieldList: [
    { label: '关键因素编码', span: 12, value: 'code', type: 'input' },
    { label: '关键因素名称', span: 12, value: 'name', type: 'input' },
    { label: 'sql', labelTip: '查询参数字段别名为 科室主键deptId，收费项目主键feeItemId，参数值value，条件参数为组织：@orgId，核算期间@intervalMth', value: 'executeQuerySql', span: 24, type: 'textarea' },
  ],
  rules: {
      code: [{ required: true, message: '请输入关键因素编码', trigger: 'blur' }],
      name: [{ required: true, message: '请输入关键因素名称', trigger: 'blur' }],
  },
  btList: [
    { type: 'primary', label: '确认', event: saveData }
  ]
})
const { tableParameter, openDialog } = useSelectTableData()

watch(() => tableInfo.sectionRows, (rows) => {
  const btns = filterInfo.btnList
  const deleteBtn = btns.find(btn => btn.label === '删除')
  const enableBtn = btns.find(btn => btn.label === '启用')
  const disableBtn = btns.find(btn => btn.label === '停用')
  deleteBtn.disabled = !rows.length || !!rows.find(it => it.status == '1' || it.builtIn == '1')
    enableBtn.disabled = !rows.length || !!rows.find(it => it.status == '1')
    disableBtn.disabled = !rows.length || !!rows.find(it => it.status != '1')
}, { immediate: true })

onMounted(() => {
  tableInfo.api = API.query
  getList()
})

// 查询
function getList() {
  filterInfo.copyQuery = {
      ...filterInfo.query,
  }
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
  dialogInfo.row = row ? cloneDeep(row) : {}
  dialogInfo.title = `${!!row?.id ? '修改' : '新增'}关键因素设置`
  dialogInfo.visible = true
}

function saveData() {
  dialogInfo.refObj.validate(flag => {
    if (flag) {
      const data = dialogInfo.row
      const api = data.id ? API.update : API.add
      api(data).then(res => {
        if (res.success) {
          proxy.$message.success('保存成功')
          dialogInfo.visible = false
          getList()
        }
      })
    }
  })
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

// 启用数据
function enableData(row) {
  const ids = row ? [row.id] : tableInfo.sectionRows.map(it => it.id)
  if (ids.length === 0) {
    return
  }
    API.enable(ids).then(({ code }) => {
        if (code === 200) {
            proxy.$message.success('启用成功')
            getList()
        }
    })
}

// 停用数据
function disableData(row) {
  const ids = row ? [row.id] : tableInfo.sectionRows.map(it => it.id)
  if (ids.length === 0) {
    return
  }
    API.disable(ids).then(({ code }) => {
        if (code === 200) {
            proxy.$message.success('停用成功')
            getList()
        }
    })
}

// 下载模板
function downloadTemplate() {
  API.download(TEMPLATE_NAME, `${PERMISSION_CODE}:download`).then((res) => {
    if (res) {
      proxy.$fn.parseExcel(res, '关键因素设置导入模板')
    }
  })
}

// 导出数据
function exportData() {
  API.export(filterInfo.query).then((resp) => {
    if (resp) {
      proxy.$fn.parseExcel(resp)
    }
  })
}

// 表格事件处理
const tableHandler = (eventName, raw) => {
  if (eventName === 'tableCheck') {
    tableInfo.sectionRows = raw
  }
}

function openAssetSelector(mark) {
    tableParameter.title = '资产卡片'
    tableParameter.type = 'assets'
    tableParameter.query = {}
    tableParameter.checkBox = false
    tableParameter.visible = true
    tableParameter.callBack = (raw) => {
        if (mark === 'form') {
            dialogInfo.row.assetsItemId = raw.id
            dialogInfo.row.assetsItemName = raw.name
        } else {
            filterInfo.query.assetsItemId = raw.id
            filterInfo.query.assetsItemName = raw.name
        }
    }
    openDialog(filterRef.value)
}
</script>

<template>
  <div className="app-container">
    <div class="layui-card layui-col-md12">
      <div class="layui-card-body">
<!--        <div class="filter-wrapper">-->
<!--          <PageFilter-->
<!--              ref="filterRef"-->
<!--              v-model:query="filterInfo.query"-->
<!--              :filter-list="filterInfo.list"-->
<!--          >-->
<!--              <template #filter-assetsItemName>-->
<!--                  <el-input-->
<!--                      v-model="filterInfo.query.assetsItemName"-->
<!--                      class="not-mongolia"-->
<!--                      type="input"-->
<!--                      placeholder="请选择资产卡片"-->
<!--                      :disabled="true"-->
<!--                  >-->
<!--                      <template #append>-->
<!--                          <el-icon @click="openAssetSelector"><Search /></el-icon>-->
<!--                      </template>-->
<!--                  </el-input>-->
<!--              </template>-->
<!--          </PageFilter>-->
<!--        </div>-->
        <div class="filter-wrapper">
          <!-- 条件栏 -->
          <NewPageFilter :filter-btn="filterInfo.btnList">
          </NewPageFilter>
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
      </table-container>
    </div>
    <dialog-form :title="dialogInfo.title" width="45%" :btList="dialogInfo.btList" v-model:visible="dialogInfo.visible">
      <page-form
          ref="dialogRef"
          v-model:ref-obj="dialogInfo.refObj"
          :label-width="dialogInfo.labelWidth"
          :data="dialogInfo.row"
          :field-list="dialogInfo.fieldList"
          :rules="dialogInfo.rules"
      >
          <template #form-assetsItemName>
              <el-input
                  v-model="dialogInfo.row.assetsItemName"
                  class="not-mongolia"
                  type="input"
                  placeholder="请选择资产卡片"
                  :disabled="true"
              >
                  <template #append>
                      <el-icon @click="openAssetSelector('form')"><Search /></el-icon>
                  </template>
              </el-input>
          </template>
      </page-form>
    </dialog-form>
  </div>
</template>

<style scoped lang="scss">

</style>
