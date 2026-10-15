<script setup>
import ModifyPage from "@/components/ModifyPage/ModifyPage.vue";
import {computed, getCurrentInstance, onMounted, reactive, watch} from "vue";
import ModifyForm from "@/components/ModifyPage/ModifyForm.vue";
import ModifyTable from "@/components/ModifyPage/ModifyTable.vue";
import HandlePages from "@/components/MonthCheckout/handlePages";

const { proxy } = getCurrentInstance()
const emits = defineEmits(['close', 'done'])

const props = defineProps({
  costType: 1,
  form: { id: '', periodMonth: '', checkPeriodName: '', accountingPeriodName: '' },
  api: { check: () => {} }
})

const showDialog = ref(false)
const pageBtn = reactive([
  { label: '结账', disabled: true, show: true, btType: 'primary', event: () => checkout() },
])
const handlePage = ref(null)

const basicForm = reactive({
  title: '基本信息',
  fieldList: [
    { label: '会计期间', value: 'periodmonth', type: 'input', disabled: true, show: props.costType === 1 },
    { label: '核算期间', value: 'checkPeriodName', type: 'input', disabled: true, show: props.costType === 2 },
    { label: '核算期间', value: 'accountingPeriodName', type: 'input', disabled: true, show: [3, 4, 5].includes(props.costType) },
  ],
  data: []
})
const beforeTableInfo = reactive({
  title: '结账前检查单据类型',
  highlightRow: true,
  currentRow: null,
  btnList: [
    { label: '刷新数据', type: 'button', event: loadData }
  ],
  fieldList: [
    { label: '单据类型', value: 'docTypeName' },
    { label: '核算方法', hidden: props.costType === 1, value: 'calculationMethodName' },
    { label: '检查状态', value: 'checkStatusName' },
    { label: '检查失败条数', value: 'failSize' },
  ],
  summaryFieldList: [
    { value: 'failSize' }
  ],
  data: [],
})
const failTableInfo = reactive({
  title: '检查失败单据明细',
  fieldList: [
    { label: '单据类型', value: 'docTypeName' },
    { label: '检查状态', value: 'checkStatusName' },
    { label: '单号', value: 'docNum' },
    { label: '状态', value: 'docStatusName' },
    { label: '创建人', value: 'createUserName' },
    { label: '创建日期', value: 'createTime' },
  ],
  sourceData: [],
  data: [],
  handle: {
    fixed: 'right',
    label: '操作',
    width: '80',
    btList: [
      {
        label: '处理',
        show: proxy.$permission('allocationCalcMonthlyBalance:checkout'),
        event: (row) => handleData(row),
      }
    ]
  }
})

const handlePageComp = computed(() => {
  return HandlePages[handlePage.value.docTypeCode]
})

watch(() => beforeTableInfo.currentRow, (row) => {
  if (row.checkStatus == '0' && HandlePages.calcPageCode.includes(Number(row.docTypeCode))) {
    failTableInfo.data = [
      row
    ]
    return
  }
  failTableInfo.data = failTableInfo.sourceData.filter(it => it.docTypeCode === row.docTypeCode) || []
})

onMounted(() => {
  basicForm.data = props.form
  showDialog.value = true
  loadData()
})

function loadData() {
  props.api.check({
    id: props.form.id
  }).then(({ data, success }) => {
    beforeTableInfo.data = data?.monthCloseCheckInfoVoList || []
    failTableInfo.sourceData = data?.monthCloseCheckFailInfoVos || []
    pageBtn[0].disabled = !data?.flag
  })
}

function handleData(row) {
  handlePage.value = {
    ...row,
    detailPageTitle: (beforeTableInfo.currentRow.calculationMethodName ? beforeTableInfo.currentRow.calculationMethodName + ' ' : '') + row.docTypeName
  }
}

function checkout() {
  props.api.closeCheck(props.form).then(({ success, msg }) => {
    if (success) {
      proxy.$message.success('操作成功')
      emits('done')
    }
  })
}

function beforeTableHandle(eventName, raw) {
  if (eventName === 'tableClickRow') {
    beforeTableInfo.currentRow = raw
  }
}

function returnBack() {
  emits('close')
}
</script>

<template>
  <ModifyPage :visible="showDialog" @update:visible="(flag) => !flag && returnBack()" no-full-button :btn-list="pageBtn" title="结账" @returnBack="returnBack">
    <div class="month-checkout-container">
      <ModifyForm :form-info="basicForm"></ModifyForm>
      <ModifyTable class="month-checkout-table" :checkbox="false" :table-info="beforeTableInfo" @handle-event="beforeTableHandle"></ModifyTable>
      <ModifyTable class="month-checkout-table" :checkbox="false" :table-info="failTableInfo"></ModifyTable>
    </div>
  </ModifyPage>
  <NewFullScreen class="handle-page" :title="handlePage.detailPageTitle" v-if="!!handlePage" @returnBack="handlePage = null">
    <component :is="handlePageComp"></component>
  </NewFullScreen>
</template>

<style scoped lang="scss">
.month-checkout-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.month-checkout-table {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.month-checkout-table :deep(.model-panel-body),
.month-checkout-table :deep(.page-table) {
  min-height: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
}
.handle-page {
  bottom: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  padding: 14px 24px !important;
  :deep(#newFullScreenScroll) {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  :deep(.app-container) {
    flex: 1;
    padding: 0;
  }
}
</style>