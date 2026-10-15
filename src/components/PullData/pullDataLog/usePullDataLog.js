import { ref } from 'vue'
import { TYPES } from '../common/enumValue'

export default function usePullDataLog(code) {
    const visible = ref(false)
    return {
        visible,
        code: TYPES[code]
    }
}
