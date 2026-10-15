<script setup>
import {getCurrentInstance, onMounted, ref, computed} from "vue";
import ModifyPage from "@/components/ModifyPage/ModifyPage.vue";
import ModifyForm from "@/components/ModifyPage/ModifyForm.vue";
import {
  addMsProgramRegulateLibrary,
  medicalServiceStandardsLibDetail,
  updateMsProgramRegulateLibrary
} from "@/api/projectCost/MSProgramRegulateLibrary";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {treeMSProgramRegulateCatalog} from "@/api/projectCost/MSProgramRegulateCatalog";

const { proxy } = getCurrentInstance()

const { tableParameter, openDialog } = useSelectTableData()
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
  params: {
    type: Object,
    default: {},
  },
})
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
  title: '基础信息',
  options: {
    consumablesClassification: Array(9).fill('').map((it, index) => ({ text: index + 1, value: index + 1 }))
  },
  fieldList: [
    { label: '项目编码', value: 'code', type: 'input' },
    { label: '项目名称', value: 'name', type: 'input' },
    { label: '项目英文名称', value: 'nameEn', type: 'input' },
    { label: '所属项目目录', value: 'catalogName', type: 'slot' },
    { label: '项目内涵', span: 24, value: 'projectConnotation', type: 'textarea', className: 'w-full' },
    { label: '必选耗材', value: 'requiredConsumables', type: 'input' },
    { label: '可选耗材', value: 'optionalConsumables', type: 'input' },
    { label: '低值耗材分档', value: 'consumablesClassification', type: 'select', list: 'consumablesClassification' },
    { label: '基本人力消耗及耗时', value: 'manpowerAndTimeConsumption', type: 'input' },
    { label: '项目耗时(分钟)', value: 'timeConsumption', type: 'number', min: 0 },
    { label: '技术难度', value: 'technicalDifficulty', type: 'number', min: 0, precision: 2 },
    { label: '风险程度', value: 'riskLevel', type: 'number', min: 0, precision: 2 },
    { label: '人力资源消耗相对值', value: 'manpowerConsumptionRelativeVal', type: 'number', min: 0, precision: 2 },
    { label: '计量单位', value: 'measureUnit', type: 'input' },
    { label: '收费票据分类', value: 'billClassification', type: 'input' },
    { label: '会计科目分类', value: 'accountingSubjectsClassification', type: 'input' },
    { label: '病案首页费用分类', value: 'expenseClassification', type: 'input' },
    { label: '特殊情况资源消耗调整系数', span: 24, value: 'adjustmentCoefficient', type: 'textarea', maxlength: 500, className: 'w-full' },
    { label: '说明', span: 24, value: 'remark', type: 'textarea', maxlength: 500, className: 'w-full' },
  ],
  rules: {
    code: [{ required: true, message: '请输入项目编码', trigger: 'blur' }],
    name: [{ required: true, message: '请输入项目中文名称', trigger: 'blur' }],
    catalogName: [{ required: true, message: '请选择所属项目目录', trigger: 'change' }],
    projectConnotation: [{ required: true, message: '请输入项目内涵', trigger: 'blur' }],
    measureUnit: [{ required: true, message: '请输入计量单位', trigger: 'blur' }],
  },
  data: {
  }
})

const filterRef = ref()


onMounted(() => {
  if (props.id) {
    getMain()
  } else {
    handleInfo()
  }
})


function handleInfo() {
  formInfo.value.data = {
    ...props.params,
  }
}

function getMain() {
  medicalServiceStandardsLibDetail(props.id).then(res => {
    if(res.code === 200) {
      formInfo.value.data = res.data || {}
    }
  })
}

function returnBack() {
  emit('returnModify', false)
}
const save = (err) => {
  if (err) return
  const api = props.id ? updateMsProgramRegulateLibrary : addMsProgramRegulateLibrary
  api(formInfo.value.data).then(({code}) => {
    if (code === 200) {
      proxy.$message.success('保存成功')
      showDialog.value = false
      emit('returnModify', true)
    }
  })
}

function opencatalogSelector() {
  tableParameter.title = '服务项目规范目录'
  tableParameter.isLeaf = true
  tableParameter.saveEmpty = true
  tableParameter.api = treeMSProgramRegulateCatalog
  tableParameter.callBack = (raw) => {
    formInfo.value.data.catalogId = raw?.id
    formInfo.value.data.catalogName = raw?.name
  }
  openDialog(filterRef.value, 'tree')
}
</script>

<template>
  <ModifyPage v-model:visible="showDialog" :title="title" @returnBack="returnBack" @save="save">
    <ModifyForm ref="filterRef" :form-info="formInfo"
                :listTypeInfo="formInfo.options">
      <template v-slot:form-catalogName>
        <el-input
            class="not-mongolia"
            type="input"
            :disabled="true"
            placeholder="请选择所属项目目录"
            v-model="formInfo.data.catalogName"
        >
          <template #append>
            <el-icon @click="opencatalogSelector"><Search /></el-icon>
          </template>
        </el-input>
      </template>
    </ModifyForm>
  </ModifyPage>
</template>

<style scoped lang="scss">

</style>
