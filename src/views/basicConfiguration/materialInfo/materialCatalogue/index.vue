<script setup name="materialCatalogue">
import {onMounted, watch} from "vue";
import {productpage} from "@/api/personnelInfo";
const {proxy} = getCurrentInstance()
const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  api: null,
  fieldList: [
    {label: '物资编码', value: 'code'},
    {label: '物资名称', value: 'name'},
    {label: '物资类别编码', value: 'productFinCategoryCode'},
    {label: '物资类别名称', value: 'productFinCategoryName'},
    {label: '规格型号', value: 'model'},
    {label: '计量单位', value: 'unit'},
    {label: '是否收费', value: 'isChargeName'},
    {label: '备注', value: 'remark'},
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
      label: '物资名称',
      value: 'name',
      showLabel: true,
    },
    {
      type: 'slot',
      label: '物资类别',
      value: 'productFinCategoryName',
      showLabel: true,
    },
    {
      type: 'select-model',
      label: '是否收费',
      value: 'isCharge',
      code: 'yes_or_no',
    },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', event: clearSearch, },
  ],
  list: [],
  btnList: []
})

onMounted(() => {
  tableInfo.value.api = productpage
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

// 物资分类
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
  filterInfo.value.query.productFinCategoryId = datas?.map((it) => it.id);
  filterInfo.value.query.productFinCategoryCode = datas?.map((it) => it.code);
  filterInfo.value.query.productFinCategoryName = datas?.map((it) => it.name);
  filterInfo.value.query.productFinCategoryIdList = datas?.map((it) => it.id);
  selectClassification.value.visible = false
  selectClassification.value.checkedList = data
}
</script>

<template>
<!--  物资目录-->
  <div class="app-container">
    <div class="layui-card layui-col-md12">
      <div class="layui-card-body">
        <div class="filter-wrapper">
          <!-- 条件栏 -->
          <NewPageFilter
              v-model:query="filterInfo.query"
              :filter-list="filterInfo.searchList"
              :filter-btn="filterInfo.filterbtn"
          >
            <template #filter-productFinCategoryName>
              <el-input
                  v-model="filterInfo.query.productFinCategoryName"
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
        <!-- 表格 -->
        <table-container
            :refresh="tableInfo.refresh"
            :init-curpage="tableInfo.initCurpage"
            v-model:data="tableInfo.data"
            :api="tableInfo.api"
            :query="filterInfo.copyQuery"
            :check-box="false"
            :tabIndex="true"
            :pager="true"
            :field-list="tableInfo.fieldList"
            @handleEvent="tableHandler"
        >
        </table-container>
      </div>
    </div>
    <SelectMaterialTree
        v-if="selectClassification.visible"
        v-model:query="selectClassification.query"
        v-model:show-dialog="selectClassification.visible"
        title="物资目录"
        :checkStrictly="false"
        :check-box="true"
        :isLeaf="false"
        :highlightCurrent="true"
        :checkedList="selectClassification.checkedList"
        :checkedKey="selectClassification.checkedKey"
        :saveEmpty="selectClassification.saveEmpty"
        @callback="selectClassificationCallback"
    ></SelectMaterialTree>
  </div>
</template>

<style scoped lang="scss">

</style>
