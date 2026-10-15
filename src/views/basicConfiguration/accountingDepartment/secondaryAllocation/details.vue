<template>
  <div class="view-fill" v-if="!dialogInfo.visible">
    <div class="app-container-flex">
      <NewFullScreen
          v-model="showDialog"
          title="二次分配详情"
          :needReturn="!flowFormType"
          @returnBack="returnBack"
      >
        <template v-slot:full-button>
          <el-button
              v-if="
              $permission('ledgerRetrievalRules:update')
            "
              type="primary"
              class="el-button el-button--medium filter-button"
              @click="update"
          >编辑</el-button
          >
        </template>
        <div class="model-panel">
          <div class="model-panel-title">
            <p>二次分配</p>
          </div>
          <div class="model-panel-body">
            <!-- form -->
            <basic-information :info="formInfo"> </basic-information>
          </div>
        </div>
        <div class="model-panel">
          <div class="model-panel-title">
            <Tooltip text="明细信息" />
          </div>
          <div class="model-panel-body">
            <div class="flex_full_item">
              <el-form
                  ref="tableForm"
                  :model="tableInfo"
                  style="width: 100%">
                <!-- 表格 -->
                <page-table
                    :refresh="tableInfo.refresh"
                    :init-curpage="tableInfo.initCurpage"
                    v-model:data="tableInfo.data"
                    :pager="true"
                    :api="tableInfo.api"
                    :summary="true"
                    :summaryFieldList="tableInfo.summaryFieldList"
                    :tabIndex="true"
                    :check-box="false"
                    :query="filterInfo.query"
                    :field-list="tableInfo.fieldList"
                    :handle="tableInfo.handle"
                    :isDynamic="true"
                >
                </page-table>
              </el-form>
            </div>
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

<script setup>
import Modify from './modify'
import {getCurrentInstance} from "vue";
import {finAccessRuledetail, finAccessRuledetailpage} from "@/api/ledgerRetrievalRules";
import {oneSecondAllocationType, secondAllocationpage} from "@/api/accountingDepartment";

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
const formInfo = ref({
  data: {},
  fieldList: [
    { label: '成本来源', value: 'costSourceName' },
    { label: '备注', value: 'remark' },
  ],
})
// 弹窗相关
const dialogInfo = ref({
  title: '',
  id: '',
  visible: false,
  type: '',
})

const filterInfo = ref({
    query: {
      id: props.id
    },
})
const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  data: [],
  fieldList: [
    { label: '源科室编码', value: 'sourceSectionCode', },
    { label: '源科室名称', value: 'sourceSectionName' },
    { label: '承担科室编码', value: 'targetSectionCode' },
    { label: '承担科室名称', value: 'targetSectionName' },
    { label: '参数值', value: 'param' }
  ],
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
  if (props.id) {
    tableInfo.value.api = secondAllocationpage
    initData()
  }
})

function returnBack() {
  emits('returnBack')
}
// 编辑
function update() {
  dialogInfo.value.id = formInfo.value.data.id
  dialogInfo.value.visible = true
}
async function initData() {
  oneSecondAllocationType({id: props.id}).then(res => {
    formInfo.value.data = res.data
    getDetail()
  })
}
function getDetail() {
  console.log('筛选页面')
  tableInfo.value.refresh = Math.random()
}
</script>

<style scoped></style>
