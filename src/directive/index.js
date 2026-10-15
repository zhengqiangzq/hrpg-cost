import hasPermi from './permission/hasPermi'
import showtip from './tooltip/showtip'
import addFirstFilterClass from './addFirstClass/addFirstFilterClass'

export default function directive(app) {
  app.directive('hasPermi', hasPermi)
  app.directive('showtip', showtip)
  app.directive('addFirstFilterClass', addFirstFilterClass)
}
