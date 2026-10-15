<!-- 现金缴存 - 新增/编辑页 -->
<script setup>
import { getCurrentInstance, onMounted, ref } from "vue"
import ModifyPage from "@/components/ModifyPage/ModifyPage.vue"
import ModifyForm from "@/components/ModifyPage/ModifyForm.vue"
import { getToDay } from "@/utils/slp"

const { proxy } = getCurrentInstance()

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
  id: '',
})

const showDialog = computed({
  get() {
    return props.visible
  },
  set(newValue) {
    emit('update:visible', newValue)
  },
})

const formInfo = ref({
  title: '基本信息',
  fieldList: [
    { label: '单据号', value: 'docNum', type: 'input', disabled: !!props.id },
    { label: '业务日期', value: 'docTime', type: 'date', valueFormat: 'YYYY-MM-DD' },
    { label: '现金账户', value: 'cashAccountName', showLabel: true, type: 'slot' },
    { label: '银行账户', value: 'bankAccountName', showLabel: true, type: 'slot' },
    { label: '缴存金额', value: 'depositMoney', type: 'input' },
    { label: '单据状态', value: 'docStatus', type: 'select-model', code: 'cost_document_status', disabled: true, show: props.id },
    { label: '结算状态', value: 'settleStatus', type: 'select-model', code: 'settle_status' },
    { label: '备注', value: 'remark', type: 'textarea' },
  ],
  rules: {
    docNum: [{ required: true, message: '请输入单据号', trigger: 'blur' }],
    docTime: [{ required: true, message: '请选择业务日期', trigger: 'change' }],
    cashAccountName: [{ required: true, message: '请选择现金账户', trigger: 'change' }],
    bankAccountName: [{ required: true, message: '请选择银行账户', trigger: 'change' }],
    depositMoney: [{ required: true, message: '请输入缴存金额', trigger: 'blur' }],
  },
  data: {}
})

onMounted(() => {
  if (props.id) {
    getMain()
  } else {
    DefaultData()
  }
})

function DefaultData() {
  formInfo.value.data.docTime = getToDay()
  formInfo.value.data.docStatus = '0'
  formInfo.value.data.settleStatus = '0'
}

function getMain() {
  formInfo.value.data = {
    id: props.id,
    docNum: 'JT202512130001',
    docTime: '2026-01-01',
    cashAccountName: '',
    cashAccountId: '',
    bankAccountName: '',
    bankAccountId: '',
    depositMoney: '',
    docStatus: '1',
    settleStatus: '1',
    remark: '',
  }
}

const save = (err) => {
  if (err) return
  const isAdd = !props.id
  proxy.$message.success(isAdd ? '新增成功' : '修改成功')
  showDialog.value = false
  emit('returnModify', true)
}

function returnBack() {
  emit('returnModify', true)
}

function openCashAccountSelector() {
  proxy.$message.info('请选择现金账户')
}

function openBankAccountSelector() {
  proxy.$message.info('请选择银行账户')
}
</script>

<template>
  <ModifyPage v-model:visible="showDialog" :title="title" @returnBack="returnBack" @save="save">
    <ModifyForm :form-info="formInfo">
      <template #form-cashAccountName>
        <el-input
          v-model="formInfo.value.data.cashAccountName"
          class="not-mongolia"
          type="input"
          placeholder="请选择现金账户"
          :disabled="false"
        >
          <template #append>
            <el-icon @click="openCashAccountSelector"><Search /></el-icon>
          </template>
        </el-input>
      </template>
      <template #form-bankAccountName>
        <el-input
          v-model="formInfo.value.data.bankAccountName"
          class="not-mongolia"
          type="input"
          placeholder="请选择银行账户"
          :disabled="false"
        >
          <template #append>
            <el-icon @click="openBankAccountSelector"><Search /></el-icon>
          </template>
        </el-input>
      </template>
    </ModifyForm>
  </ModifyPage>
</template>