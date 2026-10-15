<script setup>
import {getCurrentInstance, nextTick, reactive, ref} from "vue";
import ModifyPage from "@/components/ModifyPage/ModifyPage.vue";
import ModifyForm from "@/components/ModifyPage/ModifyForm.vue";
import ModifyTable from "@/components/ModifyPage/ModifyTable.vue";
import {useUpload} from "@/hooks/useUpload";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {exportTemplateExcel} from "@/api/pub";
import cloneDeep from "lodash/cloneDeep";
import {
  addTargetConfig,
  allTargetConfigDetail,
  exportDetailTargetConfig,
  oneTargetConfig,
  updateTargetConfig
} from "@/api/deptCost/targetConfig";
import moment from "moment/moment";

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

const PERMISSION_CODE = 'deptCost:targetConfig'
const { proxy } = getCurrentInstance();
const API = {
  one: oneTargetConfig,
  allDetail: allTargetConfigDetail,
  add: addTargetConfig,
  batchAdd: null,
  update: updateTargetConfig,
  download: exportTemplateExcel,
  export: exportDetailTargetConfig
}

const TEMPLATE_NAME = 'targetIndicatorsDetailTemplate'
const UPLOAD_PATH = `/deptCost/deptTargetConfigDetails/analysis/excel/${props.id}`

const {
  uploadInfo,
  beforeUpload,
  downloadTemplate,
  uploadSuccess,
  uploadError,
  exportData
} = useUpload(API, TEMPLATE_NAME, UPLOAD_PATH, (resp) => successCallback(resp))

const emit = defineEmits(['returnModify'])
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
  title: '基础信息',
  labelWidth: '140px',
  fieldList: [
    { label: '目标方案编码', value: 'code', type: 'input', disabled: !!props.id },
    { label: '目标方案名称', value: 'name', type: 'input' },
    { label: '开始会计期间', value: 'startPeriodName', type: 'slot' },
    { label: '结束会计期间', value: 'endPeriodName', type: 'slot' },
    { label: '确认状态', value: 'confirmStatusName', type: 'input', show: !!props.id, disabled: true },
    { label: '备注', value: 'remark', type: 'input' },
  ],
  rules: {
    code: [{ required: true, message: '请输入目标方案编码', trigger: 'blur' }],
    name: [{ required: true, message: '请输入目标方案名称', trigger: 'blur' }],
    startPeriodName: [
      { required: true, message: '请选择开始会计期间', trigger: 'change' },
      {
        validator: (rule, value, callback) => {
          const data = formInfo.value.data
          const startDate = moment(value), endDate = moment(data.endPeriodName)
          if (startDate.isAfter(endDate)) {
            callback('开始期间应该小于结束期间')
          }
          callback()
        }, trigger: 'change'
      }
    ],
    endPeriodName: [
      { required: true, message: '请选择结束会计期间', trigger: 'change' },
      {
        validator: (rule, value, callback) => {
          const data = formInfo.value.data
          const startDate = moment(data.startPeriodName), endDate = moment(value)
          if (startDate.isAfter(endDate)) {
            callback('开始期间应该小于结束期间')
          }
          callback()
        }, trigger: 'change'
      }
    ],
  },
  data: {
  }
})

const tableInfo = ref({
  query: {},
  title: '明细信息',
  fieldList: [
    { label: '指标代码', value: 'indicatorsCode' },
    { label: '指标名称', value: 'indicatorsName' },
    { label: '所属指标分类', value: 'classificationName' },
    { label: '目标值', value: 'value', align: 'center' },
  ],
  summaryFieldList: [
    { value: 'value', formatter: proxy.$fn.TripartiteMethod },
  ],
  data: [],
  btnList: [
    { type: 'button', label: '添加明细', show: proxy.$permission(`${PERMISSION_CODE}:add`), event: () => openModify() },
    { type: 'button', label: '删除', show: proxy.$permission(`${PERMISSION_CODE}:delete`), event: () => deleteData() },
    { type: 'button', label: '下载模板', show: props.id && proxy.$permission(`${PERMISSION_CODE}:download`), event: () => downloadTemplate('成本目标配置明细导入模板') },
    { type: 'slot', label: '导入', show: props.id && proxy.$permission(`${PERMISSION_CODE}:import`), value: 'uploadFile', },
    { type: 'button', label: '导出Excel', show: props.id && proxy.$permission(`${PERMISSION_CODE}:export`), event: () => exportData(props.id), },
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

const { tableParameter, openDialog } = useSelectTableData()

const dialogInfoRef = ref()
const dialogInfo = reactive({
  refObj: null,
  index: null,
  row: {},
  title: '指标信息',
  visible: false,
  fieldList: [
    { label: '指标代码', span: 12, value: 'indicatorsCode', type: 'slot' },
    { label: '指标名称', span: 12, value: 'indicatorsName', type: 'input', disabled: true },
    { label: '所属指标分类', span: 12, value: 'classificationName', type: 'input', disabled: true },
    { label: '目标值', span: 12, value: 'value', type: 'number', precision: 2, min: 0 },
  ],
  rules: {
    value: [{ required: true, message: '请输入目标值', trigger: 'blur' }],
    indicatorsCode: [{ required: true, message: '请选择指标代码', trigger: 'change' }],
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

function getTableData() {
  tableInfo.value.api = API.allDetail
  tableInfo.value.copyQuery = {
    ...tableInfo.value.query,
    configId: props.id,
  }
  tableInfo.value.refresh = Math.random()
}

function saveData() {
  dialogInfo.loading = true
  dialogInfo.refObj.validate(flag => {
    if (flag) {
      const isAdd = dialogInfo.isAdd
      const relativeId = props.id
      if (isAdd) {
        tableInfo.value.data.push({
          ...dialogInfo.row,
          configId: relativeId
        })
      } else {
        tableInfo.value.data[dialogInfo.index] = dialogInfo.row
      }
      dialogInfo.visible = false
    }
    setTimeout(function() {
      dialogInfo.loading = false
    }, 300)
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
  if (tableInfo.value.data.length === 0) {
    proxy.$message.warning("请先添加明细配置明细")
    return
  }
  const api = props.id ? API.update : props.batch ? API.batchAdd : API.add
  api({
    ...formInfo.value.data,
    detailsVOList: tableInfo.value.data
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

function openModify(row) {
  dialogInfo.isAdd = !row
  dialogInfo.title = row ? '修改明细数据' : '新增明细数据'
  dialogInfo.row = cloneDeep(row) || {}
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
          tableInfo.value.data = tableInfo.value.data.filter(it => sections.indexOf(it) == -1)
  })
}

// 表格事件处理
const tableHandler = (eventName, raw) => {
  if (eventName === 'tableCheck') {
    tableInfo.value.sectionRows = raw
  }
}

function successCallback(resp) {
  if (resp?.data) {
    resp.data.forEach(it => {
      const row = tableInfo.value.data.find(it => it.indicatorsId === it.indicatorsId)
      if (row) {
        tableInfo.value.data.splice(tableInfo.value.data.indexOf(row), 1, it)
      }
    })
    tableInfo.value.data.push(...resp.data.filter(it => !tableInfo.value.data.find(i => i.indicatorsId === it.indicatorsId)))
  }
}

function openAccountingPeriod(cellName) {
  tableParameter.type = 'accountingPeriod'
  tableParameter.query = {}
  tableParameter.callBack = (raw) => {
    if (cellName === 'startPeriodName') {
      formInfo.value.data.startPeriodId = raw.id
      formInfo.value.data.startPeriodName = raw.periodYearAndMonth
    } else if (cellName === 'endPeriodName') {
      formInfo.value.data.endPeriodId = raw.id
      formInfo.value.data.endPeriodName = raw.periodYearAndMonth
    }
  }
  openDialog(formInfo.value.formRef)
}
function openControlIndicators() {
  tableParameter.type = 'controlIndicators'
  tableParameter.query = { idNotIn: tableInfo.value.data.map(it => it.indicatorsId).toString() }
  tableParameter.callBack = (raw) => {
    dialogInfo.row.indicatorsId = raw.id
    dialogInfo.row.indicatorsCode = raw.code
    dialogInfo.row.indicatorsName = raw.name
    dialogInfo.row.classificationName = raw.classificationName
  }
  openDialog(dialogInfoRef.value)
}
</script>

<template>
  <ModifyPage ref="pageRef" v-model:visible="showDialog" :title="title" :btnList="pageBtn" @save="save">
    <ModifyForm :form-info="formInfo">
      <template #form-startPeriodName>
        <el-input
            v-model="formInfo.data.startPeriodName"
            class="not-mongolia"
            type="input"
            placeholder="请选择核算期间"
            :disabled="true"
        >
          <template #append>
            <el-icon @click="openAccountingPeriod('startPeriodName')"><Search /></el-icon>
          </template>
        </el-input>
      </template>
      <template #form-endPeriodName>
        <el-input
            v-model="formInfo.data.endPeriodName"
            class="not-mongolia"
            type="input"
            placeholder="请选择核算期间"
            :disabled="true"
        >
          <template #append>
            <el-icon @click="openAccountingPeriod('endPeriodName')"><Search /></el-icon>
          </template>
        </el-input>
      </template>
    </ModifyForm>
    <ModifyTable :isDynamic="true" :pager="false" :table-info="tableInfo" @handleEvent="tableHandler">
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
    </ModifyTable>
  </ModifyPage>
  <dialog-form :title="dialogInfo.title" :btList="dialogInfo.btList" :btLoading="dialogInfo.loading" v-model:visible="dialogInfo.visible">
    <page-form
        ref="dialogInfoRef"
        v-model:ref-obj="dialogInfo.refObj"
        :label-width="dialogInfo.labelWidth"
        :data="dialogInfo.row"
        :field-list="dialogInfo.fieldList"
        :rules="dialogInfo.rules"
    >
      <template #form-indicatorsCode>
        <el-input
            v-model="dialogInfo.row.indicatorsCode"
            class="not-mongolia"
            type="input"
            placeholder="请选择指标编码"
            :disabled="true"
        >
          <template #append>
            <el-icon @click="openControlIndicators"><Search /></el-icon>
          </template>
        </el-input>
      </template>
    </page-form>
  </dialog-form>
</template>

<style scoped lang="scss">

</style>
