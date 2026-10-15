<script setup>
import {getCurrentInstance, reactive, ref} from "vue";
import ModifyPage from "@/components/ModifyPage/ModifyPage.vue";
import ModifyForm from "@/components/ModifyPage/ModifyForm.vue";
import ModifyTable from "@/components/ModifyPage/ModifyTable.vue";
import {useUpload} from "@/hooks/useUpload";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {exportTemplateExcel} from "@/api/pub";
import cloneDeep from "lodash/cloneDeep";
import {
  addAssessmentScheme,
  allAssessmentSchemeDetail, exportDetailAssessmentScheme,
  oneAssessmentScheme,
  updateAssessmentScheme
} from "@/api/deptCost/assessmentScheme";
import {assessment_scheme_score_type} from "@/views/comprehensiveAnalysis/common/fakeDict";
import moment from "moment";
import imageDialogSrc from '@/assets/image/image-assessmentScheme-desc.png'

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

const PERMISSION_CODE = 'deptCost:assessmentScheme'
const { proxy } = getCurrentInstance();
const API = {
  one: oneAssessmentScheme,
  allDetail: allAssessmentSchemeDetail,
  add: addAssessmentScheme,
  batchAdd: null,
  update: updateAssessmentScheme,
  download: exportTemplateExcel,
  export: exportDetailAssessmentScheme
}

const TEMPLATE_NAME = 'schemeIndicatorsDetailTemplate'
const UPLOAD_PATH = `/deptCost/deptAssessmentSchemeDetails/analysis/excel/${props.id}`

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
  options: {
    score_type: assessment_scheme_score_type
  },
  title: '基础信息',
  fieldList: [
    { label: '考核方案编码', value: 'code', type: 'input', disabled: !!props.id },
    { label: '考核方案名称', value: 'name', type: 'input' },
    { label: '开始会计期间', value: 'startPeriodName', type: 'slot' },
    { label: '结束会计期间', value: 'endPeriodName', type: 'slot' },
    { label: '评分方法', value: 'scoringMethod', type: 'select', list: 'score_type' },
    { label: '极值', value: 'extremeWay', type: 'select-model', code: 'cost_extreme_way' },
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
    extremeWay: [{ required: true, message: '请选择极值', trigger: 'change' }],
  },
  data: {
    scoringMethod: '0'
  }
})

const tableInfo = ref({
  query: {},
  title: '明细信息',
  fieldList: [
    { label: '指标代码', value: 'indicatorsCode' },
    { label: '指标名称', value: 'indicatorsName' },
    { label: '权重(%)', value: 'weight', align: 'center' },
    { label: '区间一得分', value: 'intervalOneScore', align: 'center' },
    { label: '最佳值', value: 'optimumValue', align: 'center' },
    { label: '区间二得分', value: 'intervalTwoScore', align: 'center' },
    { label: '目标值', value: 'targetValue', align: 'center' },
    { label: '区间三得分', value: 'intervalThreeScore', align: 'center' },
    { label: '基准值', value: 'referenceValue', align: 'center' },
    { label: '区间四得分', value: 'intervalFourScore', align: 'center' },
  ],
  summaryFieldList: [
  ],
  data: [],
  btnList: [
    { type: 'button', label: '添加明细', show: proxy.$permission(`${PERMISSION_CODE}:add`), event: () => openModify() },
    { type: 'button', label: '删除', show: proxy.$permission(`${PERMISSION_CODE}:delete`), event: () => deleteData() },
    { type: 'button', label: '下载模板', show: props.id && proxy.$permission(`${PERMISSION_CODE}:download`), event: () => downloadTemplate('考核方案明细导入模板') },
    { type: 'slot', label: '导入', show: props.id && proxy.$permission(`${PERMISSION_CODE}:import`), value: 'uploadFile', },
    { type: 'button', label: '导出Excel', show: props.id && proxy.$permission(`${PERMISSION_CODE}:export`), event: () => exportData(props.id), },
    { type: 'button', label: '图形说明', show: true, event: () => imageDialogVisible.value = true },
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
    { label: '权重(%)', span: 12, value: 'weight', type: 'number', precision: 2, min: 0 },
    { label: '区间一得分', span: 12, value: 'intervalOneScore', type: 'number', precision: 2, min: 0 },
    { label: '最佳值', span: 12, value: 'optimumValue', type: 'number', precision: 2, min: 0 },
    { label: '区间二得分', span: 12, value: 'intervalTwoScore', type: 'number', precision: 2, min: 0 },
    { label: '目标值', span: 12, value: 'targetValue', type: 'number', precision: 2, min: 0 },
    { label: '区间三得分', span: 12, value: 'intervalThreeScore', type: 'number', precision: 2, min: 0 },
    { label: '基准值', span: 12, value: 'referenceValue', type: 'number', precision: 2, min: 0 },
    { label: '区间四得分', span: 12, value: 'intervalFourScore', type: 'number', precision: 2, min: 0 },
  ],
  rules: {
    weight: [{ required: true, message: '请输入权重', trigger: 'blur' }],
    intervalOneScore: [{ required: true, message: '请输入区间一得分', trigger: 'blur' }],
    optimumValue: [{ required: true, message: '请输入最佳值', trigger: 'blur' }],
    intervalTwoScore: [{ required: true, message: '请输入区间二得分', trigger: 'blur' }],
    targetValue: [{ required: true, message: '请输入目标值', trigger: 'blur' }],
    intervalThreeScore: [{ required: true, message: '请输入区间三得分', trigger: 'blur' }],
    referenceValue: [{ required: true, message: '请输入基准值', trigger: 'blur' }],
    intervalFourScore: [{ required: true, message: '请输入区间四得分', trigger: 'blur' }],
    indicatorsCode: [{ required: true, message: '请选择指标代码', trigger: 'change' }],
  },
  btList: [
    { type: 'primary', label: '确认', event: saveData }
  ]
})

const imageDialogVisible = ref(false)

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
    schemeId: props.id,
  }
  tableInfo.value.refresh = Math.random()
}

async function saveData() {
  dialogInfo.loading = true
  let isValid = true
  await dialogInfo.refObj.validate(flag => isValid = flag)
  if (!isValid) return
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
  setTimeout(function() {
    dialogInfo.loading = false
  }, 300)
}

function saveAndAdd() {
  pageRef.value.validate().then(res => {
    save(null, false)
  }).catch(err => {
    save(err)
  })
}
const save = (err, close = true) => {
  if(tableInfo.value.data.length === 0) return proxy.$message.warning('请添加明细数据')
  if (err) return
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
  dialogInfo.row = cloneDeep(row) || {}
  dialogInfo.title = row ? '修改指标信息' : '新增指标信息'
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
  tableParameter.type = 'assessmentIndicators'
  tableParameter.query = { idNotIn: tableInfo.value.data.map(it => it.indicatorsId).toString() }
  tableParameter.callBack = (raw) => {
    dialogInfo.row.indicatorsId = raw.id
    dialogInfo.row.indicatorsCode = raw.code
    dialogInfo.row.indicatorsName = raw.name
  }
  openDialog(dialogInfoRef.value)
}
</script>

<template>
  <ModifyPage ref="pageRef" v-model:visible="showDialog" :title="title" :btnList="pageBtn" @save="save">
    <ModifyForm :form-info="formInfo" :list-type-info="formInfo.options">
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
  <el-dialog v-model="imageDialogVisible" title="图形说明" width="40%">
    <el-image :src="imageDialogSrc" />
  </el-dialog>
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
