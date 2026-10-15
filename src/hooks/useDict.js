import {useStore} from "vuex";

export function useDict() {
    const store = useStore()
    return {
        formatterLabel(dictName, value) {
            const dicts = store.state.permission.dict
            const _dicts = dicts[dictName]
            const dictMap = _dicts.reduce((prev, cur) => {
                prev[cur.code ?? cur.value] = cur.key ?? cur.name
                return prev
            }, {})
            return dictMap[value] ?? value
        }
    }
}