import {reactive} from "vue";
import {deepClone} from "@/utils";

export function useSelectTableData() {
    const tableParameter = reactive({
        title: undefined,
        type: '',
        pager: true,
        checkBox: false,
        visible: false,
        filters: null,
        fieldList: [],
        checkedList: [],
        callBack: null,
        query: {}
    })
    function openDialog(ref, type = 'table') {
        const _parameter = deepClone(tableParameter)
        _parameter.visible = true
        // ...是排除多个form公用相同tableParamter导致多次弹窗
        ref.openDialog({ ..._parameter }, type)
    }
    return {
        tableParameter,
        openDialog
    }
}
