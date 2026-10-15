import {getCurrentInstance, render, h, reactive} from "vue";
import UploadExcel from './index.vue'
import UploadLog from './uploadLog.vue'

// 业务数据导入编码
const BUSINESS_DATA_CODE = [
 // 基础配置
 13018, 13019,
 // 科室成本
 13021, 13022, 13023, 13024, 13025, 13026, 13027, 13028, 13029, 13030, 13031, 13032, 13033, 13034, 13035, 13038,
 // 项目成本
 13045, 13046, 13047, 13048, 13049, 13050, 13051, 13052, 13053, 13054, 13055, 13056, 13062, 13063, 13064,
 // 病种成本
 13070, 13071, 13072, 13074, 13075, 13081, 13082, 13083,
 // DRG成本
 13087, 13088, 13090, 13091, 13097, 13098, 13099,
 // DIP成本
 13103, 13104, 13106, 13107, 13113, 13114, 13115,
]

export default function (options = {
    excludeCode: [],
    PERMISSION_CODE: '', // 权限编码
    BUTTON_CODE: 'import', // 按钮编码
    allocationDataType: '', // 分配管控编码
    type: '', // 导入类型
    action: '', // 导入地址
    showFilter: true, // 是否显示表单
    params: {} // 额外参数，注意参数重名，导致type被覆盖
}) {

    options.BUTTON_CODE = options.BUTTON_CODE ?? 'import'
    // 若未传入则采用基础数据展示，业务数据隐藏
    options.showFilter = options.showFilter ?? !BUSINESS_DATA_CODE.includes(Number(options.type))

    const { proxy, appContext } = getCurrentInstance()

    const uploadExcelInfo = reactive({
        params: {
            businessParams: '',
            ...options.params,
        }
    })
    const uploadLogInfo = reactive({
        query: {
            type: options.type,
            ...options.params,
        }
    })
    // 打开上传弹窗
    function uploadTest(){
        const div = document.createElement('div')
        div.className = 'upload-excel-container'
        document.body.appendChild(div)

        const vUploadExcel = h(UploadExcel, {
            selectCode: options.excludeCode,
            showDialog: true,
            type: options.type,
            showFilter: options.showFilter,
            importParams: uploadExcelInfo.params,
            btnCode: `${options.PERMISSION_CODE}:${options.BUTTON_CODE}`,
            action: options.action,
            'onUpdate:showDialog' (value) {
                render(null, div)
                div.remove()
            }
        })
        // 添加vue上下文
        vUploadExcel.appContext = appContext
        render(vUploadExcel, div)
    }
    // 打开上传日志
    function uploadLog(){
        const div = document.createElement('div')
        div.className = 'upload-log-container'
        document.body.appendChild(div)

        const vUploadLog = h(UploadLog, {
            showDialog: true,
            query: uploadLogInfo.query,
            'onUpdate:showDialog' (value) {
                render(null, div)
                div.remove()
            }
        })
        // 添加vue上下文
        vUploadLog.appContext = appContext
        render(vUploadLog, div)
    }

    const uploadExcelBtns = [
        {
            type: 'button',
            label: `导入`,
            event: uploadTest,
            show: proxy.$permission(`${options.PERMISSION_CODE}:${options.BUTTON_CODE}`) && (options.allocationDataType ? proxy.$getBtnControl(options.allocationDataType) : !0),
        },
        {
            type: 'button',
            label: '导入日志',
            event: uploadLog,
            show: proxy.$permission(`${options.PERMISSION_CODE}:${options.BUTTON_CODE}`) && (options.allocationDataType ? proxy.$getBtnControl(options.allocationDataType) : !0),
        },
    ]

    return {
        uploadExcelBtns,
    }
}