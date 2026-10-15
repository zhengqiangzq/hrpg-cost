<template>
  <div class="checkBox">
    <el-dialog
        draggable
        :append-to-body="true"
        :title="title"
        v-model="state.dialogVisible"
        custom-class="page-dialog"
        :close-on-click-modal="false"
        :modal="false"
        @close="cancel"
    >
      <div class="model-panel-body paddingBox order-model-formBox flex_wrap_start_start" v-if="state.dialogVisible">
        <page-form
            ref="from"
            v-model:ref-obj="formRef"
            :data="state.data"
            :field-list="state.fieldList"
            :rules="state.rules"
            :listTypeInfo="listTypeInfo"
            :label-width="state.labelWidth">
          <template #form-accountName>
            <el-input
                v-model="state.data.accountName"
                class="not-mongolia"
                type="input"
                placeholder="请选择会计科目"
                :disabled="true"
            >
              <template #append>
                <el-icon @click="openCostItemSelector"><Search /></el-icon>
              </template>
            </el-input>
          </template>
          <template #form-deptName>
            <el-input
                v-model="state.data.deptName"
                class="not-mongolia"
                type="input"
                placeholder="请选择部门"
                :disabled="true"
            >
              <template #append>
                <el-icon @click="openDeptSelector"><Search /></el-icon>
              </template>
            </el-input>
          </template>
        </page-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="userUpdate">{{
              $t('btn_confirm')
            }}</el-button>
          <el-button @click="cancel">{{ $t('btn_cancel') }}</el-button>
        </span>
      </template>
    </el-dialog>

    <!--    查询核算科室-->
    <SelectDeptArchivesTree
        v-if="depttreeInfo.visible"
        v-model:showDialog="depttreeInfo.visible"
        :title="depttreeInfo.title"
        :checkStrictly="depttreeInfo.checkStrictly"
        :isLeaf="depttreeInfo.isLeaf"
        :query="depttreeInfo.query"
        :checkBox="depttreeInfo.checkBox"
        :checkedList="depttreeInfo.checkedList"
        :api="depttreeInfo.api"
        :highlight-current="true"
        @callback="treedeptCallback" />
    <SelectAccountingTree
        v-if="treeInfo.visible"
        v-model:showDialog="treeInfo.visible"
        :title="treeInfo.title"
        :checkStrictly="treeInfo.checkStrictly"
        :isLeaf="treeInfo.isLeaf"
        :query="treeInfo.query"
        :checkBox="treeInfo.checkBox"
        :highlight-current="true"
        @callback="treeCallback" />
  </div>
</template>
<script setup>
import {watch} from "vue";
import {bdAccountgetBdAccassItem, finAccessRuleetailadd, finAccessRuleetailupdate} from "@/api/ledgerRetrievalRules";
import {sectiontree} from "@/api/accountingDepartment";

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  tableRow: {
    type: Object,
    default: {},
  },
  visible: {
    type: Boolean,
    default: false,
  },
})
const { proxy } = getCurrentInstance()

const from = ref()
const formRef = ref()

const listTypeInfo = ref({
  accassItems: [],
  assvosList: [ { key: '有', value: 1 },{ key: '无', value: 0 } ]
})
const state = reactive({
  dialogVisible: false,
  ref: null,
  data: {},
  labelWidth: '120px',
  fieldList: [
    { label: '会计科目', span: 12, value: 'accountName', type: 'slot' },
    { label: '辅助核算', span: 12, value: 'accassItem', type: 'select', multiple: true, collapseTags: true, list: 'accassItems' },
    { label: '有无部门辅助', span: 12, value: 'isHaveDept', disabled: true, type: 'select', list: 'assvosList' },
    { label: '部门', span: 12, value: 'deptName', show: true, type: 'slot' },
  ],
  rules: {
    accountName: [{ required: true, message: '请选择会计科目'}],
    deptName: [{ required: true, message: '请选择部门'}],
  },
})
const emit = defineEmits()

watch(
    () => props.tableRow,
    (val) => {
      state.data = Object.assign(state.data, val)
    },
    {
      immediate: true,
    }
)
watch(
    () => state.data.isHaveDept,
    (val) => {
      state.fieldList[3].show = state.data.isHaveDept === 0;
    },
    {
      deep: true,
    }
)
watch(
    () => props.visible,
    (val) => {
      state.dialogVisible = val
    //   处理添加辅助核算
      if(val) {
        addAuxiliaryAccounting()
      }
    },
    {
      immediate: true,
    }
)

const accountList = ref({})

function addAuxiliaryAccounting() {
  if(!state.data?.accountIds) return
    bdAccountgetBdAccassItem(state.data?.accountIds || []).then((res) => {
      accountList.value = res.data;
      listTypeInfo.value.accassItems = []
      let flag = false;
      if(res.code === 200) {
        if(state.data?.accountId) {
          res.data?.all && res.data?.all.forEach((it) => {
            if(it.code !== '0001') {
              listTypeInfo.value.accassItems.push({
                key: it.name,
                value: it.id
              })
            }
            // 是否有部门
            if(it.code === '0001') {
              flag = true
            }
          })

          state.data.isHaveDept = flag ? 1 : 0;
        }
      }
    })
}

function cancel() {
  state.dialogVisible = false
  state.data = {}
  listTypeInfo.value.accassItems = []
  emit('callback', false)
}
function userUpdate() {
  const id = props.tableRow.id
  //新增or编辑用户
  const api = id ? finAccessRuleetailupdate : finAccessRuleetailadd
  formRef.value.validate ((valid) => {
    if (valid) {
      // 处理数据
      const saveData = ProcessingData(state.data) || []
      listTypeInfo.value.accassItems = []
      if (!state.data.ruleHid) {
        state.dialogVisible = false
        const data = JSON.parse(JSON.stringify(state.data))
        data.accassItemValue = saveData[0]?.accassItemName.toString()
        const detailData = id ? data : handDetail(data.list,saveData, data)
        emit('callback', detailData)
        return
      }
      const fromData = id ? {
        ...saveData[0],
        id: state.data.id,
        ruleHid: state.data.ruleHid,
        accountId: state.data.accountId,
        isHaveDept: state.data.isHaveDept,
        deptId: state.data.deptId,
      } : {
        account: containDeptData(saveData, accountList.value),
            id: state.data.id,
            ruleHid: state.data.ruleHid,
            isHaveDept: state.data.isHaveDept,
            deptId: state.data.deptId,
      }
      api(fromData).then((resp) => {
        if (resp.code === 200) {
          proxy.$message.success('保存成功')
          state.dialogVisible = false
          emit('callback', true)
        }
      })
    }
  })
}
// 处理 科目中包含部门的
function containDeptData(data, row) {
  data.forEach((it) => {
    // 查询科目是否存在部门
    let assion = row[it.accountId].filter((item) => item.code === '0001')[0]
    if(!assion) {
      it.isHaveDept = 0;
      it.deptId = state.data.deptId;
      it.deptName = state.data.deptName;
    } else {
      it.isHaveDept = 1;
    }
  })
  return data;
}
function handDetail(list,data, row) {
  list.forEach((it) => {
    const obj = data.filter((item) => item.accountId === it.accountId)[0]
    if(obj) {
      it.accassItem = obj.accassItem
      it.accassItemValue = obj.accassItemName
      it.isHaveDept = row.isHaveDept
      it.isHaveDeptName = row.isHaveDept === 1 ? "有" : "无"
      it.deptId = obj.deptId || row.deptId
      it.deptName = obj.deptName || row.deptName
    }
  })
  return list;
}

function ProcessingData(data) {
  const saveData = []
  data.accountIds.forEach((it) => {
    saveData.push({
      accassItem: filterAccass(it).ids || [],
      accassItemName: filterAccass(it).names || [],
      accountId: it,
    })
  })

  return saveData;
}

//  过滤存在集合
function filterAccass(i) {
  //
  const newData = accountList.value[i]
  let names = []
  let ids = []
  newData.forEach((it) => {
    const Obj = state.data.accassItem.filter((item) => item === it.id)[0]
    if(Obj) {
      if(it.code !== '0001') {
        names.push(it.name)
        ids.push(it.id)
      }
    }
  })

  return {
    names,
    ids,
  }

}

const treeInfo = ref({
  title: '会计科目',
  visible: false,
  checkBox: true,
  checkStrictly: false,
  isLeaf: false,
})

function openCostItemSelector() {
  treeInfo.value.checkBox = !props.tableRow.id
  treeInfo.value.visible = true
}
function treeCallback(raw) {
  let codes = []
  let names = []
  let datas = []
  let ids = []
  if(typeof raw === 'object' && !raw.length) {
    raw = [raw]
  }
   raw && raw.forEach((it) => {
    if(it.last === '1') {
      codes.push(it.code)
      names.push(it.name)
      ids.push(it.id)
      datas.push({
        ...it,
        accountCode: it.code,
        accountName: it.name,
        accountId: it.id
      })
    }
  })

  state.data.accountCode = codes.length === 0 ? '' : codes.length === 1 ? codes[0] : codes.toString()
  state.data.accountName = names.length === 0 ? '' : names.length === 1 ? names[0] : names.toString()
  state.data.accountId = ids.length === 0 ? '' : ids.length === 1 ? ids[0] : ids
  state.data.accountIds = ids
  state.data.list = datas
  state.data.deptId = ''
  state.data.deptName = ''
  treeInfo.value.visible = false
  listTypeInfo.value.accassItems = []
  let flag = false;
  state.data.accassItem = []
  if(ids.length > 0) {
    bdAccountgetBdAccassItem(ids).then((res) => {
      accountList.value = res.data;
      if(res.code === 200) {
        res.data?.all && res.data?.all.forEach((it) => {
          if(it.code !== '0001') {
            listTypeInfo.value.accassItems.push({
              key: it.name,
              value: it.id
            })
          }
          // 是否有部门
          if(it.code === '0001') {
            flag = true
          }
        })
        state.data.isHaveDept = flag ? 1 : 0;
      }
    })
  }
}

const depttreeInfo = ref({
  title: '部门信息',
  visible: false,
  checkBox: false,
  checkStrictly: false,
  isLeaf: true,
  api: sectiontree,
  query: {},
  checkedList: [],
})

function openDeptSelector() {

  depttreeInfo.value.visible = true;
}
function treedeptCallback(data) {
  depttreeInfo.value.visible = false
  state.data.deptName = data.name;
  state.data.deptId = data.id;

}
</script>
