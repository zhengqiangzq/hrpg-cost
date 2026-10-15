<template>
  <div class="checkBox">
    <el-dialog
        draggable
        :append-to-body="true"
        :title="title"
        v-model="state.dialogVisible"
        custom-class="page-dialog"
        :close-on-click-modal="false"
        :modal="false"
        @close="cancel"
    >
      <div class="model-panel-body paddingBox order-model-formBox flex_wrap_start_start" v-if="state.dialogVisible">
        <page-form
            ref="pageFormRef"
            v-model:ref-obj="formRef"
            :data="state.data"
            :field-list="state.fieldList"
            :rules="state.rules"
            :label-width="state.labelWidth">
          <template #form-assistDeptName>
            <el-input
                v-model="state.data.assistDeptName"
                class="not-mongolia"
                type="input"
                placeholder="请选择协助科室"
                :disabled="true"
            >
              <template #append>
                <el-icon @click="opendept"><Search /></el-icon>
              </template>
            </el-input>
          </template>
          <template #form-technicalTitleName>
            <el-input
                v-model="state.data.technicalTitleName"
                class="not-mongolia"
                type="input"
                placeholder="请选择技术职称"
                :disabled="true"
            >
              <template #append>
                <el-icon @click="opentechnology"><Search /></el-icon>
              </template>
            </el-input>
          </template>
        </page-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="userUpdate">{{
              $t('btn_confirm')
            }}</el-button>
          <el-button @click="cancel">{{ $t('btn_cancel') }}</el-button>
        </span>
      </template>
    </el-dialog>
    <SelectTechnicalTitleTree
        v-if="treeInfo.visible"
        v-model:showDialog="treeInfo.visible"
        :title="treeInfo.title"
        :checkStrictly="treeInfo.checkStrictly"
        :isLeaf="treeInfo.isLeaf"
        :query="treeInfo.query"
        :checkBox="treeInfo.checkBox"
        :api="treeInfo.api"
        :highlight-current="true"
        @callback="treeCallback" />
  </div>
</template>
<script setup>
import {ref, watch, getCurrentInstance} from "vue";
import {
  paramdirectModeladdLaborReceive,
  paramdirectModelupdateLaborReceive
} from "@/api/accountingModel";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  colTemplate: 1,
  tableRow: {
    type: Object,
    default: {},
  },
  visible: {
    type: Boolean,
    default: false,
  },
})
const { proxy } = getCurrentInstance()

const pageFormRef = ref()
const formRef = ref()

const { tableParameter, openDialog } = useSelectTableData()
const state = reactive({
  dialogVisible: false,
  labelWidth: '120px',
  fieldList: [
    {label: '协助科室', span: 12, value: 'assistDeptName', type: 'slot'},
    {label: '技术职称', span: 12, value: 'technicalTitleName', type: 'slot'},
    {label: '人数', span: 12, value: 'personNum', type: 'number' },
    {label: '工时', span: 12, value: 'workDuration', type: 'money' },
    {label: '工作量系数', span: 12, value: 'coefficient', type: 'money' },
  ],
  data: {},
  rules: {
    assistDeptName: [{ required: true, message: '请选择协助科室', trigger: 'blur'}],
    technicalTitleName: [{ required: true, message: '请选择技术职称', trigger: 'blur'}],
    personNum: [{ required: true, message: '请输入人数', trigger: 'blur'}],
    workDuration: [{ required: true, message: '请输入工时', trigger: 'blur'}],
    coefficient: [{ required: true, message: '请输入工作量系数', trigger: 'blur'}],
  },
})
const emit = defineEmits()


watch(
    () => props.visible,
    (val) => {
      state.dialogVisible = val
    },
    {
      immediate: true,
    }
)
watch(
    () => props.tableRow,
    (val) => {
      state.data = Object.assign(state.data, val)
    },
    {
      immediate: true,
    }
)

function cancel() {
  state.dialogVisible = false
  state.data = {}
  emit('callback', false)
}
function userUpdate() {
  const id = props.tableRow.id
  //新增or编辑用户
  const api = id ? paramdirectModelupdateLaborReceive : paramdirectModeladdLaborReceive
  formRef.value.validate((valid) => {
    if (valid) {
      const laborList = state.data.id ? '' : lador(state.data)
      const fromData = state.data.id ? {...state.data} :{
        executeDeptId: state.data.executeDeptId,
        feeItemId: state.data.feeItemId,
        itemParamDirectModelId: state.data.itemParamDirectModelId,
        laborReceiveList: laborList,
      }
          api(fromData).then(({ code, data }) => {
        if (code === 200) {
          state.dialogVisible = false
          emit('callback', data)
        }
      })
    }
  })
}
// 处理数据
function lador(row) {
  const data = []
  row.technicalTitleId.forEach((it) => {
    data.push({
      coefficient: row.coefficient,
      technicalTitleId: it,
      assistDeptId: row.assistDeptId,
      personNum: row.personNum,
      workDuration: row.workDuration,
    })
  })
  return data;
}


const treeInfo = ref({
  title: '',
  visible: false,
  checkBox: true,
  checkStrictly: false,
  isLeaf: false,
  query: {}
})
function opentechnology() {
  treeInfo.value.checkBox = !state.data.id
  treeInfo.value.title = '技术职称'
  treeInfo.value.visible = true
}
function treeCallback(raw) {
  if(!raw) return
  if(typeof raw === 'object' && !raw.length) {
    state.data.technicalTitleId = raw.id
    state.data.technicalTitleCode = raw.code
    state.data.technicalTitleName = raw.name
  } else {
    state.data.technicalTitleId = raw.map((it) => it.id)
    state.data.technicalTitleCode = raw.map((it) => it.code)
    state.data.technicalTitleName = raw.map((it) => it.name)
  }
}

function opendept() {
  console.log(state.data)
  tableParameter.title = '协作科室'
  tableParameter.visible = true
  tableParameter.checkBox = false
  tableParameter.type = 'feeRelation'
  tableParameter.query = { executeDeptIdList: [state.data.deptId], feeItemIdList: [state.data.feeItemId], filterDept: true }
  tableParameter.filters = [
    { type: 'input', label: '编码/名称', value: 'nameOrCode' }
  ]
  tableParameter.callBack = treedeptCallback
  openDialog(pageFormRef.value, 'table')
}

function treedeptCallback(raw) {
  console.log(raw)
  if(!raw) return
  state.data.assistDeptId = raw.orderDeptId
  state.data.assistDeptCode = raw.orderDeptCode
  state.data.assistDeptName = raw.orderDeptName
}

</script>
