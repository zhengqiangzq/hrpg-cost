<script setup>
import {getCurrentInstance, reactive, ref, watch} from "vue";
import ModifyPage from "@/components/ModifyPage/ModifyPage.vue";
import ModifyForm from "@/components/ModifyPage/ModifyForm.vue";
import ModifyTable from "@/components/ModifyPage/ModifyTable.vue";
import {
  addResourceConsumptionLibIndirectCostModel,
  oneResourceConsumptionLibIndirectCostModel, updateResourceConsumptionLibIndirectCostModel
} from "@/api/projectCost/resourceConsumptionLibIndirectCostModel";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {
  addDetailKeyFactorsValue,
  addKeyFactorsValue, deleteDetailKeyFactorsValue, oneKeyFactorsValue, pageDetailKeyFactorsValue,
  updateDetailKeyFactorsValue, updateKeyFactorsValue
} from "@/api/projectCost/keyFactorsValue";

const store = useStore()
const { proxy } = getCurrentInstance();

const PERMISSION_CODE = 'keyFactorsValue'

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
const pageBtn = ref([

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

const { tableParameter, openDialog } = useSelectTableData()

const formRef = ref()
const formInfo = ref({
  title: '计算方法',
  fieldList: [
    { label: '单据号', value: 'docNum', show: !!props.id, type: 'input', disabled: true },
    { label: '核算期间', value: 'accountingPeriodName', type: 'slot' },
    { label: '关键因素', value: 'keyFactorSettingName', type: 'slot' },
    { label: '确认状态', value: 'status', show: !!props.id, type: 'select-model', code: 'cost_document_status', disabled: true },
    { label: '备注', value: 'remark', type: 'input' },
  ],
  rules: {
    accountingPeriodName: [{ required: true, message: '请选择核算期间' }],
    keyFactorSettingName: [{ required: true, message: '请选择关键因素' }],
  },
  data: {
    status: 0,
  }
})

const tableInfo = ref({
  refresh: 1,
  title: '明细信息',
  fieldList: [
    { label: '科室编码', value: 'deptCode' },
    { label: '科室名称', value: 'deptName' },
    { label: '服务项目编码', value: 'feeItemCode' },
    { label: '服务项目名称', value: 'feeItemName' },
    { label: '关键因素值', value: 'value' },
  ],
  data: [],
  btnList: [
    { type: 'button', label: '添加明细', event: () => addDetail() },
    { type: 'button', label: '删除', event: () => deleteDetail() },
  ],
  handle: {
    fixed: 'right',
    label: '操作',
    width: '130',
    btList: [
      {
        label: '编辑',
        show: proxy.$permission(`${PERMISSION_CODE}:update`),
        event: addDetail,
      },
      {
        label: '删除',
        show: proxy.$permission(`${PERMISSION_CODE}:delete`),
        event: deleteDetail,
      },
    ]
  },
  sectionRows: []
})

const tableData = ref()

const dialogRef = ref()
const dialogInfo = reactive({
  refObj: null,
  row: {},
  title: '科室关键因素值',
  visible: false,
  fieldList: [
    { label: '核算科室', span: 12, value: 'deptName', type: 'slot' },
    { label: '服务项目', span: 12, value: 'feeItemName', type: 'slot' },
    { label: '关键因素值', span: 12, value: 'value', type: 'number', min: 0, precision: 2 },
  ],
  rules: {
    deptName: [{ required: true, message: '请选择核算科室', trigger: 'change' }],
    feeItemName: [{ required: true, message: '请选择服务项目', trigger: 'change' }],
    value: [{ required: true, message: '请输入关键因素值', trigger: 'blur' }],
  },
  btList: [
    { type: 'primary', label: '确认', event: saveData }
  ]
})

const treeInfo = ref({
  title: '科室信息',
  visible: false,
  checkBox: false,
  checkStrictly: false,
  isLeaf: true,
  query: {},
  checkedList: []
})

watch(() => tableInfo.value.sectionRows, (rows) => {
  const btns = tableInfo.value.btnList
  const deleteBtn = btns.find(it => it.label === '删除')
  deleteBtn.disabled = rows.length === 0
}, { immediate: true })

onMounted(() => {
  if (props.id) {
    getMain()
    tableInfo.value.api = pageDetailKeyFactorsValue
    getList()
  } else {
  }
})
function handleEvent(eventName,raw) {
  if (eventName === 'tableCheck') {
    tableInfo.value.sectionRows = raw
  }
}

function getMain() {
  tableInfo.value.data = []
  oneKeyFactorsValue(props.id).then(res => {
    formInfo.value.data = res.data
  })
}

function getList() {
  tableInfo.value.query = {
    keyFactorValueId: props.id
  }
  tableInfo.value.refresh = Math.random()
}

const save = (err, close = true) => {
  if (err) return
  if(tableInfo.value.data.length === 0) return proxy.$message.warning('请添加明细数据')
  const api = props.id ? updateKeyFactorsValue : addKeyFactorsValue
  api({
    ...formInfo.value.data,
    detailVOList: !!props.id ? undefined : tableInfo.value.data
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

function addDetail(row) {
  dialogInfo.sourceRow = row
  dialogInfo.row = JSON.parse(JSON.stringify(row || {}))
  dialogInfo.isEdit = !!row
  dialogInfo.visible = true
}

function deleteDetail(row) {
  const rows = row ? [row] : tableInfo.value.sectionRows
  if (!props.id) {
    tableInfo.value.data = tableInfo.value.data.filter(it => !rows.includes(it))
  } else {
    if(rows.length === tableInfo.value.data.length) return proxy.$message.warning('明细数据不能为空')
    proxy
      .$confirm('删除后将改变数据,是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
      deleteDetailKeyFactorsValue(rows.map(it => it.id)).then(({ code }) => {
        if (code === 200) {
          proxy.$message.success('删除成功')
          getList()
        }
      })
    })
  }
}

function saveData() {
  dialogInfo.refObj.validate(flag => {
    if (flag) {
      (!props.id && noIdModify()) || idModify()
    }
  })
}
function noIdModify() {
  if (!dialogInfo.isEdit) {
    tableInfo.value.data.push(dialogInfo.row)
  } else {
    Object.assign(dialogInfo.sourceRow, dialogInfo.row)
  }
  dialogInfo.visible = false
  return true
}

function idModify() {
  const api = dialogInfo.isEdit ? updateDetailKeyFactorsValue : addDetailKeyFactorsValue
  api({
    ...dialogInfo.row,
    keyFactorValueId: props.id
  }).then(res => {
    if (res.success) {
      proxy.$message.success('保存成功')
      dialogInfo.visible = false
      getList()
    }
  })
}

function openAccountingPeriodSelector() {
  tableParameter.type = 'itemaccountingPeriod'
  tableParameter.callBack = (raw) => {
    formInfo.value.data.accountingPeriodId = raw.id
    formInfo.value.data.accountingPeriodName = raw.name
  }
  tableParameter.visible = true
  openDialog(formRef.value)
}

function openKeyFactorsSelector() {
  tableParameter.type = 'keyFactors'
  tableParameter.title = '关键因素'
  tableParameter.query = {}
  tableParameter.callBack = (raw) => {
    formInfo.value.data.keyFactorSettingId = raw.id
    formInfo.value.data.keyFactorSettingCode = raw.code
    formInfo.value.data.keyFactorSettingName = raw.name
  }
  tableParameter.visible = true
  openDialog(formRef.value)
}

function openDeptSelector(name) {
  treeInfo.value.type = name
  treeInfo.value.title = '科室信息'
  treeInfo.value.visible = true
}

function treeCallback(raw) {
  dialogInfo.row.deptId = raw.id
  dialogInfo.row.deptCode = raw.code
  dialogInfo.row.deptName = raw.name
}

function openFeeItemSelector() {
  tableParameter.title = '服务项目'
  tableParameter.visible = true
  tableParameter.type = 'feeItem'
  tableParameter.callBack = (raw) => {
    dialogInfo.row.feeItemId = raw.id
    dialogInfo.row.feeItemCode = raw.code
    dialogInfo.row.feeItemName = raw.name
  }
  openDialog(dialogRef.value)
}
</script>

<template>
  <ModifyPage ref="pageRef" v-model:visible="showDialog" :title="title" :btnList="pageBtn" @save="save">
    <ModifyForm
        ref="formRef"
        :form-info="formInfo"
        @handleEvent="handleEvent"
    >
      <template #form-accountingPeriodName>
        <el-input
            v-model="formInfo.data.accountingPeriodName"
            class="not-mongolia"
            placeholder="请选择核算期间"
            :disabled="true"
        >
          <template #append>
            <el-icon @click="openAccountingPeriodSelector"><Search /></el-icon>
          </template>
        </el-input>
      </template>
      <template #form-keyFactorSettingName>
        <el-input
            v-model="formInfo.data.keyFactorSettingName"
            class="not-mongolia"
            placeholder="请选择关键因素"
            :disabled="true"
        >
          <template #append>
            <el-icon @click="openKeyFactorsSelector"><Search /></el-icon>
          </template>
        </el-input>
      </template>
    </ModifyForm>
    <ModifyTable :pager="!!props.id" :checkbox="true" :isDynamic="true" :table-info="tableInfo" @handle-event="handleEvent">
    </ModifyTable>
  </ModifyPage>
  <dialog-form :title="dialogInfo.title" width="40%" :btList="dialogInfo.btList" v-model:visible="dialogInfo.visible">
    <div class="order-model-formBox">
    <page-form
      ref="dialogRef"
      v-model:ref-obj="dialogInfo.refObj"
      :label-width="dialogInfo.labelWidth"
      :data="dialogInfo.row"
      :field-list="dialogInfo.fieldList"
      :rules="dialogInfo.rules"
    >
      <template #form-deptName>
        <el-input
          v-model="dialogInfo.row.deptName"
          class="not-mongolia"
          placeholder="请选择科室信息"
          :disabled="true"
        >
          <template #append><el-icon @click="openDeptSelector"><Search/></el-icon></template>
        </el-input>
      </template>
      <template #form-feeItemName>
        <el-input
          v-model="dialogInfo.row.feeItemName"
          class="not-mongolia"
          placeholder="请选择收费项目"
          :disabled="true"
        >
          <template #append><el-icon @click="openFeeItemSelector"><Search/></el-icon></template>
        </el-input>
      </template>
    </page-form>

    </div>
  </dialog-form>
  <SelectProDeptTree
    v-if="treeInfo.visible"
    v-model:showDialog="treeInfo.visible"
    :title="treeInfo.title"
    :checkStrictly="treeInfo.checkStrictly"
    :isLeaf="treeInfo.isLeaf"
    :query="treeInfo.query"
    :checkBox="treeInfo.checkBox"
    :api="treeInfo.api"
    :highlight-current="true"
    @callback="treeCallback"/>
</template>

<style scoped lang="scss">

</style>
