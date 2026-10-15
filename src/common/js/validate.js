import store from '@/store'
import i18n from '@/lang/index.js'
import router from '@/router'
const { t } = i18n.global
const validate = {
  // 固定电话或者手机号码
  cellphone: (rule, value, callback) => {
    if (
      !/(^(([0\+]\d{2,3}-)?(0\d{2,3})-)(\d{7,8})(-(\d{3,}))?$)|(^0{0,1}1[3|4|5|6|7|8|9][0-9]{9}$)/.test(
        value
      ) &&
      value
    ) {
      callback(new Error(t('err_tel')))
    } else {
      callback()
    }
  },
  // 数字-正数
  positive: (rule, value, callback, obj) => {
    const reg = /^(?!(0[0-9]{0,8}$))[0-9]{1,}[.]{0,}[0-9]{0,}$/
    let isDrug = router.currentRoute.value.path.includes('/drug/')
    let qty_show_precision =
    isDrug ? (store.state.permission.systemConfig.drug_qty_show_precision || 0) : (store.state.permission.systemConfig.qty_show_precision || 0)
    if(obj && obj.hasOwnProperty('generalProductCategory')){
      qty_show_precision = obj.generalProductCategory === '0' ? store.state.permission.systemConfig.qty_show_precision : obj.generalProductCategory === '4' ? store.state.permission.systemConfig.drug_qty_show_precision : qty_show_precision
    }
    const pattern = new RegExp('^\\d+.?\\d{0,' + qty_show_precision + '}$')
    if (!reg.test(value)) {
      callback(new Error('输入大于0的数字'))
    } else if (!pattern.test(value)) {
      callback(new Error(`小数点后最多只能输入${qty_show_precision}位`))
    } else if (value > 99999999) {
      callback(new Error('输入的数字不能大于99999999'))
    } else {
      callback()
    }
  },
  //金额必填
  positiveMoney: (rule, value, callback, obj) => {
    let isDrug = router.currentRoute.value.path.includes('/drug/')
    let price_precision =
    isDrug ? (store.state.permission.systemConfig.drug_price_precision || 0) : (store.state.permission.systemConfig.price_precision || 0)
    if(obj && obj.hasOwnProperty('generalProductCategory')){
      price_precision = obj.generalProductCategory === '0' ? store.state.permission.systemConfig.price_precision : obj.generalProductCategory === '4' ? store.state.permission.systemConfig.drug_price_precision : price_precision
    }
    const reg = /^(?!(0[0-9]{0,8}$))[0-9]{1,}[.]{0,}[0-9]{0,}$/
    const pattern = new RegExp('^\\d+.?\\d{0,' + price_precision + '}$')
    if (!reg.test(value)) {
      callback(new Error('输入正确且大于0的数字'))
    } else if (!pattern.test(value)) {
      callback(new Error(`小数点后最多只能输入${price_precision}位`))
    } else if (value > 999999999999999) {
      callback(new Error('输入的数字不能大于999999999999999'))
    } else {
      callback()
    }
  },
  positiveAndLetter: (rule, value, callback) => {
    //数字非必填
    const reg = /^(?=.*[a-zA-Z])(?=.*\d)[\s\S]{8,20}$/
    if (value == '') {
      callback(new Error('请输入密码'))
    } else if (!reg.test(value)) {
      callback(new Error('密码必须包含字母和数字，且长度在8~20位之间'))
    } else {
      callback()
    }
  },
}
export default validate
