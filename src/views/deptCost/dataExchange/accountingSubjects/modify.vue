<script setup>
import {getCurrentInstance, ref} from "vue";
import ModifyPage from "@/components/ModifyPage/ModifyPage.vue";
import ModifyForm from "@/components/ModifyPage/ModifyForm.vue";
import {bdAccountgetBdAccassItem} from "@/api/ledgerRetrievalRules";
import {bdAccountadd, bdAccountdetail, bdAccountupdate} from "@/api/accountingSubjects";
import {oneSecondAllocationType} from "@/api/accountingDepartment";

const { proxy } = getCurrentInstance();

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
  flowFormType: ''
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
const listTypeInfo = ref({
  accassItems: [],
})

const formInfo = ref({
  title: '会计科目',
  fieldList: [
    {label: '科目编码', value: 'code', type: 'input', disabled: false},
    {label: '科目名称', value: 'name', type: 'input'},
    {label: '上级科目编码', value: 'parentCode', type: 'slot'},
    {label: '上级科目名称', value: 'parentName', type: 'input', disabled: true},
    {label: '科目全称', value: 'fullName', type: 'input', disabled: true},
    {label: '辅助核算', value: 'accassItem', type: 'select', multiple: true, collapseTags: true, list: 'accassItems'},
    {label: '科目类型', value: 'accType', type: 'select-model', code: 'accounting_account_type'},
    {label: '科目方向', value: 'direct', type: 'select-model', code: 'accounting_account_direction'},
    {label: '启用状态', value: 'enableStatus', type: 'select-model', code: 'enabled_type', disabled: true},
  ],
  rules: {
    code: [{ required: true, message: '请填写编码' }],
    name: [{ required: true, message: '请填写名称' }],
    accType: [{ required: true, message: '请选择科目类型' }],
    direct: [{ required: true, message: '请选择科目方向' }],
  },
  data: {
    enableStatus: 0
  }
})

const fromParameter = ref({
  visible: false,
  type: 'accountingSubjects',
  title: '会计科目',
  pager: true,
  checkBox: false,
  callBack: costItemCallback,
  filters: [],
  fieldList: [],
  query: {}
})
const pageTableRef = ref()

onMounted(() => {
  if (props.id) {
    getMain()
    formInfo.value.fieldList[0].disabled = true;
  }
  getAccount()
})

// 辅助核算
function getAccount() {
  listTypeInfo.value.accassItems = []
  bdAccountgetBdAccassItem([]).then((res) => {
    if(res.code === 200) {
      res.data?.all && res.data?.all.forEach((it) => {
        listTypeInfo.value.accassItems.push({
          key: it.name,
          value: it.id
        })
      })
    }
  })

  console.log(listTypeInfo.value.accassItems)
}
function getMain() {
  bdAccountdetail(props.id).then(res => {
    formInfo.value.data = res.data
  })
}

const save = (err) => {

  console.log(formInfo.value.data)
  if (err) return
  const isAdd = !props.id
  const api = isAdd ? bdAccountadd : bdAccountupdate
  api({
    ...formInfo.value.data
  }).then(({code}) => {
    if (code === 200) {
      proxy.$message.success('保存成功')
      showDialog.value = false
      emit('returnModify', true)
    }
  })
}

function openCostItemSelector(row) {
  fromParameter.value.visible = true
  pageTableRef.value.openDialog(fromParameter.value, 'table')
}
function costItemCallback(raw) {
  formInfo.value.data.parentCode = raw.code
  formInfo.value.data.parentName = raw.name
  formInfo.value.data.pid = raw.id
}
</script>

<template>
  <ModifyPage v-model:visible="showDialog" :title="title" @save="save">
    <ModifyForm ref="pageTableRef" :form-info="formInfo"
                :listTypeInfo="listTypeInfo">
      <template v-slot:form-parentCode>
        <el-input
            class="not-mongolia"
            type="input"
            :disabled="true"
            placeholder="请选择上级会计科目"
            v-model="formInfo.data.parentCode"
        >
          <template #append>
            <el-icon @click="openCostItemSelector"><Search /></el-icon>
          </template>
        </el-input>
      </template>
    </ModifyForm>
  </ModifyPage>
</template>

<style scoped lang="scss">

</style>
