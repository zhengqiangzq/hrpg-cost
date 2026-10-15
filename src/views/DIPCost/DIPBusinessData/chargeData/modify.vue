<script setup>
import {getCurrentInstance, reactive, ref} from "vue";
import ModifyPage from "@/components/ModifyPage/ModifyPage.vue";
import ModifyForm from "@/components/ModifyPage/ModifyForm.vue";
import ModifyTable from "@/components/ModifyPage/ModifyTable.vue";
import {
  addChargeData, addDetailChargeData, deleteDetailChargeData,
  exportDetailChargeData,
  oneChargeData,
  pageDetailChargeData,
  updateChargeData, updateDetailChargeData
} from "@/api/DIPCost/DIPCostChargeData";
import {useUpload} from "@/hooks/useUpload";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {exportTemplateExcel} from "@/api/pub";
import cloneDeep from "lodash/cloneDeep";
import {sectiontree} from "@/api/accountingDepartment";

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

const PERMISSION_CODE = 'DIPCostChargeData'
const { proxy } = getCurrentInstance();
const API = {
  one: oneChargeData,
  pageDetail: pageDetailChargeData,
  add: addChargeData,
  addDetail: addDetailChargeData,
  delete: deleteDetailChargeData,
  batchAdd: null,
  update: updateChargeData,
  updateDetail: updateDetailChargeData,
  download: exportTemplateExcel,
  export: exportDetailChargeData
}

const TEMPLATE_NAME = 'DIP成本-收费数据明细导入模板'
const UPLOAD_PATH = `/dip/businessData/chargeDataDetails/import/excel/${props.id}`

const {
  uploadInfo,
  beforeUpload,
  downloadTemplate,
  uploadSuccess,
  uploadError,
  exportData
} = useUpload(API, TEMPLATE_NAME, UPLOAD_PATH, () => successCallback())

const emit = defineEmits()
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
  title: '收入单据',
  fieldList: [
    { label: '单据号', value: 'orderNo', type: 'input', show: !!props.id, disabled: true },
    { label: '核算期间', value: 'accountingPeriodName', type: 'slot' },
    { label: '总金额', value: 'totalMoney', type: 'money', disabled: true },
    { label: '确认状态', value: 'statusName', type: 'input', show: !!props.id, disabled: true },
    { label: '备注', value: 'remark', type: 'input' },
  ],
  rules: {
    accountingPeriodName: [{ required: true, message: '请选择核算期间', trigger: 'change' }]
  },
  data: {
  }
})

const tableInfo = ref({
  query: {},
  title: '明细信息',
  fieldList: [
    { label: '住院号', value: 'hospitalAdmissionNumber' },
    { label: '收费项目编码', value: 'chargeItemCode' },
    { label: '收费项目名称', value: 'chargeItemName' },
    { label: '收费类别编码', value: 'feeCategoryCode' },
    { label: '收费类别名称', value: 'feeCategoryName' },
    { label: '开单科室编码', value: 'orderDeptCode' },
    { label: '开单科室名称', value: 'orderDeptName' },
    { label: '执行科室编码', value: 'executeDeptCode' },
    { label: '执行科室名称', value: 'executeDeptName' },
    { label: '数量', value: 'qty', align: 'center' },
    { label: '单价', value: 'unitPrice', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.unitPrice) },
    { label: '金额', value: 'money', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.money) },
    { label: '备注', value: 'remark' },
  ],
  summaryFieldList: [
    { value: 'qty', formatter: proxy.$fn.TripartiteMethod },
    { value: 'money', formatter: proxy.$fn.TripartiteMethod },
  ],
  data: [],
  btnList: [
    { type: 'button', label: '添加明细', show: proxy.$permission(`${PERMISSION_CODE}:add`), event: () => openModify() },
    { type: 'button', label: '删除', show: proxy.$permission(`${PERMISSION_CODE}:delete`), event: () => deleteData() },
    { type: 'button', label: '下载模板', show: props.id && proxy.$permission(`${PERMISSION_CODE}:download`), event: () => downloadTemplate() },
    { type: 'slot', label: '导入', show: props.id && proxy.$permission(`${PERMISSION_CODE}:import`), value: 'uploadFile', },
    { type: 'button', label: '导出Excel', show: props.id && proxy.$permission(`${PERMISSION_CODE}:export`), event: () => exportData(tableInfo.value.copyQuery), },
    { type: 'slot', label: '住院号', showLabel: true, show: !!props.id, value: 'hospitalAdmissionNumberLike' },
    { type: 'button', label: '查询', show: !!props.id, event: getTableData },
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
  title: '收费数据',
  visible: false,
  fieldList: [
    { label: '住院号', span: 12, value: 'hospitalAdmissionNumber', type: 'input' },
    { label: '收费项目', span: 12, value: 'chargeItemName', type: 'slot' },
    { label: '收费类别', span: 12, value: 'feeCategoryName', type: 'input', disabled: true },
    { label: '开单科室', span: 12, value: 'orderDeptName', type: 'slot' },
    { label: '执行科室', span: 12, value: 'executeDeptName', type: 'slot' },
    { label: '金额', span: 12, value: 'money', type: 'number', precision: 2 },
    { label: '数量', span: 12, value: 'qty', type: 'number' },
    { label: '单价', span: 12, value: 'unitPrice', type: 'money', disabled: true },
    { label: '备注', span: 12, value: 'remark', type: 'input' },
  ],
  rules: {
    hospitalAdmissionNumber: [{ required: true, message: '请输入住院号', trigger: 'blur' }],
    chargeItemName: [{ required: true, message: '请选择收费项目', trigger: 'change' }],
    orderDeptName: [{ required: true, message: '请选择开单科室', trigger: 'change' }],
    executeDeptName: [{ required: true, message: '请选择执行科室', trigger: 'change' }],
    money: [{ required: true, message: '请输入金额', trigger: 'blur' }, { type: 'number', min: 0, message: '金额不能小于零', trigger: 'blur' }],
    qty: [{ required: true, message: '请输入数量', trigger: 'blur' }, { type: 'number', min: 0, message: '请输入正确数量', trigger: 'blur' }],
    unitPrice: [{ required: true, message: '请输入单价', trigger: 'blur' }, { type: 'number', min: 0, message: '单价不能小于零', trigger: 'blur' }],
  },
  btList: [
    { type: 'primary', label: '确认', event: saveData }
  ]
})

// 核算科室
const deptTreeInfo = reactive({
  title: '核算科室',
  visible: false,
  checkBox: false,
  checkStrictly: true,
  isLeaf: true,
  mark: null,
  api: sectiontree,
  query: {}
})

watch(() => tableInfo.value.sectionRows, (rows) => {
  const btns = tableInfo.value.btnList
  const deleteBtn = btns.find(it => it.label === '删除')
  deleteBtn.disabled = !rows.length
}, { immediate: true })

watch(() => (dialogInfo.row.money || 0) / (dialogInfo.row.qty || 1), (unitPrice) => {
  dialogInfo.row.unitPrice = unitPrice
}, { deep: true })

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
  tableInfo.value.api = API.pageDetail
  tableInfo.value.copyQuery = {
    ...tableInfo.value.query,
    dipChargeDataId: props.id,
    sort: 'hospital_admission_number desc, create_time desc'
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
    if (isAdd) {
      tableInfo.value.data.push(dialogInfo.row)
    } else {
      tableInfo.value.data[dialogInfo.index] = dialogInfo.row
    }
    tableInfo.value.data = tableInfo.value.data.sort((a, b) => b.hospitalAdmissionNumber.localeCompare(a.hospitalAdmissionNumber))
    formInfo.value.data.totalMoney = tableInfo.value.data.reduce((prev, cur) => prev + cur.money, 0)
    dialogInfo.visible = false
  } else {
    const api = isAdd ? API.addDetail : API.updateDetail
    api({
      ...dialogInfo.row,
      dipChargeDataId: relativeId
    }).then(res => {
      if (res.success) {
        formInfo.value.data.totalMoney = res.data.totalMoney
        proxy.$message.success('保存成功')
        dialogInfo.visible = false
        getTableData()
      }
    })
  }
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
    detailsVOs: tableInfo.value.data
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
  dialogInfo.title = row ? '修改明细数据' : '新增明细数据'
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
          API.delete(ids).then(({ code, data }) => {
            if (code === 200) {
              formInfo.value.data.totalMoney = data?.totalMoney
              proxy.$message.success('删除成功')
              getTableData()
            }
          })
        } else {
          tableInfo.value.data = tableInfo.value.data.filter(it => sections.indexOf(it) == -1)
        }
  })
}

// 表格事件处理
const tableHandler = (eventName, raw) => {
  if (eventName === 'tableCheck') {
    tableInfo.value.sectionRows = raw
  }
}

function successCallback() {
  API.one(props.id).then(res => {
    if (res.success) {
      formInfo.value.data.totalMoney = res.data.totalMoney
    }
  })
  getTableData()
}

function openAccountingPeriod() {
  tableParameter.type = 'DIPPeriod'
  tableParameter.query = {}
  tableParameter.callBack = accountingPeriodCallback
  openDialog(formInfo.value.formRef)
}
function accountingPeriodCallback(raw) {
  formInfo.value.data.accountingPeriodId = raw.id
  formInfo.value.data.accountingPeriodName = raw.name
}

function openChargeItemSelector() {
  tableParameter.type = 'feeItem'
  tableParameter.query = {
    status: '1',
    accountingStatus: 1
  }
  tableParameter.callBack = chargeItemCallback
  openDialog(dialogInfoRef.value)
}
function chargeItemCallback(raw) {
  dialogInfo.row.chargeItemId = raw.id
  dialogInfo.row.chargeItemCode = raw.code
  dialogInfo.row.chargeItemName = raw.name
  dialogInfo.row.feeCategoryId = raw.feeCategoryId
  dialogInfo.row.feeCategoryCode = raw.feeCategoryCode
  dialogInfo.row.feeCategoryName = raw.feeCategoryName
}

function openDeptSelector(mark) {
  deptTreeInfo.checkBox = false
  deptTreeInfo.mark = mark
  deptTreeInfo.visible = true
}
function treeCallback(raw) {
  if (deptTreeInfo.mark === 'execute') {
    dialogInfo.row.executeDeptId = raw.id
    dialogInfo.row.executeDeptCode = raw.code
    dialogInfo.row.executeDeptName = raw.name
  } else {
    dialogInfo.row.orderDeptId = raw.id
    dialogInfo.row.orderDeptCode = raw.code
    dialogInfo.row.orderDeptName = raw.name
  }
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
    </ModifyForm>
    <ModifyTable :isDynamic="true" :pager="!!props.id" :table-info="tableInfo" @handleEvent="tableHandler">

      <template #filter-hospitalAdmissionNumberLike>
        <el-input
            v-model="tableInfo.query.hospitalAdmissionNumberLike"
            class="not-mongolia"
            type="input"
        >
        </el-input>
      </template>
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
  <dialog-form :title="dialogInfo.title" :btList="dialogInfo.btList" v-model:visible="dialogInfo.visible">
    <page-form
        ref="dialogInfoRef"
        v-model:ref-obj="dialogInfo.refObj"
        :label-width="dialogInfo.labelWidth"
        :data="dialogInfo.row"
        :field-list="dialogInfo.fieldList"
        :rules="dialogInfo.rules"
    >
      <template #form-chargeItemName>
        <el-input
            v-model="dialogInfo.row.chargeItemName"
            class="not-mongolia"
            type="input"
            placeholder="请选择收费项目"
            :disabled="true"
        >
          <template #append>
            <el-icon @click="openChargeItemSelector"><Search /></el-icon>
          </template>
        </el-input>
      </template>
      <template #form-orderDeptName>
        <el-input
            v-model="dialogInfo.row.orderDeptName"
            class="not-mongolia"
            type="input"
            placeholder="请选择开单科室"
            :disabled="true"
        >
          <template #append>
            <el-icon @click="openDeptSelector"><Search /></el-icon>
          </template>
        </el-input>
      </template>
      <template #form-executeDeptName>
        <el-input
            v-model="dialogInfo.row.executeDeptName"
            class="not-mongolia"
            type="input"
            placeholder="请选择执行科室"
            :disabled="true"
        >
          <template #append>
            <el-icon @click="openDeptSelector('execute')"><Search /></el-icon>
          </template>
        </el-input>
      </template>
    </page-form>
  </dialog-form>
  <!--    查询核算科室-->
  <SelectDeptArchivesTree
      v-if="deptTreeInfo.visible"
      v-model:showDialog="deptTreeInfo.visible"
      :title="deptTreeInfo.title"
      :checkStrictly="deptTreeInfo.checkStrictly"
      :isLeaf="deptTreeInfo.isLeaf"
      :query="deptTreeInfo.query"
      :checkBox="deptTreeInfo.checkBox"
      :api="deptTreeInfo.api"
      accountAttribute="1,2"
      :diseaseAccountStatus="1"
      :sectionAttributeNot="1"
      :highlight-current="true"
      @callback="treeCallback" />
</template>

<style scoped lang="scss">

</style>
