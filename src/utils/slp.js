/**
 * 通用js方法封装处理
 * Copyright (c) 2019 slp
 */
import moment from "moment";

// 验证是否为blob格式
export async function blobValidate(data) {
  try {
    const text = await data.text()
    JSON.parse(text)
    return JSON.parse(text)
  } catch (error) {
    return true
  }
}



// 获取本月一天
export function getMonthFrist() {
  let date = new Date()
  let year = date.getFullYear()
  let month = (date.getMonth() + 1) < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1
  return `${year}-${month}-01`
  // return year + month + 1
}

// 获取当天
export function getToDay() {
  let date = new Date()
  return new moment(date).format('YYYY-MM-DD')
}
