<template>
  <div class="view-fill" v-if="!dialogInfo.visible">
    <div class="app-container-flex">
      <NewFullScreen
          v-model="showDialog"
          title="成本数据详情"
          :needReturn="!flowFormType"
          @returnBack="returnBack"
      >
<!--        <template v-slot:full-button>-->
<!--          <el-button-->
<!--              v-if="-->
<!--              $permission('incomeData:update') &&-->
<!--              basicInfo.data.status === '0'-->
<!--            "-->
<!--              type="primary"-->
<!--              class="el-button el-button&#45;&#45;medium filter-button"-->
<!--              @click="update"-->
<!--          >编辑</el-button-->
<!--          >-->
<!--        </template>-->
        <div class="model-panel">
          <div class="model-panel-title">
            <p>基础信息</p>
          </div>
          <div class="model-panel-body">
            <!-- form -->
            <basic-information :info="basicInfo"> </basic-information>
          </div>
        </div>
      </NewFullScreen>
    </div>
  </div>
  <Modify
      v-if="dialogInfo.visible"
      :id="dialogInfo.id"
      v-model:visible="dialogInfo.visible"
      :params="dialogInfo.tableRow"
      :title="dialogInfo.title"
      :type="dialogInfo.type"
      @returnModify="initData"
  />
</template>

<script setup>
import Modify from './modify'
import { onMounted, ref, watch } from "vue";

const emits = defineEmits()
const props = defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
  params: {
    type: Object,
    default: {},
  },
  id: {
    type: String,
  },
  visible: false,
  flowFormType: '',
})
const basicInfo = ref({
  data: {},
  fieldList: [
    { label: '科室编码', value: 'code' },
    { label: '科室名称', value: 'name' },
    { label: '所属上级科室', value: 'parentName' },
    { label: '科室级次', value: 'levelNum' },
    { label: '核算属性', value: 'accountAttributeName' },
    { label: "启用状态", value: "statusName" },
    { label: '备注', value: 'remark', width: '100%' },
  ],
})
// 弹窗相关
const dialogInfo = ref({
  title: '',
  id: '',
  visible: false,
  type: '',
  tableRow: {},
})


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
  initData()
})

// 父级切换行时同步刷新
watch(() => props.params, (val) => {
  if (val && Object.keys(val).length) {
    basicInfo.value.data = val
  }
})

function returnBack() {
  emits('returnBack')
}
// 编辑
function update() {
  dialogInfo.value.id = basicInfo.value.data.id
  dialogInfo.value.tableRow = basicInfo.value.data
  dialogInfo.value.title = '修改核算科室'
  dialogInfo.value.visible = true
}
function initData() {
  basicInfo.value.data = props.params || {}
}
</script>

<style scoped></style>
