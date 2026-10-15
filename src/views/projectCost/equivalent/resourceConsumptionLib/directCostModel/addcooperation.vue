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
  </div>
</template>
<script setup>
import {ref, watch, getCurrentInstance} from "vue";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {
  addCooperationResourceConsumptionLibDirectCostModel, updateCooperationResourceConsumptionLibDirectCostModel
} from "@/api/projectCost/resourceConsumptionLibDirectCostModel";

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
  fieldList: [
    {label: '协助科室', span: 12, value: 'assistDeptName', type: 'slot'},
    {label: '人力资源消耗相对值', span: 12, value: 'cooperationRelativeVal', type: 'number', min: 0, precision: 2 },
  ],
  data: {},
  rules: {
    assistDeptName: [{ required: true, message: '请选择协助科室', trigger: 'blur'}],
    cooperationRelativeVal: [{ required: true, message: '请输入人力资源消耗相对值', trigger: 'blur'}],
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
  const api = id ? updateCooperationResourceConsumptionLibDirectCostModel : addCooperationResourceConsumptionLibDirectCostModel
  formRef.value.validate((valid) => {
    if (valid) {
      console.log(props.tableRow)
      const form = {
        ...state.data,
        deptId: props.tableRow.deptId
      }
      const fromData = state.data.id ? form : [form]
          api(fromData).then(({ code, data }) => {
        if (code === 200) {
          state.dialogVisible = false
          emit('callback', data)
        }
      })
    }
  })
}

const treeInfo = ref({
  title: '',
  visible: false,
  checkBox: true,
  checkStrictly: false,
  isLeaf: false,
  query: {}
})

function opendept() {
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
  if(!raw) return
  state.data.assistDeptId = raw.orderDeptId
  state.data.assistDeptCode = raw.orderDeptCode
  state.data.assistDeptName = raw.orderDeptName
}

</script>

