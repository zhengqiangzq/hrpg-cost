<script setup name="assetCatalogue">
import {onMounted, watch} from "vue";
import {assetsItemcollection, assetsItemExcel, assetsItempage} from "@/api/personnelInfo";
import usePullDataLog from "@/components/PullData/pullDataLog/usePullDataLog";
import PullDataLog from "@/components/PullData/pullDataLog/index.vue";
const {proxy} = getCurrentInstance()
const PERMISSION_CODE = 'assetCatalogue'
const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  api: null,
  fieldList: [
    {label: '资产卡片号', value: 'code'},
    {label: '资产名称', value: 'name'},
    {label: '科室编码', value: 'deptCode'},
    {label: '科室名称', value: 'deptName'},
    {label: '资产分类编码', value: 'assetsFinCategoryCode'},
    {label: '资产分类名称', value: 'assetsFinCategoryName'},
    {label: '规格型号', value: 'model'},
    {label: '计量单位', value: 'unit'},
    {label: '原值', value: 'originalPrice', align: 'center'},
  ],
  data: [],
  sectionRows: []
})
const filterInfo = ref({
  query: {
  },
  searchList: [
    {
      type: 'input',
      label: '资产卡片号',
      value: 'code',
      showLabel: true,
      event: getList,
    },
    {
      type: 'input',
      label: '资产名称',
      value: 'name',
      showLabel: true,
      event: getList,
    },
    {
      type: 'slot',
      label: '资产分类',
      value: 'assetsFinCategoryName',
      showLabel: true,
    },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', event: clearSearch, },
  ],
  list: [],
  btnList: [
    {
      type: 'button',
      btType: 'primary',
      label: '采集',
      show: proxy.$permission('assetCatalogue:list'),
      event: addBtn,
    },
    { type: 'button', label: '拉取日志查询', show: proxy.$permission(`${PERMISSION_CODE}:list`), event: () => { pullDataLogInfoVisible.value = true } },
    { type: 'button', label: '导出Excel', show: proxy.$permission(`${PERMISSION_CODE}:export`), event: exportData },
  ]
})

const {
  visible: pullDataLogInfoVisible,
  code: pullDataLogInfoCode
} = usePullDataLog('资产卡片')

function exportData() {
  assetsItemExcel(filterInfo.value.query).then(res => {
    if (res) {
      proxy.$fn.parseExcel(res)
    }
  })
}

onMounted(() => {
  tableInfo.value.api = assetsItempage
  getList()
})

function getList() {
  tableInfo.value.refresh = Math.random()
  filterInfo.value.copyQuery = JSON.parse(JSON.stringify(filterInfo.value.query))
}
const clearType = ref(true)
function clearSearch() {
  clearType.value = !clearType.value
  filterInfo.value.query = {}
  getList()
}

function tableHandler(eventName, raw) {
  if (eventName === 'tableCheck') {
    tableInfo.value.sectionRows = raw
  }
}
// 添加
function addBtn() {
  assetsItemcollection().then(res => {
    if (res.success) {
      proxy.$message.success('采集成功')
      getList()
    }
  })
}

// 药品分类
const selectClassification = ref({
  visible: false,
  saveEmpty: true,
  query: {},
  checkedKey: {},
  checkedList: [],
})

function openCategoryList() {
  selectClassification.value.visible = true

}

function selectClassificationCallback(data) {
  let datas = data?.filter((it) => !it.childList)
  filterInfo.value.query.assetsFinCategoryId = datas?.map((it) => it.id);
  filterInfo.value.query.assetsFinCategoryCode = datas?.map((it) => it.code);
  filterInfo.value.query.assetsFinCategoryName = datas?.map((it) => it.name);
  filterInfo.value.query.assetsFinCategoryIdList = datas?.map((it) => it.id);
  selectClassification.value.visible = false
  selectClassification.value.checkedList = data
}
</script>

<template>
<!--  资产卡片-->
  <div class="app-container">
    <div class="layui-card layui-col-md12" v-show="!pullDataLogInfoVisible">
      <div class="layui-card-body">
        <div class="filter-wrapper">
          <!-- 条件栏 -->
          <NewPageFilter
              v-model:query="filterInfo.query"
              :filter-list="filterInfo.searchList"
              :filter-btn="filterInfo.filterbtn"
          >
            <template #filter-assetsFinCategoryName>
              <el-input
                  v-model="filterInfo.query.assetsFinCategoryName"
                  class="not-mongolia"
                  type="input"
                  placeholder="请选择"
                  :disabled="true"
              >
                <template #append>
                  <el-icon @click="openCategoryList"><Search /></el-icon>
                </template>
              </el-input>
            </template>
          </NewPageFilter>
        </div>
        <div class="filter-wrapper">
          <!-- 条件栏 -->
          <NewPageFilter :filter-btn="filterInfo.btnList"/>
        </div>
        <!-- 表格 -->
        <table-container
            :refresh="tableInfo.refresh"
            :init-curpage="tableInfo.initCurpage"
            v-model:data="tableInfo.data"
            :api="tableInfo.api"
            :query="filterInfo.copyQuery"
            :tabIndex="true"
            :pager="true"
            :field-list="tableInfo.fieldList"
            @handleEvent="tableHandler"
        >
        </table-container>
      </div>
    </div>
    <PullDataLog
        v-if="pullDataLogInfoVisible"
        :businessType="pullDataLogInfoCode"
        @returnBack="pullDataLogInfoVisible = false" />
    <SelectAssetsTree
        v-if="selectClassification.visible"
        v-model:query="selectClassification.query"
        v-model:show-dialog="selectClassification.visible"
        title="资产财务分类"
        :checkStrictly="false"
        :check-box="true"
        :isLeaf="false"
        :highlightCurrent="true"
        :checkedList="selectClassification.checkedList"
        :checkedKey="selectClassification.checkedKey"
        :saveEmpty="selectClassification.saveEmpty"
        @callback="selectClassificationCallback"
    ></SelectAssetsTree>
  </div>
</template>

<style scoped lang="scss">

</style>
