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
          <template #form-productName>
            <el-input
                v-model="state.data.productName"
                class="not-mongolia"
                type="input"
                placeholder="请选择材料消耗"
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
  paramdirectModeladdSupplies,
  paramdirectModelupdateSupplies
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
    {label: '物资名称', span: 12, value: 'productName', type: 'slot'},
    {label: '消耗量', span: 12, value: 'num', type: 'money' },
  ],
  data: {},
  rules: {
    productName: [{ required: true, message: '请选择物资名称', trigger: 'blur'}],
    num: [{ required: true, message: '请输入消耗量', trigger: 'blur'}],
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
  const api = id ? paramdirectModelupdateSupplies : paramdirectModeladdSupplies
  formRef.value.validate((valid) => {
    if (valid) {
      const laborList = state.data.id ? '' : lador(state.data)
      const fromData = state.data.id ? {...state.data} : {
        executeDeptId: state.data.executeDeptId,
        feeItemId: state.data.feeItemId,
        itemParamDirectModelId: state.data.itemParamDirectModelId,
        suppliesList: laborList,
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

function lador(row) {
  const data = []
  row.productId.forEach((it) => {
    data.push({
      productId: it,
      num: row.num,
    })
  })
  return data;
}

function opentechnology() {
  tableParameter.checkBox = !state.data.id
  tableParameter.title = '物资目录'
  tableParameter.visible = true
  tableParameter.type = 'product'
  tableParameter.query = { 'status': '1', isCharge: '0' }
  tableParameter.callBack = feeItemCallback
  openDialog(pageFormRef.value, 'table')
}
function feeItemCallback(raw) {
  if(!raw) return
  if(typeof raw === 'object' && !raw.length) {
    state.data.productId = raw.id
    state.data.productCode = raw.code
    state.data.productName = raw.name
  } else {
    state.data.productId = raw.map((it) => it.id)
    state.data.productName = raw.map((it) => it.name)
  }
}

</script>
