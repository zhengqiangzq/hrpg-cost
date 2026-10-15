<!-- 资产面积 -->
<script setup name="profileConfigAssetArea">
import {getCurrentInstance, onMounted, reactive, ref, watch} from "vue";
import cloneDeep from "lodash/cloneDeep";
import {exportTemplateExcel} from "@/api/pub";
import {
    addProfileConfigAssetArea, deleteProfileConfigAssetArea, exportProfileConfigAssetArea,
    pageProfileConfigAssetArea,
    updateProfileConfigAssetArea
} from "@/api/projectCost/profileConfigAssetArea";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import useUploadExcel from "@/components/UploadExcel/useUploadExcel";

const { proxy } = getCurrentInstance()
const PERMISSION_CODE = 'profileConfigAssetArea'
const API = {
  query: pageProfileConfigAssetArea,
  add: addProfileConfigAssetArea,
  update: updateProfileConfigAssetArea,
  delete: deleteProfileConfigAssetArea,
  download: exportTemplateExcel,
  export: exportProfileConfigAssetArea
}
const TEMPLATE_NAME = 'itemAssetsItemAreaTemplate'
const UPLOAD_PATH = '/item/assetsItemArea/import/excel'

const { uploadExcelBtns } = useUploadExcel({
  PERMISSION_CODE: PERMISSION_CODE,
  type: '13059',
  action: '/item/assetsItemArea/import/excelRecord',
})
const filterRef = ref()
const filterInfo = reactive({
  query: {},
  copyQuery: {},
  list: [
    { type: 'slot', showLabel: true, label: '资产信息', value: 'assetsItemName' },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', event: reset, },
  ],
  btnList: [
    { type: 'button', label: '新增', show: proxy.$permission(`${PERMISSION_CODE}:add`), event: () => openModify(), },
    { type: 'button', label: '删除', show: proxy.$permission(`${PERMISSION_CODE}:delete`), event: () => deleteData(), },
    { type: 'button', label: '下载模板', show: proxy.$permission(`${PERMISSION_CODE}:download`), event: () => downloadTemplate(), },
    ...uploadExcelBtns,
    { type: 'button', label: '导出Excel', show: proxy.$permission(`${PERMISSION_CODE}:export`), event: () => exportData(), },
  ]
})
const tableInfo = reactive({
  initCurPage: 1,
  refresh: 1,
  fieldList: [
    { label: '卡片编码', value: 'assetsItemCode' },
    { label: '资产名称', value: 'assetsItemName' },
    { label: '面积(平方米)', value: 'area' },
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
      },
      {
        label: '删除',
        show: proxy.$permission(`${PERMISSION_CODE}:delete`),
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
  title: '面积配置',
  visible: false,
  fieldList: [
    { label: '卡片号', span: 12, value: 'assetsItemName', type: 'slot' },
    { label: '面积(平方米)', span: 12, value: 'area', type: 'number', min: 0, precision: 2 },
  ],
  rules: {
      assetsItemName: [{ required: true, message: '请选择资产卡片', trigger: 'blur' }],
      area: [{ required: true, message: '请输入面积', trigger: 'blur' }],
  },
  btList: [
    { type: 'primary', label: '确认', event: saveData }
  ]
})
const { tableParameter, openDialog } = useSelectTableData()

watch(() => tableInfo.sectionRows, (rows) => {
  const btns = filterInfo.btnList
  const deleteBtn = btns.find(btn => btn.label === '删除')
  deleteBtn.disabled = !rows.length
}, { immediate: true })

onMounted(() => {
  tableInfo.api = API.query
  getList()
})

// 查询
function getList() {
  filterInfo.copyQuery = {
      ...filterInfo.query,
      assetsItemName: undefined,
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
  dialogInfo.title = `${!!row?.id ? '修改' : '新增'}资产面积`
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

// 下载模板
function downloadTemplate() {
  API.download(TEMPLATE_NAME, `${PERMISSION_CODE}:download`).then((res) => {
    if (res) {
      proxy.$fn.parseExcel(res, '资产面积导入模板')
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
        <div class="filter-wrapper">
          <NewPageFilter
              ref="filterRef"
              v-model:query="filterInfo.query"
              :filter-list="filterInfo.list"
              :filter-btn="filterInfo.filterbtn"
          >
              <template #filter-assetsItemName>
                  <el-input
                      v-model="filterInfo.query.assetsItemName"
                      class="not-mongolia"
                      type="input"
                      placeholder="请选择资产卡片"
                      :disabled="true"
                  >
                      <template #append>
                          <el-icon @click="openAssetSelector"><Search /></el-icon>
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
