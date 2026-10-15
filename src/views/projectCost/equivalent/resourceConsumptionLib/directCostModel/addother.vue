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
          <template #form-costItemName>
            <el-input
                v-model="state.data.costItemName"
                class="not-mongolia"
                type="input"
                placeholder="请选择成本项目"
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
  </div>
</template>
<script setup>
import {ref, watch, getCurrentInstance} from "vue";
import {
  paramdirectModeladdOtherCost,
  paramdirectModelupdateOtherCost
} from "@/api/accountingModel";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {
  addOtherResourceConsumptionLibDirectCostModel,
  updateOtherResourceConsumptionLibDirectCostModel
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
    {label: '成本项目', span: 12, value: 'costItemName', type: 'slot'},
    {label: '金额', span: 12, value: 'money', type: 'money' },
  ],
  data: {},
  rules: {
    costItemName: [{ required: true, message: '请选择成本项目', trigger: 'blur'}],
    money: [{ required: true, message: '请输入金额', trigger: 'blur'}],
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
  const api = id ? updateOtherResourceConsumptionLibDirectCostModel : addOtherResourceConsumptionLibDirectCostModel
  formRef.value.validate((valid) => {
    if (valid) {
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

function opentechnology() {
  tableParameter.title = '成本项目'
  tableParameter.visible = true
  tableParameter.checkBox = false
  tableParameter.type = 'ModelgetCostItem'
  tableParameter.query = { }
  tableParameter.filters = [
    { type: 'input', label: '编码/名称', value: 'nameOrCode' }
  ]
  tableParameter.callBack = feeItemCallback
  openDialog(pageFormRef.value, 'table')
}
function feeItemCallback(raw) {
  if(!raw) return
  state.data.costItemId = raw.id
  state.data.costItemCode = raw.code
  state.data.costItemName = raw.name
}

</script>

