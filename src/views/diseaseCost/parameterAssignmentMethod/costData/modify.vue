<script setup>
import {getCurrentInstance, reactive, ref} from "vue";
import ModifyPage from "@/components/ModifyPage/ModifyPage.vue";
import ModifyForm from "@/components/ModifyPage/ModifyForm.vue";
import ModifyTable from "@/components/ModifyPage/ModifyTable.vue";
import {
  addCostData,
  addCostDataDetail,
  deleteCostDataDetail, exportCostDataDetail,
  oneCostData, pageCostDataDetail,
  updateCostData, updateCostDataDetail
} from "@/api/diseaseCostParameterCostData";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import cloneDeep from "lodash/cloneDeep";
import {useUpload} from "@/hooks/useUpload";
import {exportTemplateExcel} from "@/api/pub";
import {sectiontree} from "@/api/accountingDepartment";
import {useStore} from "vuex";
import {useStorage} from "@vueuse/core";

const PERMISSION_CODE = 'diseaseParameterCostData'

const store = useStore()
const setting = useStorage('setting', {}, sessionStorage)
const { proxy } = getCurrentInstance();
const API = {
  one: oneCostData,
  pageDetail: pageCostDataDetail,
  add: addCostData,
  addDetail: addCostDataDetail,
  batchAdd: null,
  delete: deleteCostDataDetail,
  update: updateCostData,
  updateDetail: updateCostDataDetail,
  download: exportTemplateExcel,
  export: exportCostDataDetail,
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

const TEMPLATE_NAME = '成本数据明细-参数分配法导入模板'
const UPLOAD_PATH = `/methodParameter/diseaseCostDataDetails/import/excel/${props.id}`

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
    { label: '总金额', value: 'totalMoney', type: 'money', disabled: true },
    { label: '确认状态', value: 'statusName', type: 'input', show: !!props.id, disabled: true },
    { label: '备注', value: 'remark', type: 'input' },
  ],
  rules: {
    accountingPeriodName: [{ required: true, message: '请选择核算期间', trigger: 'change' }]
  },
  data: {
    orgId: setting.value.hospitalId
  }
})

const tableInfo = ref({
  title: '明细信息',
  query: {},
  fieldList: [
    { label: '科室编码', value: 'deptCode' },
    { label: '科室名称', value: 'deptName' },
    { label: '成本项目编码', value: 'costItemCode' },
    { label: '成本项目名称', value: 'costItemName' },
    { label: '资金来源', value: 'capitalSourceName' },
    { label: '总金额', value: 'money', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.money) },
    { label: '直接成本', value: 'directCost', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.directCost) },
    { label: '间接成本', value: 'indirectCost', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.indirectCost) },
  ],
  data: [],
  btnList: [
    { type: 'button', label: '添加明细', show: proxy.$permission(`${PERMISSION_CODE}:add`), event: () => openModify() },
    { type: 'button', label: '删除', show: proxy.$permission(`${PERMISSION_CODE}:delete`), event: () => deleteData() },
    { type: 'button', label: '下载模板', show: props.id && proxy.$permission(`${PERMISSION_CODE}:download`), event: () => downloadTemplate(undefined, `${PERMISSION_CODE}:download`) },
    { type: 'slot', label: '导入', show: props.id && proxy.$permission(`${PERMISSION_CODE}:import`), value: 'uploadFile', },
    { type: 'button', label: '导出Excel', show: props.id && proxy.$permission(`${PERMISSION_CODE}:export`), event: () => exportData(tableInfo.value.copyQuery), },
    { type: 'slot', label: '核算科室', showLabel: true, show: !!props.id, value: 'deptName' },
    { type: 'button', label: '查询', show: !!props.id, event: getTableData },
  ],
  summaryFieldList: [
    { value: 'money', formatter: proxy.$fn.TripartiteMethod },
    { value: 'directCost', formatter: proxy.$fn.TripartiteMethod },
    { value: 'indirectCost', formatter: proxy.$fn.TripartiteMethod },
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
  title: '成本数据',
  visible: false,
  fieldList: [
    { label: '科室编码', span: 12, value: 'deptCode', type: 'slot' },
    { label: '科室名称', span: 12, value: 'deptName', type: 'input', disabled: true },
    { label: '成本项目编码', span: 12, value: 'costItemCode', type: 'slot' },
    { label: '成本项目名称', span: 12, value: 'costItemName', type: 'input', disabled: true },
    { label: '资金来源', span: 12, value: 'capitalSource', type: 'select-model', code: 'asset_capital_source' },
    { label: '总金额', span: 12, value: 'money', type: 'money', disabled: true },
    { label: '直接成本', span: 12, value: 'directCost', type: 'money' },
    { label: '间接成本', span: 12, value: 'indirectCost', type: 'money' },
  ],
  rules: {
    deptCode: [{ required: true, message: '请选择科室', trigger: 'change' }],
    costItemCode: [{ required: true, message: '请选择成本项目', trigger: 'change' }],
    money: [{ required: true, message: '请输入金额', trigger: 'blur' }],
    directCost: [{ required: true, message: '请输入直接成本', trigger: 'blur' }],
    indirectCost: [{ required: true, message: '请输入间接成本', trigger: 'blur' }],
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
watch(() => Number(dialogInfo.row.directCost || 0) + Number(dialogInfo.row.indirectCost || 0), (total) => {
  dialogInfo.row.money = total
})

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

function getTableData() {
  tableInfo.value.api = API.pageDetail
  tableInfo.value.copyQuery = {
    ...tableInfo.value.query,
    deptName: undefined,
    deptCode: undefined,
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
    formInfo.value.data.totalMoney = tableInfo.value.data.reduce((prev, cur) => prev + cur.money, 0)
    dialogInfo.visible = false
  } else {
    const api = isAdd ? API.addDetail : API.updateDetail
    api({
      ...dialogInfo.row,
      orderId: relativeId
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
  API.one(props.id).then(res => {
    if (res.success) {
      formInfo.value.data.totalMoney = res.data.totalMoney
    }
  })
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

function openCostItemSelector() {
  tableParameter.type = 'costItem'
  tableParameter.query = {
    status: '1',
    last: true,
    diseaseAccountStatus: 1
  }
  tableParameter.callBack = costItemCallback
  openDialog(dialogInfoRef.value)
}
function costItemCallback(raw) {
  dialogInfo.row.costItemId = raw.id
  dialogInfo.row.costItemCode = raw.code
  dialogInfo.row.costItemName = raw.name
}

function openDeptSelector(mark) {
  deptTreeInfo.checkBox = false
  deptTreeInfo.mark = mark
  deptTreeInfo.visible = true
}
function treeCallback(raw) {
  const form = deptTreeInfo.mark === 'query' ? tableInfo.value.query : dialogInfo.row
  form.deptId = raw.id
  form.deptCode = raw.code
  form.deptName = raw.name
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
      <template #filter-deptName>
        <el-input
            v-model="tableInfo.query.deptName"
            class="not-mongolia"
            type="input"
            placeholder="请选择科室"
            :disabled="true"
        >
          <template #append>
            <el-icon @click="openDeptSelector('query')"><Search /></el-icon>
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
      <template #form-costItemCode>
        <el-input
            v-model="dialogInfo.row.costItemCode"
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
      <template #form-deptCode>
        <el-input
            v-model="dialogInfo.row.deptCode"
            class="not-mongolia"
            type="input"
            placeholder="请选择科室"
            :disabled="true"
        >
          <template #append>
            <el-icon @click="openDeptSelector('')"><Search /></el-icon>
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
