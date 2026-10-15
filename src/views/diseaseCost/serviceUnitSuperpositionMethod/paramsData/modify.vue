<script setup>
import {getCurrentInstance, reactive, ref} from "vue";
import ModifyPage from "@/components/ModifyPage/ModifyPage.vue";
import ModifyForm from "@/components/ModifyPage/ModifyForm.vue";
import ModifyTable from "@/components/ModifyPage/ModifyTable.vue";
import {
  addParamsData,
  addParamsDataDetail,
  deleteParamsDataDetail, exportParamsDataDetail,
  oneParamsData, pageParamsDataDetail,
  updateParamsData, updateParamsDataDetail
} from "@/api/diseaseCostServiceUnitParamsData";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import cloneDeep from "lodash/cloneDeep";
import {useUpload} from "@/hooks/useUpload";
import {exportTemplateExcel} from "@/api/pub";
import {useStore} from "vuex";
import {useStorage} from "@vueuse/core";

const PERMISSION_CODE = 'diseaseCostServiceUnitParamsData'

const store = useStore()
const setting = useStorage('setting', {}, sessionStorage)
const { proxy } = getCurrentInstance();
const API = {
  one: oneParamsData,
  pageDetail: pageParamsDataDetail,
  add: addParamsData,
  addDetail: addParamsDataDetail,
  batchAdd: null,
  delete: deleteParamsDataDetail,
  update: updateParamsData,
  updateDetail: updateParamsDataDetail,
  download: exportTemplateExcel,
  export: exportParamsDataDetail,
}

const emit = defineEmits()
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
  batch: false,
  id: '',
  flowFormType: ''
})

const TEMPLATE_NAME = '病种参数数据明细导入模板'
const UPLOAD_PATH = `/methodService/diseaseApportionParamServiceDetail/import/excel/${props.id}`

const {
  uploadInfo,
  beforeUpload,
  downloadTemplate,
  uploadSuccess,
  uploadError,
  exportData
} = useUpload(API, TEMPLATE_NAME, UPLOAD_PATH, () => successCallback(), `${PERMISSION_CODE}:import`)
const { tableParameter, openDialog } = useSelectTableData()
const pageBtn = ref([
  { label: '保存并新增', event: saveAndAdd, show: props.batch }
])
const pageRef = ref()
const showDialog = computed({
  get() {
    return props.visible
  },
  set(newValue) {
    // 更新父组件visible
    emit('update:visible', newValue)
  },
})
const formInfo = ref({
  formRef: null,
  title: '基础信息',
  fieldList: [
    { label: '单据号', value: 'orderNo', type: 'input', disabled: true, show: !!props.id },
    { label: '核算期间', value: 'accountingPeriodName', type: 'slot' },
    { label: '归集参数', value: 'apportionmentParamName', type: 'slot' },
    { label: '确认状态', value: 'statusName', type: 'input', show: !!props.id, disabled: true },
    { label: '备注', value: 'remark', type: 'input' },
  ],
  rules: {
    accountingPeriodName: [{ required: true, message: '请选择核算期间', trigger: 'change' }],
    apportionmentParamName: [{ required: true, message: '请选择归集参数', trigger: 'change' }]
  },
  data: {
    orgId: setting.value.hospitalId
  }
})

const tableInfoRef = ref()
const tableInfo = ref({
  title: '明细信息',
  query: {},
  fieldList: [
    { label: '服务单元编码', value: 'serviceUnitCode' },
    { label: '服务单元名称', value: 'serviceUnitName' },
    { label: '参数值', value: 'paramValue', align: 'center' },
    { label: '备注', value: 'remark' },
  ],
  data: [],
  btnList: [
    { type: 'button', label: '添加明细', show: proxy.$permission(`${PERMISSION_CODE}:add`), event: () => openModify() },
    { type: 'button', label: '删除', show: proxy.$permission(`${PERMISSION_CODE}:delete`), event: () => deleteData() },
    { type: 'button', label: '下载模板', show: props.id && proxy.$permission(`${PERMISSION_CODE}:download`), event: () => downloadTemplate(undefined, `${PERMISSION_CODE}:download`) },
    { type: 'slot', label: '导入', show: props.id && proxy.$permission(`${PERMISSION_CODE}:import`), value: 'uploadFile', },
    { type: 'button', label: '导出Excel', show: props.id && proxy.$permission(`${PERMISSION_CODE}:export`), event: () => exportData(tableInfo.value.copyQuery), },
    { type: 'slot', label: '服务单元', showLabel: true, show: !!props.id, value: 'serviceUnitName' },
    { type: 'button', label: '查询', show: !!props.id, event: getTableData },
  ],
  summaryFieldList: [
    { value: 'paramValue', formatter: proxy.$fn.TripartiteMethod },
  ],
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


const dialogInfoRef = ref()
const dialogInfo = reactive({
  refObj: null,
  index: null,
  row: {},
  title: '参数数据',
  visible: false,
  fieldList: [
    { label: '服务单元编码', span: 12, value: 'serviceUnitCode', type: 'slot' },
    { label: '服务单元名称', span: 12, value: 'serviceUnitName', type: 'input', disabled: true },
    { label: '参数值', span: 12, value: 'paramValue', type: 'number' },
    { label: '备注', span: 12, value: 'remark', type: 'input' },
  ],
  rules: {
    serviceUnitCode: [{ required: true, message: '请选择服务单元', trigger: 'change' }],
    paramValue: [{ required: true, message: '请输入参数值', trigger: 'blur' }, { type: 'number', min: 0, message: '参数值不能为负数', trigger: 'blur' }],
  },
  btList: [
    { type: 'primary', label: '确认', event: saveData }
  ]
})

watch(() => tableInfo.value.sectionRows, (rows) => {
  const btns = tableInfo.value.btnList
  const deleteBtn = btns.find(it => it.label === '删除')
  deleteBtn.disabled = !rows.length
}, { immediate: true })

onMounted(() => {
  if (props.id) {
    getMain()
    getTableData()
  }
})

function getMain() {
  API.one(props.id).then(res => {
    formInfo.value.data = res.data
  })
}

function saveAndAdd() {
  pageRef.value.validate().then(res => {
    save(null, false)
  }).catch(err => {
    save(err)
  })
}
const save = (err, close = true) => {
  if (err) return
  const api = props.id ? API.update : props.batch ? API.batchAdd : API.add
  api({
    ...formInfo.value.data,
    paramList: tableInfo.value.data
  }).then(({ code }) => {
    if (code === 200) {
      proxy.$message.success('保存成功')
      if (!close) {
        formInfo.value.data = {}
        tableInfo.value.data = []
        return
      }
      showDialog.value = false
      emit('returnModify', true)
    }
  })
}

function getTableData() {
  tableInfo.value.api = API.pageDetail
  tableInfo.value.copyQuery = {
    ...tableInfo.value.query,
    serviceUnitCode: undefined,
    serviceUnitName: undefined,
    orderId: props.id
  }
  tableInfo.value.refresh = Math.random()
}

async function saveData() {
  let isValid = true
  await dialogInfo.refObj.validate(flag => isValid = flag)
  if (!isValid) return
  const isAdd = dialogInfo.isAdd
  const relativeId = props.id
  if (!relativeId) {
    dialogInfo.row.capitalSourceName = store.state.permission.dict['asset_capital_source']?.find(it => it.code === dialogInfo.row.capitalSource)?.name
    if (isAdd) {
      tableInfo.value.data.push(dialogInfo.row)
    } else {
      tableInfo.value.data[dialogInfo.index] = dialogInfo.row
    }
    dialogInfo.visible = false
  } else {
    const api = isAdd ? API.addDetail : API.updateDetail
    api({
      ...dialogInfo.row,
      orderId: relativeId
    }).then(res => {
      if (res.success) {
        proxy.$message.success('保存成功')
        dialogInfo.visible = false
        getTableData()
      }
    })
  }
}

function openModify(row) {
  dialogInfo.isAdd = !row
  dialogInfo.row = cloneDeep(row) || {}
  dialogInfo.title = row ? '修改参数数据' : '新增参数数据'
  dialogInfo.index = tableInfo.value.data.indexOf(row)
  dialogInfo.visible = true
}

function deleteData(row) {
  const sections = row ? [row] : tableInfo.value.sectionRows
  const ids = sections.map(it => it.id)
  if (ids.length === 0) {
    return
  }
  proxy
      .$confirm('删除后将改变数据,是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
    if (props.id) {
      API.delete(ids).then(({ code }) => {
        if (code === 200) {
          proxy.$message.success('删除成功')
          getTableData()
        }
      })
    } else {
      tableInfo.value.data = tableInfo.value.data.filter(it => sections.indexOf(it) == -1)
    }
  })
}

function successCallback() {
  getTableData()
}

// 表格事件处理
const tableHandler = (eventName, raw) => {
  if (eventName === 'tableCheck') {
    tableInfo.value.sectionRows = raw
  }
}

function openAccountingPeriod() {
  tableParameter.type = 'diseasePeriod'
  tableParameter.query = {}
  tableParameter.callBack = accountingPeriodCallback
  openDialog(formInfo.value.formRef)
}
function accountingPeriodCallback(raw) {
  formInfo.value.data.accountingPeriodId = raw.id
  formInfo.value.data.accountingPeriodName = raw.name
}

function openApportionmentParam() {
  tableParameter.type = 'diseaseAggregationParams'
  tableParameter.query = {
    status: 1
  }
  tableParameter.callBack = apportionmentParamCallback
  openDialog(formInfo.value.formRef)
}
function apportionmentParamCallback(raw) {
  formInfo.value.data.apportionmentParamId = raw.id
  formInfo.value.data.apportionmentParamName = raw.name
}

function openServiceUnitSelector(mark) {
  tableParameter.type = 'diseaseServiceUnit'
  tableParameter.query = {
    status: '1'
  }
  tableParameter.mark = mark
  tableParameter.callBack = serviceUnitCallback
  const ref = mark === 'query' ? tableInfoRef.value : dialogInfoRef.value
  openDialog(ref)
}
function serviceUnitCallback(raw) {
  const form = tableParameter.mark === 'query' ? tableInfo.value.query : dialogInfo.row
  form.serviceId = raw.id
  form.serviceUnitCode = raw.code
  form.serviceUnitName = raw.name
}
</script>

<template>
  <ModifyPage ref="pageRef" v-model:visible="showDialog" :title="title" :btnList="pageBtn" @save="save">
    <ModifyForm :form-info="formInfo">
      <template #form-accountingPeriodName>
        <el-input
            v-model="formInfo.data.accountingPeriodName"
            class="not-mongolia"
            type="input"
            placeholder="请选择核算期间"
            :disabled="true"
        >
          <template #append>
            <el-icon @click="openAccountingPeriod"><Search /></el-icon>
          </template>
        </el-input>
      </template>
      <template #form-apportionmentParamName>
        <el-input
            v-model="formInfo.data.apportionmentParamName"
            class="not-mongolia"
            type="input"
            placeholder="请选择归集参数"
            :disabled="true"
        >
          <template #append>
            <el-icon @click="openApportionmentParam"><Search /></el-icon>
          </template>
        </el-input>
      </template>
    </ModifyForm>
    <ModifyTable ref="tableInfoRef" :isDynamic="true" :pager="!!props.id" :table-info="tableInfo" @handleEvent="tableHandler">
      <template v-slot:filter-uploadFile>
        <el-upload
            :headers="uploadInfo.headers"
            :show-file-list="false"
            :data="uploadInfo.data"
            :on-error="uploadError"
            :on-success="uploadSuccess"
            :before-upload="beforeUpload"
            :action="uploadInfo.action"
        >
          <el-button>导入</el-button>
        </el-upload>
      </template>
      <template #filter-serviceUnitName>
        <el-input
            v-model="tableInfo.query.serviceUnitName"
            class="not-mongolia"
            type="input"
            placeholder="请选择服务单元"
            :disabled="true"
        >
          <template #append>
            <el-icon @click="openServiceUnitSelector('query')"><Search /></el-icon>
          </template>
        </el-input>
      </template>
    </ModifyTable>
  </ModifyPage>
  <dialog-form :title="dialogInfo.title" :btList="dialogInfo.btList" v-model:visible="dialogInfo.visible">
    <page-form
        ref="dialogInfoRef"
        v-model:ref-obj="dialogInfo.refObj"
        :label-width="dialogInfo.labelWidth"
        :data="dialogInfo.row"
        :field-list="dialogInfo.fieldList"
        :rules="dialogInfo.rules"
    >
      <template #form-serviceUnitCode>
        <el-input
            v-model="dialogInfo.row.serviceUnitCode"
            class="not-mongolia"
            type="input"
            placeholder="请选择服务单元"
            :disabled="true"
        >
          <template #append>
            <el-icon @click="openServiceUnitSelector()"><Search /></el-icon>
          </template>
        </el-input>
      </template>
    </page-form>
  </dialog-form>
</template>

<style scoped lang="scss">

</style>
