<script setup name="drugCatalogue">
import {onMounted, watch} from "vue";
import {drugItempage} from "@/api/personnelInfo";
const {proxy} = getCurrentInstance()
const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  api: null,
  fieldList: [
    {label: '药品编码', value: 'code'},
    {label: '药品名称', value: 'name'},
    {label: '药品类别编码', value: 'drugFinCategoryCode'},
    {label: '药品类别名称', value: 'drugFinCategoryName'},
    {label: '规格型号', value: 'model'},
    {label: '计量单位', value: 'unit'},
    {label: '是否收费', value: 'chargeName'},
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
      label: '药品名称',
      value: 'name',
      showLabel: true,
      event: getList,
    },
    {
      type: 'slot',
      label: '药品类别',
      value: 'drugFinCategoryName',
      showLabel: true,
    },
    {
      type: 'select-model',
      label: '是否收费',
      value: 'charge',
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
  tableInfo.value.api = drugItempage
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
  filterInfo.value.query.drugFinCategoryId = datas?.map((it) => it.id);
  filterInfo.value.query.drugFinCategoryCode = datas?.map((it) => it.code);
  filterInfo.value.query.drugFinCategoryName = datas?.map((it) => it.name);
  filterInfo.value.query.drugFinCategoryIdList = datas?.map((it) => it.id);
  selectClassification.value.visible = false
  selectClassification.value.checkedList = data
}
</script>

<template>
<!--  药品目录-->
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
            <template #filter-drugFinCategoryName>
              <el-input
                  v-model="filterInfo.query.drugFinCategoryName"
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
            :tabIndex="true"
            :pager="true"
            :field-list="tableInfo.fieldList"
            @handleEvent="tableHandler"
        >
        </table-container>
      </div>
    </div>
    <SelectDrugTree
        v-if="selectClassification.visible"
        v-model:query="selectClassification.query"
        v-model:show-dialog="selectClassification.visible"
        title="药品目录"
        :checkStrictly="false"
        :check-box="true"
        :isLeaf="false"
        :highlightCurrent="true"
        :checkedList="selectClassification.checkedList"
        :checkedKey="selectClassification.checkedKey"
        :saveEmpty="selectClassification.saveEmpty"
        @callback="selectClassificationCallback"
    ></SelectDrugTree>
  </div>
</template>

<style scoped lang="scss">

</style>
