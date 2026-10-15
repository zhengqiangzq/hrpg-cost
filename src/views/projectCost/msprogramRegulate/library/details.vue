<template>
  <div class="view-fill" v-if="!dialogInfo.visible">
    <div class="app-container-flex">
      <NewFullScreen
          v-model="showDialog"
          title="成本数据详情"
          :needReturn="!flowFormType"
          @returnBack="returnBack"
      >
        <template v-slot:full-button>
          <el-button
              v-if="
              $permission('library:update')
            "
              type="primary"
              class="el-button el-button--medium filter-button"
              @click="update"
          >编辑</el-button
          >
        </template>
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
      @returnModify="initData"
  />
</template>

<script setup>
import Modify from './modify'
import { onMounted, ref, computed } from "vue";
import {medicalServiceStandardsLibDetail} from "@/api/projectCost/MSProgramRegulateLibrary";

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
const basicInfo = ref({
  data: {},
  fieldList: [
    { label: '项目编码', value: 'code' },
    { label: '项目名称', value: 'name' },
    { label: '项目英文名称', value: 'nameEn' },
    { label: '所属项目目录', value: 'catalogName' },
    { label: '项目内涵', value: 'projectConnotation', width: '100%' },
    { label: '必选耗材', value: 'requiredConsumables' },
    { label: '可选耗材', value: 'optionalConsumables' },
    { label: '低值耗材分档', value: 'consumablesClassification' },
    { label: '基本人力消耗及耗时', value: 'manpowerAndTimeConsumption' },
    { label: '项目耗时(分钟)', value: 'timeConsumption' },
    { label: '技术难度', value: 'technicalDifficulty' },
    { label: '风险程度', value: 'riskLevel' },
    { label: '人力资源消耗相对值', value: 'manpowerConsumptionRelativeVal' },
    { label: '计量单位', value: 'measureUnit' },
    { label: '收费票据分类', value: 'billClassification' },
    { label: '会计科目分类', value: 'accountingSubjectsClassification' },
    { label: '病案首页费用分类', value: 'expenseClassification' },
    { label: '特殊情况资源消耗调整系数', value: 'adjustmentCoefficient', width: '100%' },
    { label: '说明', value: 'remark', width: '100%' },
  ],
})
// 弹窗相关
const dialogInfo = ref({
  title: '',
  visible: false,
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
  initData(true)
})


function returnBack() {
  emits('returnBack')
}
// 编辑
function update() {
  dialogInfo.value.id = basicInfo.value.data.id
  dialogInfo.value.tableRow = basicInfo.value.data
  dialogInfo.value.title = '修改医疗服务项目规范库'
  dialogInfo.value.visible = true
}
function initData(data) {
  if(!data) return false
  medicalServiceStandardsLibDetail(props.id).then(res => {
    if(res.code === 200) {
      basicInfo.value.data = res.data || {}
    }
  })
}
</script>

<style scoped></style>
