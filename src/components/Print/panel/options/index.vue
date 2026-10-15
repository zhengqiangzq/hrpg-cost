<template>
  <div class="options-box">
    <div class="btn-wrapper">
      <template v-for="(item, index) in optionItems">
        <template v-if="!item.handle">
          <div :key="index" class="btn-box">
            <el-button
              @click.native="selectTempItem($event, item)"
              @contextmenu.prevent.native="openMenu($event, item, index)"
              >{{ item.title }}</el-button
            >
            <ul
              v-show="
                contextmenuInfo.visible &&
                contextmenuInfo.selectedTag.name === item.name &&
                index === contextmenuInfo.index
              "
              :style="{
                left: contextmenuInfo.left + 'px',
                top: contextmenuInfo.top + 'px',
              }"
              class="contextmenu-box"
            >
              <li @click="updateComponent">编辑</li>
              <li @click="delComponent">删除</li>
            </ul>
          </div>
        </template>

        <el-button
          v-else
          class="defaultBtn"
          :key="index"
          @click.native="selectTempItem($event, item)"
          >{{ item.title }}</el-button
        >
      </template>
    </div>
    <el-button icon="el-icon-plus" @click="addTempItem">添加组件</el-button>

    <page-dialog
      v-if="dialogInfo.visible"
      :title="dialogInfo.title"
      v-model:visible="dialogInfo.visible"
      :width="dialogInfo.width"
      :bt-loading="dialogInfo.btLoading"
      :bt-list="dialogInfo.btList"
    >
      <div class="type-wrapper" v-if="formInfo.type === 'create'">
        <div class="label" :style="{ width: formInfo.labelWidth }">
          组件类型：
        </div>
        <el-select
          v-model="formInfo.data.type"
          @change="changeType"
          placeholder="请选择组件类型"
          style="width: 165px"
        >
          <el-option
            v-for="(item, index) in formInfo.options"
            :key="index"
            :label="item.name"
            :value="item.code"
          >
          </el-option>
        </el-select>
      </div>
      <page-form
        class="paddingBox order-model-formBox flex_wrap_start_start"
        v-model:ref-obj="formInfo.ref"
        :data="formInfo.data"
        :field-list="formInfo.fieldList"
        :rules="formInfo.rules"
        :label-width="formInfo.labelWidth"
      >
        <template v-slot:form-isEdit>
          <el-select
            style="width: 100%"
            v-model="formInfo.data.isEdit"
            placeholder="请选择是否可编辑"
          >
            <el-option
              v-for="(item, index) in formInfo.printType"
              :key="index"
              :label="item.name"
              :value="item.code"
            >
            </el-option>
          </el-select>
        </template>
      </page-form>
      <el-form
        v-if="formInfo.data.type === 'braid-table'"
        :model="tableInfo"
        ref="tableForm"
        style="width: 100%"
      >
        <DialogTable
          v-model:data="tableInfo.data"
          :pager="false"
          :tabIndex="true"
          className="print-page-table"
          ref="dragTable"
          rowKey="_key"
          :highlightRow="true"
          :checkBox="false"
          :field-list="tableInfo.fieldList"
          :handle="tableInfo.handle"
        >
          <template v-slot:col-title="scope">
            <el-form-item
              style="width: 100%; margintop: 18px"
              :prop="`data.${scope.$index}.title`"
              :rules="[
                {
                  required: scope.$index >= 0,
                  message: '请输入名称',
                  trigger: 'blur',
                },
              ]"
            >
              <el-input v-model="scope.row.title"></el-input>
            </el-form-item>
          </template>
          <template v-slot:col-value="scope">
            <el-form-item
              style="width: 100%; margintop: 18px"
              :prop="`data.${scope.$index}.value`"
              :rules="[
                {
                  required: scope.$index >= 0,
                  message: '请输入value值',
                  trigger: 'blur',
                },
              ]"
            >
              <el-input v-model="scope.row.value"></el-input>
            </el-form-item>
          </template>
          <template v-slot:col-name="scope">
            <el-form-item
              style="width: 100%; margintop: 18px"
              :prop="`data.${scope.$index}.name`"
              :rules="[
                {
                  required: scope.$index >= 0,
                  message: '请输入字段名',
                  trigger: 'blur',
                },
              ]"
            >
              <el-input v-model="scope.row.name"></el-input>
            </el-form-item>
          </template>
          <template v-slot:col-width="scope">
            <el-input-number
              style="width: 100%"
              v-model="scope.row.width"
              controls-position="right"
              :min="0"
            ></el-input-number>
          </template>
        </DialogTable>
      </el-form>
    </page-dialog>
  </div>
</template>

<script setup>
import PageForm from '@/components/PageForm/index'
import PageDialog from '@/components/PageDialog/index'
import DialogTable from '@/components/DialogTable/index'
import Sortable from 'sortablejs'
const emits = defineEmits()
const { proxy } = getCurrentInstance()
const formInfo = ref({
  ref: null,
  type: '',
  options: proxy.$store.state.permission.dict['print-component-type'] || [],
  pringType: [],
  data: {
    type: 'braid-txt',
    isEdit: 1,
    title: '',
    value: '',
    defaultValue: '',
    name: '',
  },
  fieldList: [
    {
      label: '是否可编辑',
      value: 'isEdit',
      type: 'slot',
    },
    { label: '组件名称', value: 'title', type: 'input' },
    {
      label: '组件值',
      value: 'value',
      type: 'input',
      disabled: false,
      labelTip: '组件值一般和组件名称相同且必须与相应的主数据明名称一样',
    },
    { label: '组件默认值', value: 'defaultValue', type: 'input' },
    {
      label: '组件字段',
      disabled: false,
      value: 'name',
      type: 'input',
      labelTip: '主数据字段',
    },
  ],
  rules: {
    isEdit: [
      {
        required: true,
        message: '请输入是否可编辑',
        trigger: 'change',
      },
    ],
    title: [{ required: true, message: '请输入组件名称', trigger: 'blur' }],
    value: [{ required: true, message: '请输入组件值', trigger: 'blur' }],
    name: [{ required: true, message: '请输入组件字段', trigger: 'blur' }],
  },
  labelWidth: '120px',
})
const tableInfo = ref({
  data: [{}],
  fieldList: [
    {
      label: '名称',
      value: 'title',
      type: 'slot',
    },
    {
      label: 'value值',
      value: 'value',
      type: 'slot',
    },
    {
      label: '字段名',
      value: 'name',
      type: 'slot',
    },
    {
      label: '宽度',
      value: 'width',
      type: 'slot',
    },
  ],
  handle: {
    fixed: 'right',
    label: '操作',
    width: '100',
    btList: [
      {
        label: '添加',
        event: addTableItem,
        show: true,
      },
      {
        label: '删除',
        event: remove,
        show: true,
        ifRender: ifRender,
      },
    ],
  },
})
const dialogInfo = ref({
  title: '',
  visible: false,
  width: '70%',
  btLoading: false,
  btList: [
    { label: '取消', type: '', icon: '', event: close, show: true },
    {
      label: '确定',
      type: 'primary',
      icon: '',
      event: save,
      saveLoading: false,
      show: true,
    },
  ],
})
const contextmenuInfo = ref({
  visible: false,
  top: 28,
  left: 10,
  index: '',
  selectedTag: {},
})
const formRefs = ref(undefined)

const optionItems = computed(() => {
  return proxy.$store.state.print.optionItems
})

watch(
  () => contextmenuInfo.value.visible,
  (value) => {
    if (value) {
      document.body.addEventListener('click', closeMenu)
    } else {
      document.body.removeEventListener('click', closeMenu)
    }
  }
)

onMounted(() => {
  let option = proxy.$store.state.permission.dict['print-component-edit'] || []
  if (option.length) {
    option.forEach((item) => {
      item.code = Number(item.code)
    })
  }
  formInfo.value.printType = option
})

//行拖拽
function rowDrop() {
  let className = 'print-page-table'
  const tbody = document.querySelector(
    '.' + className + ' .el-table__body-wrapper tbody'
  )
  Sortable.create(tbody, {
    onEnd({ newIndex, oldIndex }) {
      const currRow = tableInfo.value.data.splice(oldIndex, 1)[0]
      tableInfo.value.data.splice(newIndex, 0, currRow)
    },
  })
}
function ifRender() {
  return tableInfo.value.data.length > 1
}
function openMenu(e, item, index) {
  contextmenuInfo.value.visible = true
  contextmenuInfo.value.selectedTag = item
  contextmenuInfo.value.index = index
}
function closeMenu() {
  contextmenuInfo.value.visible = false
}
function updateComponent() {
  let data = proxy.$fn.deepClone(contextmenuInfo.value.selectedTag)
  dialogInfo.value.title = '添加组件'
  formInfo.value.type = 'update'
  let arr = ['isEdit', 'defaultValue']
  data.value = data.value.replace('{', '')
  data.value = data.value.replace('}', '')
  if (data.type === 'braid-table') {
    if (data.columnsAttr && data.columnsAttr.length) {
      data.columnsAttr.forEach((item) => {
        item.value = item.value.replace('{', '')
        item.value = item.value.replace('}', '')
      })
      tableInfo.value.data = data.columnsAttr.map((item) => {
        item.width = item.width ? item.width : item.printWidth || undefined
        return item
      })
    } else {
      tableInfo.value.data = [
        { title: '', value: '', name: '', width: undefined },
      ]
    }
    formInfo.value.fieldList.forEach((item) => {
      if (arr.includes(item.value)) {
        item.disabled = true
      }
    })
  }
  formInfo.value.data = {
    type: data.type,
    isEdit: data.isEdit,
    title: data.title,
    value: data.value,
    defaultValue: '',
    name: data.name,
  }
  dialogInfo.value.visible = true
  if (data.type === 'braid-table') {
    proxy.$nextTick(() => {
      formRefs.value = [proxy.$refs['tableForm'], formInfo.value.ref]
      rowDrop()
    })
  }
}
function delComponent() {
  let data = proxy.$fn.deepClone(contextmenuInfo.value.selectedTag)
  let tagKey = getKey(data)
  let options = proxy.$store.state.print.options
  options = options.filter((row) => {
    let rowKey = getKey(row)
    return rowKey !== tagKey
  })
  proxy.$store.commit('print/initOptionItems', options)
}
// 选择组件
function selectTempItem(e, item) {
  if (item.type === 'braid-table') {
    item.columns = item.columnsAttr
  }
  proxy.$store.dispatch('print/selectTempItem', item)
  closeMenu()
}
function addTempItem() {
  dialogInfo.value.title = '添加组件'
  let arr = ['isEdit', 'defaultValue']
  formInfo.value.type = 'create'
  formInfo.value.data.type = 'braid-txt'
  formInfo.value.data.isEdit = 1
  formInfo.value.data.title = ''
  formInfo.value.data.value = ''
  formInfo.value.data.defaultValue = ''
  formInfo.value.data.name = ''
  formInfo.value.fieldList.forEach((item) => {
    if (arr.includes(item.value)) {
      item.disabled = false
    }
  })
  tableInfo.value.data = []
  dialogInfo.value.visible = true
  closeMenu()
}
function changeType(val) {
  let arr = ['isEdit', 'defaultValue']
  if (val === 'braid-table') {
    formInfo.value.data.isEdit = 0
    formInfo.value.data.title = ''
    formInfo.value.data.value = 'details'
    formInfo.value.data.defaultValue = ''
    formInfo.value.data.name = 'details'
    formInfo.value.fieldList.forEach((item) => {
      if (arr.includes(item.value)) {
        item.disabled = true
      }
    })
    let dataArr = [{ title: '', value: '', name: '', width: undefined }]
    tableInfo.value.data = dataArr
    proxy.$nextTick(() => {
      formRefs.value = [proxy.$refs['tableForm'], formInfo.value.ref]
      rowDrop()
    })
  } else if (val === 'braid-txt') {
    formInfo.value.data.isEdit = 1
    formInfo.value.data.title = ''
    formInfo.value.data.value = ''
    formInfo.value.data.defaultValue = ''
    formInfo.value.data.name = ''
    formInfo.value.fieldList.forEach((item) => {
      if (arr.includes(item.value)) {
        item.disabled = false
      }
    })
    tableInfo.value.data = []
  }
}
function addTableItem(row, index) {
  let arr = { title: '', value: '', name: '', width: undefined }
  tableInfo.value.data.splice(index, 0, arr)
  proxy.$nextTick(() => {
    rowDrop()
  })
}
function save() {
  if (tableInfo.value.data.length) {
    tableInfo.value.data.forEach((item, index) => {
      item._key = item.name + '&' + index
    })
  }
  if (
    formInfo.value.data.type === 'braid-txt' ||
    formInfo.value.data.type === 'braid-image'
  ) {
    formInfo.value.ref.validate((valid) => {
      if (valid) {
        setData()
      }
    })
  } else if (formInfo.value.data.type === 'braid-table') {
    proxy.$fn.checkForm(formRefs.value).then(() => {
      setData()
    })
  }
}
function setData() {
  let options = proxy.$store.state.print.options
  let data = proxy.$fn.deepClone(formInfo.value.data)
  let selectedTag = proxy.$fn.deepClone(contextmenuInfo.value.selectedTag)
  let tagKey = getKey(selectedTag)
  data.value = `{${data.value}}`
  if (data.type === 'braid-txt' || data.type === 'braid-image') {
    if (formInfo.value.type === 'create') {
      options.push(data)
    } else if (formInfo.value.type === 'update') {
      let index = options.findIndex((row) => {
        let rowKey = getKey(row)
        return rowKey === tagKey
      })
      if (index !== -1) {
        options[index] = data
      }
    }
    proxy.$store.commit('print/initOptionItems', options)
  } else if (data.type === 'braid-table') {
    let tableData = proxy.$fn.deepClone(tableInfo.value.data)
    tableData.forEach((item) => {
      item.value = `{${item.value}}`
    })
    data.defaultValue = []
    data.columnsAttr = tableData
    data.columns = []
    if (formInfo.value.type === 'create') {
      options.push(data)
    } else if (formInfo.value.type === 'update') {
      let index = options.findIndex((row) => {
        let rowKey = getKey(row)
        return rowKey === tagKey
      })
      if (index !== -1) {
        options[index] = data
      }
    }
    proxy.$store.commit('print/initOptionItems', options)
  }
  close()
}
function getKey(item) {
  let key = item.name + '&' + item.value + '&' + item.title + '&'
  return key
}
function close() {
  dialogInfo.value.visible = false
}
function remove(row) {
  if (tableInfo.value.data.length === 1) {
    return
  }
  tableInfo.value.data = tableInfo.value.data.filter((item) => item !== row)
  proxy.$nextTick(() => {
    rowDrop()
  })
}
</script>

<style lang="scss" scoped>
.btn-wrapper {
  display: flex;
  flex-wrap: wrap;
  .el-button {
    margin-bottom: 10px;
    margin-right: 10px;
    margin-left: 0;
  }
  .defaultBtn {
    background-color: #f0f9eb;
  }
  .defaultBtn:hover {
    color: #fff;
    background-color: #67c23a;
    border-color: #67c23a;
  }
}
.btn {
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  padding-top: 10px;
}
.type-wrapper {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding-bottom: 18px;
  .label {
    text-align: right;
    padding-right: 12px;
    box-sizing: border-box;
  }
}
.btn-box {
  position: relative;
}
.contextmenu-box {
  width: 55px;
  margin: 0;
  background: #fff;
  z-index: 30000;
  position: absolute;
  list-style-type: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 400;
  color: #333;
  box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, 0.3);
  li {
    margin: 0;
    padding: 0 8px;
    cursor: pointer;
    &:hover {
      background: #eee;
    }
  }
}
</style>
