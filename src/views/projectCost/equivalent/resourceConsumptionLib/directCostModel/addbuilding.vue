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
          <template #form-assetsItemName>
            <el-input
                v-model="state.data.assetsItemName"
                class="not-mongolia"
                type="input"
                placeholder="请选择资产卡片"
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
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {
  addBuildingResourceConsumptionLibDirectCostModel,
  updateBuildingResourceConsumptionLibDirectCostModel
} from "@/api/projectCost/resourceConsumptionLibDirectCostModel";
const props = defineProps({
  title: {
    type: String,
    default: ''
  },
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
    {label: '卡片号', span: 12, value: 'assetsItemName', type: 'slot'},
    {label: '项目占用面积(平方米)', span: 12, value: 'area', type: 'number', min: 0, precision: 2 },
  ],
  data: {},
  rules: {
    assetsItemName: [{ required: true, message: '请选择资产卡片', trigger: 'blur'}],
    area: [{ required: true, message: '请输入项目占用面积', trigger: 'blur'}],
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
  const api = id ? updateBuildingResourceConsumptionLibDirectCostModel : addBuildingResourceConsumptionLibDirectCostModel
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
  tableParameter.checkBox = false
  tableParameter.title = '资产卡片'
  tableParameter.visible = true
  tableParameter.type = 'assetArea'
  tableParameter.query = { }
  tableParameter.callBack = (raw) => {
    if(!raw) return
    state.data.assetsItemId = raw.assetsItemId
    state.data.assetsItemName = raw.assetsItemName
  }
  openDialog(pageFormRef.value, 'table')
}
</script>
