import moment from 'moment'
import 'moment/locale/zh-cn'

const diffForHumans = (date, fromat='YYYYMMDD H:mm:ss') => {
  moment.locale('zh-cn')
  return moment(date, fromat).fromNow()
}
export default {
  diffForHumans
}
