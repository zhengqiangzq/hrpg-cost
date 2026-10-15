<!-- 银行划款 - 详情页 -->
<script setup>
import Modify from './modify.vue'
import { getCurrentInstance } from "vue"
import moment from "moment"

const { proxy } = getCurrentInstance()

const emits = defineEmits()
const props = defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
  id: {
    type: String,
  },
  visible: false,
})

const basicInfo = ref({
  data: {},
  fieldList: [
    { label: '单据号', value: 'docNum' },
    { label: '业务日期', value: 'docTime', formatter: (row) => moment(row.docTime).format('YYYY-MM-DD') },
    { label: '结算方式', value: 'settlementMethod' },
    { label: '是否网银', value: 'isOnlineBankingName' },
    { label: '转出银行账户', value: 'outBankAccount' },
    { label: '网银开通状态', value: 'onlineStatusName' },
    { label: '转入银行账户', value: 'inBankAccount' },
    { label: '转账金额', value: 'transferMoney' },
    { label: '单据状态', value: 'docStatusName' },
    { label: '结算状态', value: 'settleStatusName' },
    { label: '备注', value: 'remark' },
  ],
})

const dialogInfo = ref({
  title: '',
  id: '',
  visible: false,
  type: '',
})

const showDialog = computed({
  get() {
    return props.visible
  },
  set(val) {
    emits('update:visible', val)
  },
})

onMounted(() => {
  if (props.id) {
    initData()
  }
})

function returnBack() {
  emits('returnBack')
}

function update() {
  dialogInfo.value.id = basicInfo.value.data.id
  dialogInfo.value.title = '修改银行划款'
  dialogInfo.value.visible = true
}

async function initData() {
  basicInfo.value.data = {
    id: props.id,
    docNum: 'JT202512130001',
    docTime: '2026-01-01',
    settlementMethod: '电汇',
    isOnlineBankingName: '是',
    outBankAccount: '101 银行账户',
    onlineStatusName: '未开通',
    inBankAccount: '',
    transferMoney: '100,000.00',
    docStatusName: '已确认',
    settleStatusName: '已结算',
    remark: '',
    docStatus: '1',
    settleStatus: '1',
  }
}
</script>

<template>
  <div class="view-fill" v-if="!dialogInfo.visible">
    <div class="app-container-flex">
      <NewFullScreen
        v-model="showDialog"
        title="银行划款详情"
        :needReturn="true"
        @returnBack="returnBack"
      >
        <template v-slot:full-button>
          <el-button
            v-if="$permission('bankTransfer:update')"
            type="primary"
            class="el-button el-button--medium filter-button"
            @click="update"
          >编辑</el-button>
        </template>
        <div class="model-panel">
          <div class="model-panel-title">
            <p>基本信息</p>
          </div>
          <div class="model-panel-body">
            <basic-information :info="basicInfo"></basic-information>
          </div>
        </div>
      </NewFullScreen>
    </div>
  </div>
  <Modify
    v-if="dialogInfo.visible"
    :id="dialogInfo.id"
    v-model:visible="dialogInfo.visible"
    :title="dialogInfo.title"
    :type="dialogInfo.type"
    @returnModify="initData"
  />
</template>