<!-- 银行划款 - 新增/编辑页 -->
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
    { label: '结算方式', value: 'settlementMethodName', showLabel: true, type: 'slot' },
    { label: '是否网银', value: 'isOnlineBanking', type: 'select', options: [{ label: '是', value: '1' }, { label: '否', value: '0' }] },
    { label: '转出银行账户', value: 'outBankAccountName', showLabel: true, type: 'slot' },
    { label: '网银开通状态', value: 'onlineStatus', type: 'select', options: [{ label: '已开通', value: '1' }, { label: '未开通', value: '0' }] },
    { label: '转入银行账户', value: 'inBankAccountName', showLabel: true, type: 'slot' },
    { label: '转账金额', value: 'transferMoney', type: 'input' },
    { label: '单据状态', value: 'docStatus', type: 'select-model', code: 'cost_document_status', disabled: true, show: props.id },
    { label: '结算状态', value: 'settleStatus', type: 'select-model', code: 'settle_status' },
    { label: '备注', value: 'remark', type: 'textarea' },
  ],
  rules: {
    docNum: [{ required: true, message: '请输入单据号', trigger: 'blur' }],
    docTime: [{ required: true, message: '请选择业务日期', trigger: 'change' }],
    settlementMethodName: [{ required: true, message: '请选择结算方式', trigger: 'change' }],
    isOnlineBanking: [{ required: true, message: '请选择是否网银', trigger: 'change' }],
    outBankAccountName: [{ required: true, message: '请选择转出银行账户', trigger: 'change' }],
    transferMoney: [{ required: true, message: '请输入转账金额', trigger: 'blur' }],
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
  formInfo.value.data.isOnlineBanking = '1'
  formInfo.value.data.onlineStatus = '0'
  formInfo.value.data.docStatus = '0'
  formInfo.value.data.settleStatus = '0'
}

function getMain() {
  formInfo.value.data = {
    id: props.id,
    docNum: 'JT202512130001',
    docTime: '2026-01-01',
    settlementMethodName: '',
    settlementMethodId: '',
    isOnlineBanking: '1',
    outBankAccountName: '',
    outBankAccountId: '',
    onlineStatus: '0',
    inBankAccountName: '',
    inBankAccountId: '',
    transferMoney: '',
    docStatus: '1',
    settleStatus: '0',
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

function openSettlementMethodSelector() {
  proxy.$message.info('请选择结算方式')
}

function openOutBankAccountSelector() {
  proxy.$message.info('请选择转出银行账户')
}

function openInBankAccountSelector() {
  proxy.$message.info('请选择转入银行账户')
}
</script>

<template>
  <ModifyPage v-model:visible="showDialog" :title="title" @returnBack="returnBack" @save="save">
    <ModifyForm :form-info="formInfo">
      <template #form-settlementMethodName>
        <el-input
          v-model="formInfo.value.data.settlementMethodName"
          class="not-mongolia"
          type="input"
          placeholder="请选择结算方式"
          :disabled="false"
        >
          <template #append>
            <el-icon @click="openSettlementMethodSelector"><Search /></el-icon>
          </template>
        </el-input>
      </template>
      <template #form-outBankAccountName>
        <el-input
          v-model="formInfo.value.data.outBankAccountName"
          class="not-mongolia"
          type="input"
          placeholder="请选择转出银行账户"
          :disabled="false"
        >
          <template #append>
            <el-icon @click="openOutBankAccountSelector"><Search /></el-icon>
          </template>
        </el-input>
      </template>
      <template #form-inBankAccountName>
        <el-input
          v-model="formInfo.value.data.inBankAccountName"
          class="not-mongolia"
          type="input"
          placeholder="请选择转入银行账户"
          :disabled="false"
        >
          <template #append>
            <el-icon @click="openInBankAccountSelector"><Search /></el-icon>
          </template>
        </el-input>
      </template>
    </ModifyForm>
  </ModifyPage>
</template>