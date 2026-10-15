<script setup>
import Modify from './modify.vue'
import {getCurrentInstance, reactive, ref} from "vue";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {useStorage} from "@vueuse/core";
import {oneControlIndicators, verifyControlIndicators} from "@/api/deptCost/controlIndicators";

const PAGE_TITLE = '成本控制指标详情'
const PERMISSION_CODE = 'deptCost:controlIndicators'
const setting = useStorage('setting', {}, sessionStorage)
const API = {
  query: oneControlIndicators,
  verify: verifyControlIndicators
}

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
  flowFormType: '',
})
const basicInfo = reactive({
  data: {},
  fieldList: [
    { label: '指标代码', value: 'code' },
    { label: '指标名称', value: 'name' },
    { label: '所属指标分类', value: 'classificationName' },
    { label: "取值类型", value: "valueTypeName" },
    { label: '固定值', value: 'value' },
    { label: "启用状态", value: "enabledStatusName" },
    { label: '备注', value: 'remark' },
  ],
})
// 弹窗相关
const modifyInfo = reactive({
  title: '修改成本控制指标',
  id: '',
  visible: false,
  type: '',
})

const sqlResult = ref('')

const dialogInfoRef = ref()
const dialogInfo = reactive({
  refObj: null,
  row: {
    '@ORG_ID': setting.value.hospitalId,
    ORG_ID: setting.value.hospitalName
  },
  title: '验证',
  visible: false,
  labelWidth: '180px',
  fieldList: [
    { label: '@ORG_ID', span: 12, value: 'ORG_ID', type: 'input', disabled: true },
    { label: '@SACCPERIODMTH', span: 12, value: 'SACCPERIODMTH', type: 'slot' },
    { label: '@EACCPERIODMTH', span: 12, value: 'EACCPERIODMTH', type: 'slot' },
  ],
  rules: {
    'ORG_ID': [{ required: true, message: '请输入@ORG_ID', trigger: 'blur' }],
    'SACCPERIODMTH': [{ required: true, message: '请选择@SACCPERIODMTH', trigger: 'change' }],
    'EACCPERIODMTH': [{ required: true, message: '请选择@EACCPERIODMTH', trigger: 'change' }],
  },
  btList: [
    { type: 'button', label: '确认', event: verifyValueSql }
  ]
})

const { tableParameter, openDialog } = useSelectTableData()

const showDialog = computed({
  get() {
    return props.visible
  },
  set(val) {
    // 更新父组件visible
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
// 编辑
function update() {
  modifyInfo.id = basicInfo.data.id
  modifyInfo.visible = true
}
async function initData() {
  API.query(props.id).then(({data}) => {
    basicInfo.data = data
    basicInfo.fieldList.find(it => it.value === 'value').show = basicInfo.data.valueType === '0'
  })
}

function verifyValueSql() {
  dialogInfo.refObj.validate(flag => {
    if (flag) {
      const data = {
        ...dialogInfo.row,
        valueSql: basicInfo.data.valueSql
      }
      API.verify(data).then(res => {
        if (res.success) {
          sqlResult.value = JSON.stringify(res.data, null, 2)
          dialogInfo.visible = false
        }
      })
    }
  })
}

function openAccountingPeriodSelector(cellName) {
  tableParameter.type = 'accountingPeriod'
  tableParameter.saveEmpty = false
  tableParameter.callBack = (raw) => {
    if (cellName === 'SACCPERIODMTH') {
      dialogInfo.row['@SACCPERIODMTH'] = raw.id
      dialogInfo.row.SACCPERIODMTH = raw.periodYearAndMonth
    } else if (cellName === 'EACCPERIODMTH') {
      dialogInfo.row['@EACCPERIODMTH'] = raw.id
      dialogInfo.row.EACCPERIODMTH = raw.periodYearAndMonth
    }
  }
  openDialog(dialogInfoRef.value)
}
</script>

<template>
  <div class="view-fill" v-if="!modifyInfo.visible">
    <div class="app-container-flex">
      <NewFullScreen
          v-model="showDialog"
          :title="PAGE_TITLE"
          :needReturn="!flowFormType"
          @returnBack="returnBack"
      >
        <template v-slot:full-button>
          <el-button
              v-if="
              $permission(`${PERMISSION_CODE}:update`) &&
              basicInfo.data.status === '0'
            "
              type="primary"
              class="el-button el-button--medium filter-button"
              @click="update"
          >编辑</el-button
          >
        </template>
        <div class="model-panel">
          <div class="model-panel-title">
            <p>{{ PAGE_TITLE }}</p>
          </div>
          <div class="model-panel-body">
            <!-- form -->
            <basic-information :info="basicInfo"> </basic-information>
          </div>
        </div>
        <div class="model-panel">
          <div style="padding: 0 10px;" v-if="basicInfo.data.valueType === '1'">
            <el-form-item prop="valueSql" label-width="140" style="margin-right: 20px;">
              <template #label>
                <div style="align-self: flex-start;">
                  <div style="text-align: center; margin-bottom: 8px;">取值SQL</div>
                  <el-button @click="dialogInfo.visible = true">取值验证</el-button>
                </div>
              </template>
              <highlightjs v-if="basicInfo.data.valueSql" language="sql" :code="basicInfo.data.valueSql" />
            </el-form-item>
            <div class="paddingBox" style="padding-top: 0; padding-left: 140px;">
              <highlightjs v-if="sqlResult" language="json" :code="sqlResult" />
            </div>
          </div>
        </div>
      </NewFullScreen>
    </div>
    <dialog-form :title="dialogInfo.title" :btList="dialogInfo.btList" v-model:visible="dialogInfo.visible">
      <page-form
          ref="dialogInfoRef"
          v-model:ref-obj="dialogInfo.refObj"
          :label-width="dialogInfo.labelWidth"
          :data="dialogInfo.row"
          :field-list="dialogInfo.fieldList"
          :rules="dialogInfo.rules"
      >
        <template #form-SACCPERIODMTH>
          <el-input
              v-model="dialogInfo.row['SACCPERIODMTH']"
              class="not-mongolia" placeholder="请选择@SACCPERIODMTH" :disabled="true"
          >
            <template #append><el-icon @click="openAccountingPeriodSelector('SACCPERIODMTH')"><Search /></el-icon></template>
          </el-input>
        </template>
        <template #form-EACCPERIODMTH>
          <el-input
              v-model="dialogInfo.row['EACCPERIODMTH']"
              class="not-mongolia" placeholder="请选择@EACCPERIODMTH" :disabled="true"
          >
            <template #append><el-icon @click="openAccountingPeriodSelector('EACCPERIODMTH')"><Search /></el-icon></template>
          </el-input>
        </template>
      </page-form>
    </dialog-form>
  </div>
  <Modify
      v-if="modifyInfo.visible"
      :id="modifyInfo.id"
      v-model:visible="modifyInfo.visible"
      :title="modifyInfo.title"
      :type="modifyInfo.type"
      @returnModify="initData"
  />
</template>

<style scoped></style>
