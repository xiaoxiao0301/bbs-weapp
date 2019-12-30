import wepy from 'wepy'

export default class UnreadCount extends wepy.mixin {
  data = {
    // 轮询
    interval: null,
    // 未读消息数
    unreadCount: 0
  }

  // 页面显示
  onShow () {
    // 延迟调用,首页刚开始无法加载个数
    setTimeout(() => {
      this.updateUnreadCount()
    }, 500)
    this.interval = setInterval(() => {
      this.updateUnreadCount()
    }, 30000)
  }
  // 页面隐藏
  onHide () {
    // 关闭轮询
    clearInterval(this.interval)
  }
  // 设置未读消息数
  updateUnreadCount() {
    // 从全局获取未读消息数
    this.unreadCount = this.$parent.globalData.unreadCount
    this.$apply()
    if (this.unreadCount) {
      // 设置badge
      wepy.setTabBarBadge({
        index: 1,
        text: this.unreadCount.toString()
      })
    } else {
      wepy.removeTabBarBadge({
        index:1
      })
    }
  }
}
