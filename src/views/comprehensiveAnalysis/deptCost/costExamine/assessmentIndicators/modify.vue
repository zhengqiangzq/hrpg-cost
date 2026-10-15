<script setup>
import {getCurrentInstance, reactive, ref, watch} from "vue";
import ModifyPage from "@/components/ModifyPage/ModifyPage.vue";
import ModifyForm from "@/components/ModifyPage/ModifyForm.vue";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {useStorage} from "@vueuse/core";
import {
  addAssessmentIndicators,
  oneAssessmentIndicators,
  updateAssessmentIndicators, verifyAssessmentIndicators
} from "@/api/deptCost/assessmentIndicators";
import {assessment_indicator_type} from "@/views/comprehensiveAnalysis/common/fakeDict";

const PERMISSION_CODE = 'deptCost:assessmentIndicators'

const store = useStore()
const setting = useStorage('setting', {}, sessionStorage)
const { proxy } = getCurrentInstance();
const API = {
  one: oneAssessmentIndicators,
  add: addAssessmentIndicators,
  batchAdd: null,
  update: updateAssessmentIndicators,
  verify: verifyAssessmentIndicators
}

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
  batch: false,
  id: '',
  flowFormType: ''
})

const pageBtn = ref([
  { label: '保存并新增', event: saveAndAdd, show: props.batch }
])
const pageRef = ref()
const showDialog = computed({
  get() {
    return props.visible
  },
  set(newValue) {
    // 更新父组件visible
    emit('update:visible', newValue)
  },
})
const formInfo = ref({
  options: {
    typeList: assessment_indicator_type
  },
  formRef: null,
  title: '基础信息',
  labelWidth: '140px',
  fieldList: [
    { label: '指标代码', value: 'code', type: 'input', disabled: !!props.id },
    { label: '指标名称', value: 'name', type: 'input' },
    { label: '所属指标分类', value: 'classificationName', type: 'slot' },
    { label: "取值类型", value: "valueType", type: 'select-model', code: 'cost_indicators_value_type', },
    { label: "指标类型", value: "type", type: 'select', list: 'typeList', },
    { label: '固定值', value: 'value', type: 'input' },
    { label: "启用状态", value: "enabledStatus", type: 'select-model', code: 'enabled_type', disabled: true, },
    { label: '备注', value: 'remark', type: 'input' },
  ],
  rules: {
    code: [{ required: true, message: '请输入指标代码', trigger: 'blur' }],
    name: [{ required: true, message: '请输入指标名称', trigger: 'blur' }],
    classificationName: [{ required: true, message: '请选择所属指标分类', trigger: 'change' }],
    valueType: [{ required: true, message: '请选择取值类型', trigger: 'change' }],
  },
  data: {
    orgId: setting.value.hospitalId,
    enabledStatus: '1',
    type: '0'
  }
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
    { label: '@ORG_ID', value: 'ORG_ID', type: 'input', disabled: true },
    { label: 'SACCPERIODMTH', value: 'SACCPERIODMTH', type: 'slot' },
    { label: 'EACCPERIODMTH', value: 'EACCPERIODMTH', type: 'slot' },
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

watch(() => formInfo.value.data.valueType, (value) => {
  formInfo.value.fieldList.find(it => it.value === 'value').show = value === '0'
})

const selectClassification = reactive({
  visible: false,
  saveEmpty: true,
  query: {},
  checkedKey: {},
})

onMounted(() => {
  if (props.id) {
    getMain()
  }
})

function getMain() {
  API.one(props.id).then(res => {
    formInfo.value.data = res.data
  })
}

function saveAndAdd() {
  pageRef.value.validate().then(res => {
    save(null, false)
  }).catch(err => {
    save(err)
  })
}
const save = (err, close = true) => {
  if (err) return
  const api = props.id ? API.update : props.batch ? API.batchAdd : API.add
  api({
    ...formInfo.value.data,
    value: formInfo.value.data.valueType === '0' ? formInfo.value.data.value : undefined,
    valueSql: formInfo.value.data.valueType === '1' ? formInfo.value.data.valueSql : undefined,
  }).then(({ code }) => {
    if (code === 200) {
      proxy.$message.success('保存成功')
      if (!close) {
        formInfo.value.data = {}
        return
      }
      showDialog.value = false
      emit('returnModify', true)
    }
  })
}

function verifyValueSql() {
  dialogInfo.refObj.validate(flag => {
    if (flag) {
      const data = {
        ...dialogInfo.row,
        valueSql: formInfo.value.data.valueSql
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

function openSelectClassification() {
  selectClassification.visible = true
}
function selectClassificationCallback(raw) {
  formInfo.value.data.classificationId = raw.id
  formInfo.value.data.classificationName = raw.name
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
  <ModifyPage ref="pageRef" v-model:visible="showDialog" :title="title" :btnList="pageBtn" @save="save">
    <ModifyForm :form-info="formInfo" :listTypeInfo="formInfo.options">
      <template #form-classificationName>
        <el-input
            v-model="formInfo.data.classificationName"
            class="not-mongolia"
            type="input"
            placeholder="请选择指标分类"
            :disabled="true"
        >
          <template #append>
            <el-icon @click="openSelectClassification"><Search /></el-icon>
          </template>
        </el-input>
      </template>
    </ModifyForm>
    <div style="padding: 0 10px;" v-if="formInfo.data.valueType === '1'">
      <el-form-item prop="valueSql" label-width="140" style="margin-right: 20px;">
        <template #label>
          <div style="align-self: flex-start;">
            <div style="text-align: center; margin-bottom: 8px;">取值SQL</div>
            <el-button @click="dialogInfo.visible = true">取值验证</el-button>
          </div>
        </template>
        <el-input type="textarea" v-model="formInfo.data.valueSql" />
        <div style="color: #46bd9b;">取值sql说明：系统将内置三个查询参数：@SACCPERIODMTH，@EACCPERIODMTH,@ORG_ID；其中@SACCPERIODMTH代表开始会计期间，@EACCPERIODMTH代表结束会计期间，@ORG_ID代表组织。取值sql请按查询规范语句编写，否则将视为无效sql。 <span style="color: #f56c6c; font-weight: bold;">因为考核对象为科室，所以sql最终取值应聚合到科室，查询结果字段应至少包含科室id以及取值的字段，科室id字段请取别名'deptId'，取值的字段请取别名'value'。</span></div>
      </el-form-item>
      <div class="paddingBox" style="padding-top: 0; padding-left: 140px;">
        <highlightjs v-if="sqlResult" class="highlight idea" language="json" :code="sqlResult" />
      </div>
    </div>
    <SelectAssessmentIndicatorsClassification
        v-if="selectClassification.visible"
        v-model:query="selectClassification.query"
        v-model:show-dialog="selectClassification.visible"
        :checkStrictly="true"
        :check-box="false"
        :isLeaf="false"
        :highlightCurrent="true"
        :checkedKey="selectClassification.checkedKey"
        :saveEmpty="selectClassification.saveEmpty"
        @callback="selectClassificationCallback"
    ></SelectAssessmentIndicatorsClassification>
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
  </ModifyPage>
</template>

<style scoped lang="scss">

</style>
