<script setup name="eqvalidation">
import {getMonthFrist, getToDay} from "@/utils/slp";
import {getCurrentInstance, onMounted} from "vue";
import {itemChargeItemEquivalentCostDetailcheckData} from "@/api/costCount";

const {proxy} = getCurrentInstance()
const filterInfo = ref({
  query: {
    docTime: `${getMonthFrist()},${getToDay()}`
  },
  list: [
    { label: '核算期间', value: 'accountingPeriodName', showLabel: true, type: 'slot' },
  ],
  filterbtn: [
    { type: 'button', label: '数据校验', btType: 'primary', event: getList, },
  ],
})
const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  api: null,
  fieldList: [
    { label: '错误信息', value: 'message', align: 'left', type: 'slot' },
    { label: '错误级别', value: 'levelName', width: '120px', type: 'slot' },
  ],
  data: [],
})

const filterRef = ref()
const tableParameter = ref({
  visible: false,
  type: 'itemaccountingPeriod',
  title: '会计期间',
  checkBox: false,
  pager: true,
  callback: null,
  filters: [],
  fieldList: [],
  query: {
    sort: 'begin_date desc'
  }
})


onMounted(() => {

})

function getList() {
  if(!filterInfo.value.query.accountingPeriodId) return proxy.$message.warning('请选择核算期间')
  itemChargeItemEquivalentCostDetailcheckData(filterInfo.value.query.accountingPeriodId).then(({code,data}) => {
    if (code === 200) {
      tableInfo.value.data = data;
      if(tableInfo.value.data.length === 0) return proxy.$message.success('校验通过')
    }
  });
}
function reset() {
  filterInfo.value.query = {}
}


function openAccountingPeriodSelector() {
  tableParameter.value.callBack = accountingPeriodCallback
  tableParameter.value.visible = true
  filterRef.value.openDialog(tableParameter.value, 'table')
}

function accountingPeriodCallback(raw) {
  filterInfo.value.query.accountingPeriodId = raw.id
  filterInfo.value.query.accountingPeriodName = raw.name
}


</script>

<template>
  <!--  数据校验 -当量-->
  <div class="app-container">
    <div class="layui-card layui-col-md12">
      <div class="layui-card-body">
        <!-- 条件栏 -->
        <div class="filter-wrapper">
          <NewPageFilter
              ref="filterRef"
              v-model:query="filterInfo.query"
              :filter-list="filterInfo.list"
              :filter-btn="filterInfo.filterbtn"
          >
            <template #filter-accountingPeriodName>
              <el-input
                  v-model="filterInfo.query.accountingPeriodName"
                  class="not-mongolia"
                  type="input"
                  placeholder="请选择核算期间"
                  :disabled="true"
              >
                <template #append>
                  <el-icon @click="openAccountingPeriodSelector"><Search /></el-icon>
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
            :tabIndex="false"
            :check-box="false"
            :pager="false"
            :field-list="tableInfo.fieldList"
        >
          <template #col-message="{ row }">
            <div :class="{ 'error-style': row.level == 1 }">{{ row.message }}</div>
          </template>
          <template #col-levelName="{ row }">
            <div :class="{ 'error-style': row.level == 1 }">{{ row.levelName }}</div>
          </template>
        </table-container>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.error-style {
  color: #f56c6c;
}
</style>
