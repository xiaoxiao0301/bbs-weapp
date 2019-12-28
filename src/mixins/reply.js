import wepy from 'wepy'
import util from '@/utils/utils'
import api from '@/utils/api'

export default class ReplyMixin extends wepy.mixin {
  config = {
    enablePullDownRefresh: true
  }
  data = {
    // 回复数据
    replies: [],
    // 是否有更多数据
    noMoreData: false,
    // 是否在加载中
    isLoading: false,
    // 当前页数
    page: 1,
    // 话题id
  }
  // 获取回复话题
  async getReplies(reset = false) {
    try {
      let repliesResponse = await api.request({
        url: this.requestData.url,
        data: {
          page: this.page,
          include: this.requestData.include || 'user'
        }
      })

      if (repliesResponse.statusCode === 200) {
        let replies = repliesResponse.data.data
        replies.forEach(function (reply) {
          reply.created_at_diff = util.diffForHumans(reply.created_at)
        })

        this.replies = reset ? replies : this.replies.concat(replies)

        let pagination = repliesResponse.data.meta.pagination
        if (pagination.current_page === pagination.total_page) {
          this.noMoreData = true
        }
        this.$apply()
      }

      return repliesResponse
    } catch (err) {
      wepy.showModal({
        title: '提示',
        content: '服务器错误，请联系管理员'
      })
    }
  }

  async onPullDownRefresh() {
    this.noMoreData = false
    this.page = 1
    await this.getReplies(true)
    wepy.stopPullDownRefresh()
  }

  async OnReachBottom() {
    if (this.noMoreData || this.isLoading) {
      return
    }
    this.isLoading = true
    this.page = this.page + 1
    await this.getReplies()
    this.isLoading = false
    this.$apply()
  }
}
