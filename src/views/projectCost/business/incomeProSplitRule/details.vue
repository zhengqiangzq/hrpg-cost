<template>
  <div class="view-fill" v-if="!dialogInfo.visible">
    <div class="app-container-flex">
      <NewFullScreen
          v-model="showDialog"
          title="收入拆分详情"
          :needReturn="!flowFormType"
          @returnBack="returnBack"
      >
        <template v-slot:full-button>
          <el-button
              v-if="
              $permission('incomeProSplitRule:update')
            "
              :plain="true"
              @click="update"
          >编辑</el-button
          >
        </template>
        <div class="model-panel">
          <div class="model-panel-title">
            <p>收入拆分</p>
          </div>
          <div class="model-panel-body">
            <!-- form -->
            <basic-information :info="basicInfo"> </basic-information>
          </div>
        </div>
        <div class="model-panel">
          <div class="model-panel-title">
            <Tooltip text="拆分范围" />
          </div>
          <div class="model-panel-body">
            <div class="flex_full_item">
              <el-form
                  ref="tableForm"
                  :model="tableAreaInfo"
                  style="width: 100%">
                <!-- 表格 -->
                <page-table
                    :refresh="tableAreaInfo.refresh"
                    :init-curpage="tableAreaInfo.initCurpage"
                    v-model:data="tableAreaInfo.data"
                    :pager="false"
                    :summary="false"
                    :summaryFieldList="tableAreaInfo.summaryFieldList"
                    :tabIndex="true"
                    :check-box="false"
                    :api="tableAreaInfo.api"
                    :query="tableAreaInfo.query"
                    :field-list="tableAreaInfo.fieldList"
                    :handle="tableAreaInfo.handle"
                    :isDynamic="false"
                >
                </page-table>
              </el-form>
            </div>
          </div>
        </div>
        <div class="model-panel">
          <div class="model-panel-title">
            <Tooltip text="承担科室信息" />
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
                    :pager="false"
                    :summary="false"
                    :summaryFieldList="tableInfo.summaryFieldList"
                    :tabIndex="true"
                    :check-box="false"
                    :api="tableInfo.api"
                    :query="filterInfo.query"
                    :field-list="tableInfo.fieldList"
                    :handle="tableInfo.handle"
                    :isDynamic="false"
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
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {ItemIncomeSplitRuledetail} from "@/api/projectCost/incomeProSplitRule";

const { proxy } = getCurrentInstance()

const { tableParameter, openDialog } = useSelectTableData()
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
    { label: '拆分规则编码', value: 'code' },
    { label: '拆分规则名称', value: 'name' },
    { label: '核算期间', value: 'accountingPeriodName' },
    { label: '源科室编码', value: 'sourceDeptCode' },
    { label: '源科室名称', value: 'sourceDeptName' },
    { label: '拆分方法', value: 'splitMethodName' },
    { label: '备注', value: 'remark' },
  ],
})
// 弹窗相关
const dialogInfo = ref({
  title: '编辑',
  id: '',
  visible: false,
  type: '',
})

const filterInfo = ref({
  query: {
  },
})
const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  data: [],
  query: {},
  fieldList: [
    { label: '承担科室编码', value: 'deptCode' },
    { label: '承担科室名称', value: 'deptName' },
    { label: '参数值来源', value: 'paramSourceName' },
    { label: '分摊参数', value: 'apportionmentParamName' },
    { label: '参数值', value: 'paramValue', align: 'center' },
  ],
  summaryFieldList: [
  ],
  btnList: [
  ],
})
const tableAreaInfo = ref({
  refresh: 1,
  initCurpage: 1,
  data: [],
  query: {},
  fieldList: [],
  summaryFieldList: [
    { value: 'paramValue', formatter: proxy.$fn.TripartiteMethod },
  ],
  btnList: [
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
    initData()
  }
})

function returnBack() {
  emits('returnBack')
}
// 编辑
function update() {
  dialogInfo.value.id = basicInfo.value.data.id
  dialogInfo.value.visible = true
}
async function initData() {
  ItemIncomeSplitRuledetail(props.id).then(({ data }) => {
    basicInfo.value.data = data
    tableInfo.value.data = data.detailList
    const key = { 2: 'feeCategoryLists', 3: 'feeItemList' }[data.splitMethod]
    const fields = {
      2: [
        { label: '收费类别编码', value: 'code' },
        { label: '收费类别名称', value: 'name' },
      ],
      3: [
        { label: '收费项目编码', value: 'code' },
        { label: '收费项目名称', value: 'name' },
      ]
    }
    tableAreaInfo.value.fieldList = fields[data.splitMethod]
    tableAreaInfo.value.data = data[key]
  })
}
const dialogInfoRef = ref()
</script>

<style scoped></style>
