<script setup name="directCostModel">
import {onMounted, ref, watch} from "vue";
import {
  itemDirectLaborReceivedelByIds,
  itemDirectLaborReceivequeryModelLaborReceiveList,
  itemDirectModelAssetsdelByIds,
  itemDirectModelAssetsqueryModelAssetsList,
  itemitemDirectModelqueryCopyItemDepts,
  itemDirectModelCopy,
  itemDirectModelexportExcel,
  itemDirectModelLabordelByIds,
  itemDirectModelLaborqueryModelLaborList,
  itemDirectModelOtherCostdelByIds,
  itemDirectModelOtherCostqueryModelOtherList,
  itemDirectModelqueryIncomeItemList,
  itemDirectModelSuppliesdelByIds,
  itemDirectModelSuppliesqueryModelSupplierList,
  itemDirectModelsure,
  itemDirectModelunSure,
  itemDirectModelallSure,
} from "@/api/directCostModel";
const {proxy} = getCurrentInstance()
import AddArtificial from "./addartificial.vue";
import AddCooperation from "./addcooperation.vue";
import AddConsume from "./addconsume.vue";
import AddEquipment from "./addequipment.vue";
import AddOther from "./addother.vue";
import {exportTemplateExcel} from "@/api/pub";
import {useStorage} from "@vueuse/core";
import useUploadExcel from "@/components/UploadExcel/useUploadExcel";

const treeRow = ref({})

const { uploadExcelBtns } = useUploadExcel({
  PERMISSION_CODE: 'directCostModel',
  type: '13050',
  action: '/item/itemDirectModel/import/excelRecord',
})
const cardData = ref([])

const setting = useStorage('setting', {}, sessionStorage)
// 人工配置
const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  visible: false,
  row: {},
  query: {},
  api: null,
  fieldList: [
    {label: '作业字典编码', value: 'itemJobCode'},
    {label: '作业字典名称', value: 'itemJobName'},
    {label: '技术职称编码', value: 'jobTitleCode'},
    {label: '技术职称名称', value: 'jobTitleName'},
    {label: '人数', value: 'personNum', align: 'center'},
    {label: '工时', value: 'workDuration', align: 'center'},
    {label: '工作量系数', value: 'coefficient', align: 'center'},
  ],
  data: [],
  btnList: [
    {type: 'button', label: '新增', event: () => addArtcial(), show: proxy.$permission('directCostModel:artificialadd'),},
    {type: 'button', label: '删除', event: () => delArtcial(), show: proxy.$permission('directCostModel:artificialdel'),},
  ],
  handle: {
    fixed: 'right',
    label: '操作',
    width: '130',
    btList: [
      {
        label: '编辑',
        show: proxy.$permission('directCostModel:artificialupdate'),
        event: (row) => addArtcial(JSON.parse(JSON.stringify(row))),
      },
      {
        label: '删除',
        show: proxy.$permission('directCostModel:artificialdel'),
        event: delArtcial,
      },
    ]
  },
  sectionRows: []
})

// 协作配置
const cooperationInfo = ref({
  refresh: 1,
  initCurpage: 1,
  visible: false,
  row: {},
  query: {
    itemDirectModelId: treeRow.value.id
  },
  api: itemDirectLaborReceivequeryModelLaborReceiveList,
  fieldList: [
    {label: '协助科室', value: 'assistDeptName'},
    {label: '技术职称编码', value: 'jobTitleCode'},
    {label: '技术职称名称', value: 'jobTitleName'},
    {label: '人数', value: 'personNum', align: 'center'},
    {label: '工时', value: 'workDuration', align: 'center'},
    {label: '工作量系数', value: 'coefficient', align: 'center'},
  ],
  data: [],
  btnList: [
    {type: 'button', label: '新增', event: () => addcooperation(), show: proxy.$permission('directCostModel:coopadd'),},
    {type: 'button', label: '删除', event: () => delcooperation(), show: proxy.$permission('directCostModel:coopdel'),},
  ],
  handle: {
    fixed: 'right',
    label: '操作',
    width: '130',
    btList: [
      {
        label: '编辑',
        show: proxy.$permission('directCostModel:coopupdate'),
        event: (row) => addcooperation(JSON.parse(JSON.stringify(row))),
      },
      {
        label: '删除',
        show: proxy.$permission('directCostModel:coopdel'),
        event: delcooperation,
      },
    ]
  },
  sectionRows: []
})
// 材料消耗
const consumeInfo = ref({
  refresh: 1,
  initCurpage: 1,
  visible: false,
  row: {},
  query: {
    itemDirectModelId: treeRow.value.id
  },
  api: itemDirectModelSuppliesqueryModelSupplierList,
  fieldList: [
    {label: '物资编码', value: 'suppliesItemCode'},
    {label: '物资名称', value: 'suppliesItemName'},
    {label: '规格型号', value: 'model'},
    {label: '单位', value: 'unit'},
    {label: '生成厂商', value: 'factoryName'},
    {label: '消耗量', value: 'num', align: 'center'},
  ],
  data: [],
  btnList: [
    {type: 'button', label: '新增', event: () => addconsumeInfo(), show: proxy.$permission('directCostModel:consumeadd'),},
    {type: 'button', label: '删除', event: () => delconsumeInfo(), show: proxy.$permission('directCostModel:consumedel'),},
  ],
  handle: {
    fixed: 'right',
    label: '操作',
    width: '130',
    btList: [
      {
        label: '编辑',
        show: proxy.$permission('directCostModel:consumeupdate'),
        event: (row) => addconsumeInfo(JSON.parse(JSON.stringify(row))),
      },
      {
        label: '删除',
        show: proxy.$permission('directCostModel:consumedel'),
        event: delconsumeInfo,
      },
    ]
  },
  sectionRows: []
})
// 设备配置
const equipmentInfo = ref({
  refresh: 1,
  initCurpage: 1,
  visible: false,
  row: {},
  query: {
    itemDirectModelId: treeRow.value.id
  },
  api: itemDirectModelAssetsqueryModelAssetsList,
  fieldList: [
    {label: '作业编码', value: 'itemJobCode'},
    {label: '作业名称', value: 'itemJobName'},
    {label: '卡片号', value: 'assetsItemCode'},
    {label: '设备名称', value: 'assetsItemName'},
    {label: '规格型号', value: 'model'},
    {label: '品牌', value: 'brand'},
    {label: '设备耗时(分钟)', value: 'duration', align: 'center'},
  ],
  data: [],
  btnList: [
    {type: 'button', label: '新增', event: () => addequipmentInfo(), show: proxy.$permission('directCostModel:equipadd'),},
    {type: 'button', label: '删除', event: () => delequipmentInfo(), show: proxy.$permission('directCostModel:equipdel'),},
  ],
  handle: {
    fixed: 'right',
    label: '操作',
    width: '130',
    btList: [
      {
        label: '编辑',
        show: proxy.$permission('directCostModel:equipupdate'),
        event: (row) => addequipmentInfo(JSON.parse(JSON.stringify(row))),
      },
      {
        label: '删除',
        show: proxy.$permission('directCostModel:equipdel'),
        event: delequipmentInfo,
      },
    ]
  },
  sectionRows: []
})
// 其他成本
const otherInfo = ref({
  refresh: 1,
  initCurpage: 1,
  visible: false,
  row: {},
  query: {
    itemDirectModelId: treeRow.value.id
  },
  api: itemDirectModelOtherCostqueryModelOtherList,
  fieldList: [
    {label: '成本项目编码', value: 'costItemCode'},
    {label: '成本项目名称', value: 'costItemName'},
    {label: '金额', value: 'money', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.money)},
  ],
  data: [],
  btnList: [
    {type: 'button', label: '新增', event: () => addotherInfo(), show: proxy.$permission('directCostModel:otheradd'),},
    {type: 'button', label: '删除', event: () => delotherInfo(), show: proxy.$permission('directCostModel:otherdel'),},
  ],
  handle: {
    fixed: 'right',
    label: '操作',
    width: '130',
    btList: [
      {
        label: '编辑',
        show: proxy.$permission('directCostModel:otherupdate'),
        event: (row) => addotherInfo(JSON.parse(JSON.stringify(row))),
      },
      {
        label: '删除',
        show: proxy.$permission('directCostModel:otherdel'),
        event: delotherInfo,
      },
    ]
  },
  sectionRows: []
})
const filterInfo = ref({
  query: {
    orgId: setting.value.hospitalId,
  },
  searchList: [
    {
      type: 'slot',
      label: '核算科室',
      value: 'deptName',
      required: true,
      showLabel: true,
    },
    {
      type: 'select-model',
      label: '确认状态',
      value: 'status',
      code: 'yes_or_no',
      componentType: 'customInput',
      event: getList,
    },
    {
      type: 'input',
      label: '收费项目',
      value: 'feeItemNameOrCode',
      showLabel: true,
      componentType: 'customInput',
      event: getList,
    },
    {
      type: 'button',
      label: '查询',
      btType: 'primary',
      event: getList,
      show: true,
    },
    {
      type: 'button',
      label: '重置',
      event: clearSearch,
      show: true,
    },
  ],
  list: [],
  btnList: [
    {
      type: 'button',
      label: '全部确认',
      btType: 'primary',
      event: allconfirm,
      show: proxy.$permission('directCostModel:confirm'),
    },
    {
      type: 'button',
      label: '下载模板',
      btType: 'primary',
      event: downloadTemplate,
      show: proxy.$permission('directCostModel:download'),
    },
    ...uploadExcelBtns,
    {
      type: 'button',
      label: '导出Excel',
      event: showExportExcel,
      show: proxy.$permission('directCostModel:export'),
    },
  ]
})
const activeName = ref('1')
const cardbtns = ref([
  {
    type: 'button',
    label: '复制',
    event: () => copyDept('copy'),
    disabled: !treeRow.value || JSON.stringify(treeRow.value) == '{}',
    show: proxy.$permission('directCostModel:copy'),
  },
  {
    type: 'button',
    label: '确认',
    event: confirm,
    disabled: treeRow.value.status !== '0',
    show: proxy.$permission('directCostModel:confirm'),
  },
  {
    type: 'button',
    label: '取消确认',
    event: unconfirm,
    disabled: treeRow.value.status === '0',
    show: proxy.$permission('directCostModel:unconfirm'),
  },
])

function downloadTemplate() {
  exportTemplateExcel('itemDirectModelTemplate', 'directCostModel:download').then((res) => {
    if (res) {
      proxy.$fn.parseExcel(res, '直接成本模型导入模板')
    }
  })
}

function showExportExcel() {
  if(!filterInfo.value.query.deptId) return proxy.$message.warning('请选择核算科室')
  itemDirectModelexportExcel(filterInfo.value.query).then((resp) => {
    if (resp) {
      proxy.$fn.parseExcel(resp)
    }
  })
}

onMounted(() => {

})

function getList() {
  treeRow.value = {}
  cardData.value = []
  if(!filterInfo.value.query.deptId) return proxy.$message.warning('请选择核算科室')
  if(filterInfo.value.query.deptId.length === 0) return proxy.$message.warning('请选择核算科室')
  const fromData = {
    curPage: '1',
    ...filterInfo.value.query,
    pageSize: '9999',
  }
  itemDirectModelqueryIncomeItemList(fromData).then(({code, data}) => {
    if (code === 200) {
      data && data.forEach((it,index) => {
        it.row_index = index
      })
      cardData.value = data;
      treeRow.value = data[0] || {}
      cardbtns.value[0].disabled = !treeRow.value || JSON.stringify(treeRow.value) == '{}';
      cardbtns.value[1].disabled = treeRow.value.status !== '0';
      cardbtns.value[2].disabled = treeRow.value.status === '0';
      getArtcial()
    }
  })
}

const clearType = ref(true)

function clearSearch() {
  clearType.value = !clearType.value
  filterInfo.value.query = {
    orgId: setting.value.hospitalId,
  }
  getList()
}

watch(() => tableInfo.value.sectionRows, (rows) => {
  const btns = tableInfo.value.btnList
  const deleteBtn = btns.filter((it) => it.label === '删除')[0]
  deleteBtn.disabled = !rows.length
}, {immediate: true})
watch(() => cooperationInfo.value.sectionRows, (rows) => {
  const btns = cooperationInfo.value.btnList
  const deleteBtn = btns.filter((it) => it.label === '删除')[0]
  deleteBtn.disabled = !rows.length
}, {immediate: true})
watch(() => consumeInfo.value.sectionRows, (rows) => {
  const btns = consumeInfo.value.btnList
  const deleteBtn = btns.filter((it) => it.label === '删除')[0]
  deleteBtn.disabled = !rows.length
}, {immediate: true})
watch(() => equipmentInfo.value.sectionRows, (rows) => {
  const btns = equipmentInfo.value.btnList
  const deleteBtn = btns.filter((it) => it.label === '删除')[0]
  deleteBtn.disabled = !rows.length
}, {immediate: true})
watch(() => otherInfo.value.sectionRows, (rows) => {
  const btns = otherInfo.value.btnList
  const deleteBtn = btns.filter((it) => it.label === '删除')[0]
  deleteBtn.disabled = !rows.length
}, {immediate: true})
watch(() => treeRow.value, (rows) => {
  const btn1 = tableInfo.value.btnList[0]
  const btn2 = cooperationInfo.value.btnList[0]
  const btn3 = consumeInfo.value.btnList[0]
  const btn4 = equipmentInfo.value.btnList[0]
  const btn5 = otherInfo.value.btnList[0]
  btn1.disabled = btn2.disabled = btn3.disabled = btn4.disabled = btn5.disabled = rows.status === '1'
}, {immediate: true})

// 新增回填左边数据 id
function backfillfreeItem(data) {
  const cardFreeItem = cardData.value.filter((it) => it.row_index === treeRow.value.row_index)[0]
  cardFreeItem.id = data;
  treeRow.value.id = data;
}
// -----------人工配置--------------
function getArtcial() {
  if(!treeRow.value.id) return tableInfo.value.data = [];
  tableInfo.value.api = itemDirectModelLaborqueryModelLaborList
  tableInfo.value.query.itemDirectModelId = treeRow.value.id
  tableInfo.value.refresh = Math.random()
}

// 人工配置 返回
function artificialcallback(data) {
  tableInfo.value.visible = false
  if (data === false) return
  if (!data) return getArtcial()
// 新增回填左边数据 id
  backfillfreeItem(data)
  getArtcial()
}

// 人工配置 新增
function addArtcial(row) {
  if(cardData.value.length === 0) return proxy.$message.warning('请选择收费项目')
  if(treeRow.value?.status === '1') return proxy.$message.warning('请选择未确认的收费项目')
  tableInfo.value.row = {
    ...treeRow.value,
    ...row,
    id: row?.id,
    itemDirectModelId: treeRow.value.id
  }
  tableInfo.value.visible = true
}

//  人工配置 删除
function delArtcial(row) {
  if(treeRow.value?.status === '1') return proxy.$message.warning('请选择未确认的收费项目')
  const ids = row ? [row.id] : tableInfo.value.sectionRows.map(it => it.id)
  proxy
      .$confirm('删除后将改变数据,是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
    itemDirectModelLabordelByIds(ids).then(({code}) => {
      if (code === 200) {
        proxy.$message.success('删除成功')
        getArtcial()
      }
    })
  })
}

function tableHandler(eventName, raw) {
  if (eventName === 'tableCheck') {
    tableInfo.value.sectionRows = raw
  }
}

// -----------协作配置--------------
function getcooperation() {
  if(!treeRow.value.id) return cooperationInfo.value.data = [];
  cooperationInfo.value.query.itemDirectModelId = treeRow.value.id
  cooperationInfo.value.refresh = Math.random()
}

// 协作配置 返回
function cooperationcallback(data) {
  cooperationInfo.value.visible = false
  if (data === false) return
  if (!data) return getcooperation()
// 新增回填左边数据 id
  backfillfreeItem(data)
  getcooperation()
}

// 协作配置 新增
function addcooperation(row) {
  if(cardData.value.length === 0) return proxy.$message.warning('请选择收费项目')
  if(treeRow.value?.status === '1') return proxy.$message.warning('请选择未确认的收费项目')
  cooperationInfo.value.row = {
    ...treeRow.value,
    ...row,
    id: row?.id,
    itemDirectModelId: treeRow.value.id
  }
  cooperationInfo.value.visible = true
}

//  协作配置 删除
function delcooperation(row) {
  if(treeRow.value?.status === '1') return proxy.$message.warning('请选择未确认的收费项目')
  const ids = row ? [row.id] : cooperationInfo.value.sectionRows.map(it => it.id)
  proxy
      .$confirm('删除后将改变数据,是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
    itemDirectLaborReceivedelByIds(ids).then(({code}) => {
      if (code === 200) {
        proxy.$message.success('删除成功')
        getcooperation()
      }
    })
  })
}

function tablecoopHandler(eventName, raw) {
  if (eventName === 'tableCheck') {
    cooperationInfo.value.sectionRows = raw
  }
}

// -----------材料消耗--------------
function getconsumeInfo() {
  if(!treeRow.value.id) return consumeInfo.value.data = [];
  consumeInfo.value.query.itemDirectModelId = treeRow.value.id
  consumeInfo.value.refresh = Math.random()
}

// 材料消耗 返回
function consumeInfocallback(data) {
  consumeInfo.value.visible = false
  if (data === false) return
  if (!data) return getconsumeInfo()
// 新增回填左边数据 id
  backfillfreeItem(data)
  getconsumeInfo()
}

// 材料消耗 新增
function addconsumeInfo(row) {
  if(cardData.value.length === 0) return proxy.$message.warning('请选择收费项目')
  if(treeRow.value?.status === '1') return proxy.$message.warning('请选择未确认的收费项目')
  consumeInfo.value.row = {
    ...treeRow.value,
    ...row,
    id: row?.id,
    itemDirectModelId: treeRow.value.id
  }
  consumeInfo.value.visible = true
}

//  材料消耗 删除
function delconsumeInfo(row) {
  if(treeRow.value?.status === '1') return proxy.$message.warning('请选择未确认的收费项目')
  const ids = row ? [row.id] : consumeInfo.value.sectionRows.map(it => it.id)
  proxy
      .$confirm('删除后将改变数据,是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
    itemDirectModelSuppliesdelByIds(ids).then(({code}) => {
      if (code === 200) {
        proxy.$message.success('删除成功')
        getconsumeInfo()
      }
    })
  })
}

function tablesumeHandler(eventName, raw) {
  if (eventName === 'tableCheck') {
    consumeInfo.value.sectionRows = raw
  }
}

// -----------设备配置--------------
function getequipmentInfo() {
  if(!treeRow.value.id) return equipmentInfo.value.data = [];
  equipmentInfo.value.query.itemDirectModelId = treeRow.value.id
  equipmentInfo.value.refresh = Math.random()
}

// 设备配置 返回
function equipmentInfocallback(data) {
  equipmentInfo.value.visible = false
  if (data === false) return
  if (!data) return getequipmentInfo()
// 新增回填左边数据 id
  backfillfreeItem(data)
  getequipmentInfo()
}

// 设备配置 新增
function addequipmentInfo(row) {
  if(cardData.value.length === 0) return proxy.$message.warning('请选择收费项目')
  if(treeRow.value?.status === '1') return proxy.$message.warning('请选择未确认的收费项目')
  equipmentInfo.value.row = {
    ...treeRow.value,
    ...row,
    id: row?.id,
    itemDirectModelId: treeRow.value.id
  }
  equipmentInfo.value.visible = true
}

//  设备配置 删除
function delequipmentInfo(row) {
  if(treeRow.value?.status === '1') return proxy.$message.warning('请选择未确认的收费项目')
  const ids = row ? [row.id] : equipmentInfo.value.sectionRows.map(it => it.id)
  proxy
      .$confirm('删除后将改变数据,是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
    itemDirectModelAssetsdelByIds(ids).then(({code}) => {
      if (code === 200) {
        proxy.$message.success('删除成功')
        getequipmentInfo()
      }
    })
  })
}

function tableequipHandler(eventName, raw) {
  if (eventName === 'tableCheck') {
    equipmentInfo.value.sectionRows = raw
  }
}

// -----------其他成本--------------
function getotherInfo() {
  if(!treeRow.value.id) return otherInfo.value.data = [];
  otherInfo.value.query.itemDirectModelId = treeRow.value.id
  otherInfo.value.refresh = Math.random()
}

// 其他成本 返回
function otherInfocallback(data) {
  otherInfo.value.visible = false
  if (data === false) return
  if (!data) return getotherInfo()
// 新增回填左边数据 id
  backfillfreeItem(data)
  getotherInfo()
}

// 其他成本 新增
function addotherInfo(row) {
  if(cardData.value.length === 0) return proxy.$message.warning('请选择收费项目')
  if(treeRow.value?.status === '1') return proxy.$message.warning('请选择未确认的收费项目')
  otherInfo.value.row = {
    ...treeRow.value,
    ...row,
    id: row?.id,
    itemDirectModelId: treeRow.value.id
  }
  otherInfo.value.visible = true
}

//  其他成本 删除
function delotherInfo(row) {
  if(treeRow.value?.status === '1') return proxy.$message.warning('请选择未确认的收费项目')
  const ids = row ? [row.id] : otherInfo.value.sectionRows.map(it => it.id)
  proxy
      .$confirm('删除后将改变数据,是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
    itemDirectModelOtherCostdelByIds(ids).then(({code}) => {
      if (code === 200) {
        proxy.$message.success('删除成功')
        getotherInfo()
      }
    })
  })
}

function tableotherHandler(eventName, raw) {
  if (eventName === 'tableCheck') {
    otherInfo.value.sectionRows = raw
  }
}

// 全部确认
function allconfirm() {
  proxy
      .$confirm('是否全部确认？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
    itemDirectModelallSure().then(({ code }) => {
      if (code === 200) {
        proxy.$message.success('全部确认成功')
        getList()
      }
    })
  })
}

// 确认
function confirm() {
  if(!treeRow.value.id) return proxy.$message.warning('请选择收费项目或未配置关系')
  proxy
      .$confirm('是否确认？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
    itemDirectModelsure({
      id: treeRow.value.id
    }).then(({code}) => {
      if (code === 200) {
        proxy.$message.success('确认成功')
        getList()
        cardbtns.value[1].disabled = true;
        cardbtns.value[2].disabled = false;
      }
    })
  })
}

// 取消确认
function unconfirm() {
  if(!treeRow.value.id) return proxy.$message.warning('请选择收费项目')
  proxy
      .$confirm('是否取消确认？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
    itemDirectModelunSure({
      id: treeRow.value.id
    }).then(({code}) => {
      if (code === 200) {
        proxy.$message.success('取消确认成功')
        getList()
        cardbtns.value[1].disabled = false;
        cardbtns.value[2].disabled = true;
      }
    })
  })
}

// 核算科室
const deptInfo = ref({
  visible: false,
  saveEmpty: true,
  query: {},
  checkedKey: {},
  checkedList: []
})
// 复制科室
const treeInfo = ref({
  title: '核算科室',
  visible: false,
  checkBox: true,
  checkStrictly: false,
  isLeaf: true,
  api: itemitemDirectModelqueryCopyItemDepts,
  query: {
    deptId: '',
    feeItemId: '',
  },
  checkedList: [],
})

function openCategoryList() {
  deptInfo.value.visible = true
}
function copyDept() {
  if(!treeRow.value.id) return proxy.$message.warning('暂无明细数据')
  treeInfo.value.visible = true
  treeInfo.value.query.deptId = treeRow.value.deptId
  treeInfo.value.query.feeItemId = treeRow.value.feeItemId
}

function deptInfoCallback(data) {
    deptInfo.value.checkedList = data;
    const datas = data.filter(it => !it.childList)
    filterInfo.value.query.deptId = datas.map(it => it.id);
    filterInfo.value.query.deptIdList = datas.map(it => it.id);
    filterInfo.value.query.deptCode = datas.map(it => it.code);
    filterInfo.value.query.deptName = datas.map(it => it.name);
    deptInfo.value.visible = false
}

function treeCallback(raw) {
  if(raw?.length === 0) return;
  const datas = raw?.filter(it => !it.childList)
  proxy
      .$confirm('是否复制？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
    itemDirectModelCopy({
      directModelId: treeRow.value.id,
      deptIds: datas.map(it => it.id)
    }).then(({code}) => {
      if (code === 200) {
        proxy.$message.success('复制成功')
        getList()
      }
    })
  })
}

const active = ref('')

function clickCard(row) {
  treeRow.value = row;
  cardbtns.value[0].disabled = !row || JSON.stringify(row) == '{}';
  cardbtns.value[1].disabled = row.status !== '0';
  cardbtns.value[2].disabled = row.status === '0';
  activeName.value = '1'
  tableInfo.value.data = []
  cooperationInfo.value.data = []
  consumeInfo.value.data = []
  equipmentInfo.value.data = []
  otherInfo.value.data = []
  getArtcial()
}

function handleClick(tab, enent) {
  if (tab.paneName === '1') {
    getArtcial()
  } else if (tab.paneName === '2') {
    getcooperation()
  } else if (tab.paneName === '3') {
    getconsumeInfo()
  } else if (tab.paneName === '4') {
    getequipmentInfo()
  } else if (tab.paneName === '5') {
    getotherInfo()
  }
}
</script>

<template>
  <!--  直接成本模型 -作业-->
  <div class="app-container">
    <div class="filter-wrapper">
      <NewPageFilter :filter-btn="filterInfo.btnList">
      </NewPageFilter>
    </div>
    <div class="app-container-flex">
      <div class="layui-card layui-col-md4">
        <div class="layui-card-body">
          <!-- 条件栏 -->
          <PageFilter
              v-model:query="filterInfo.query"
              :filter-list="filterInfo.searchList"
          >
            <template #filter-deptName>
              <el-input
                  v-model="filterInfo.query.deptName"
                  class="not-mongolia"
                  type="input"
                  placeholder="请选择"
                  :disabled="true"
              >
                <template #append>
                  <el-icon @click="openCategoryList">
                    <Search/>
                  </el-icon>
                </template>
              </el-input>
            </template>
          </PageFilter>
          <div style="overflow: auto">
            <el-card
                v-for="(item, index) in cardData"
                :key="index"
                :class="treeRow.row_index === item.row_index ? 'active' : ''"
                class="carditem"
                @click="clickCard(item)"
            >
              <template #header>
                <div class="card-header">
                  <span>{{ item.feeItemName }}({{ item.deptName }})</span>
                  <span>￥{{ item.price }}</span>
                </div>
              </template>
              <div class="card-content">
                <span>{{ item.feeItemCode }}</span>
                <span :class="item.status === '1' ? 'cardStatusgreen': 'cardStatus'">{{ item.statusName }}</span>
              </div>
            </el-card>
          </div>
        </div>
      </div>
      <div class="layui-card layui-col-md8">
        <el-card shadow="never" class="carditem">
          <div class="card-title">
            <div class="card-header" style="flex: 0.9">
              <span class="card-name">{{ treeRow.feeItemName }}</span>
              <span class="cardStatus">￥{{ treeRow.price }}</span>
            </div>
            <div>
              <NewPageFilter :filter-btn="cardbtns"/>
            </div>
          </div>
          <div class="card-content">
            <span>{{ treeRow.feeItemCode }}</span>
          </div>
        </el-card>

        <div class="model-panel-body">
          <el-tabs v-model="activeName" @tab-click="handleClick">
            <el-tab-pane name="1">
              <template #label> 人工配置</template>
              <div class="flex_full_item">
                <el-form
                    ref="tableForm"
                    :model="tableInfo"
                    style="width: 100%">
                  <NewPageFilter :filter-btn="tableInfo.btnList"/>
                  <!-- 表格 -->
                  <table-container
                      :refresh="tableInfo.refresh"
                      :init-curpage="tableInfo.initCurpage"
                      v-model:data="tableInfo.data"
                      :api="tableInfo.api"
                      :query="tableInfo.query"
                      :handle="tableInfo.handle"
                      :tabIndex="true"
                      :pager="false"
                      :field-list="tableInfo.fieldList"
                      @handleEvent="tableHandler"
                  >
                  </table-container>
                </el-form>
              </div>
            </el-tab-pane>
            <el-tab-pane name="2">
              <template #label> 协作配置</template>
              <div class="flex_full_item">
                <el-form
                    ref="tableForm"
                    :model="cooperationInfo"
                    style="width: 100%">
                  <NewPageFilter :filter-btn="cooperationInfo.btnList"/>
                  <!-- 表格 -->
                  <page-table
                      :refresh="cooperationInfo.refresh"
                      :init-curpage="cooperationInfo.initCurpage"
                      v-model:data="cooperationInfo.data"
                      :api="cooperationInfo.api"
                      :query="cooperationInfo.query"
                      :handle="cooperationInfo.handle"
                      :tabIndex="true"
                      :pager="false"
                      :field-list="cooperationInfo.fieldList"
                      @handleEvent="tablecoopHandler"
                  >
                  </page-table>
                </el-form>
              </div>
            </el-tab-pane>
            <el-tab-pane name="3">
              <template #label> 材料消耗</template>
              <div class="flex_full_item">
                <el-form
                    ref="tableForm"
                    :model="consumeInfo"
                    style="width: 100%">
                  <NewPageFilter :filter-btn="consumeInfo.btnList"/>
                  <!-- 表格 -->
                  <page-table
                      :refresh="consumeInfo.refresh"
                      :init-curpage="consumeInfo.initCurpage"
                      v-model:data="consumeInfo.data"
                      :api="consumeInfo.api"
                      :query="consumeInfo.query"
                      :handle="consumeInfo.handle"
                      :tabIndex="true"
                      :pager="false"
                      :field-list="consumeInfo.fieldList"
                      @handleEvent="tablesumeHandler"
                  >
                  </page-table>
                </el-form>
              </div>
            </el-tab-pane>
            <el-tab-pane name="4">
              <template #label> 设备配置</template>
              <div class="flex_full_item">
                <el-form
                    ref="tableForm"
                    :model="equipmentInfo"
                    style="width: 100%">
                  <NewPageFilter :filter-btn="equipmentInfo.btnList"/>
                  <!-- 表格 -->
                  <page-table
                      :refresh="equipmentInfo.refresh"
                      :init-curpage="equipmentInfo.initCurpage"
                      v-model:data="equipmentInfo.data"
                      :api="equipmentInfo.api"
                      :query="equipmentInfo.query"
                      :handle="equipmentInfo.handle"
                      :tabIndex="true"
                      :pager="false"
                      :field-list="equipmentInfo.fieldList"
                      @handleEvent="tableequipHandler"
                  >
                  </page-table>
                </el-form>
              </div>
            </el-tab-pane>
            <el-tab-pane name="5">
              <template #label> 其他成本</template>
              <div class="flex_full_item">
                <el-form
                    ref="tableForm"
                    :model="otherInfo"
                    style="width: 100%">
                  <NewPageFilter :filter-btn="otherInfo.btnList"/>
                  <!-- 表格 -->
                  <page-table
                      :refresh="otherInfo.refresh"
                      :init-curpage="otherInfo.initCurpage"
                      v-model:data="otherInfo.data"
                      :api="otherInfo.api"
                      :query="otherInfo.query"
                      :handle="otherInfo.handle"
                      :tabIndex="true"
                      :pager="false"
                      :field-list="otherInfo.fieldList"
                      @handleEvent="tableotherHandler"
                  >
                  </page-table>
                </el-form>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </div>
    <!--    新增人工配置-->
    <add-artificial
        :title="tableInfo.row.id ? '修改人工配置' : '新增人工配置'"
        :table-row="tableInfo.row"
        :visible="tableInfo.visible"
        @callback="artificialcallback"
    />
    <!--    新增协作配置-->
    <add-cooperation
        :title="cooperationInfo.row.id ? '修改协作配置' : '新增协作配置'"
        :table-row="cooperationInfo.row"
        :visible="cooperationInfo.visible"
        @callback="cooperationcallback"
    />
    <!--    新增材料消耗-->
    <add-consume
        :title="consumeInfo.row.id ? '修改材料消耗' : '新增材料消耗'"
        :table-row="consumeInfo.row"
        :visible="consumeInfo.visible"
        @callback="consumeInfocallback"
    />
    <!--    新增设备配置-->
    <add-equipment
        :title="equipmentInfo.row.id ? '修改设备配置' : '新增设备配置'"
        :table-row="equipmentInfo.row"
        :visible="equipmentInfo.visible"
        @callback="equipmentInfocallback"
    />
    <!--    新增其他成本-->
    <add-other
        :title="otherInfo.row.id ? '修改其他成本' : '新增其他成本'"
        :table-row="otherInfo.row"
        :visible="otherInfo.visible"
        @callback="otherInfocallback"
    />
    <SelectProDeptTree
        v-if="deptInfo.visible"
        v-model:query="deptInfo.query"
        v-model:show-dialog="deptInfo.visible"
        title="核算科室"
        :checkStrictly="false"
        :check-box="true"
        :isLeaf="false"
        :highlightCurrent="true"
        :checkedKey="deptInfo.checkedKey"
        :checkedList="deptInfo.checkedList"
        :saveEmpty="deptInfo.saveEmpty"
        @callback="deptInfoCallback"
    ></SelectProDeptTree>
    <SelectDeptTree
        v-if="treeInfo.visible"
        v-model:showDialog="treeInfo.visible"
        :title="treeInfo.title"
        :checkStrictly="treeInfo.checkStrictly"
        :isLeaf="treeInfo.isLeaf"
        :query="treeInfo.query"
        :checkBox="treeInfo.checkBox"
        :checkedList="treeInfo.checkedList"
        :api="treeInfo.api"
        :highlight-current="true"
        @callback="treeCallback" />
  </div>
</template>

<style scoped lang="scss">
.app-container {
  display: flex;
  flex-direction: column;
}

.layui-col-md4 {
  margin-right: 10px;
  padding: 10px;
  background-color: #fff;
}

.carditem {
  margin-bottom: 5px;
}

.card-header,
.card-content {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .cardStatus {
    color: red;
    font-size: 16px;
  }
  .cardStatusgreen {
    color: var(--el-color-primary);
    font-size: 16px;
  }

  .card-name {
    font-size: 16px;
    color: var(--el-color-primary);
  }
}

.active {
  background: #e6f0f5;
}

.card-title {
  display: flex;
  justify-content: space-between;
}

.layui-card-body {
  display: flex;
  flex-direction: column;
}

:deep(.el-card__header) {
  padding: 5px !important;
}

:deep(.el-card__body) {
  padding: 5px !important;
}
</style>
