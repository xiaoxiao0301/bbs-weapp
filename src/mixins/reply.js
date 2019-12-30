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
  methods = {
    // 删除回复
    async deleteReply(topicId, replyId) {
      // 确认是否删除
      let res = await wepy.showModal({
        title: '确认删除',
        content: '您确认删除该回复吗',
        confirmText: '删除',
        cancelText: '取消'
      })

      // 点击取消后返回
      if (!res.confirm) {
        return
      }

      try {
        // 调用接口删除回复
        let deleteResponse = await api.authRequest({
          url: 'topics/' + topicId + '/replies/' + replyId,
          method: 'DELETE'
        })
        // 删除成功
        if (deleteResponse.statusCode === 204) {
          wepy.showToast({
            title: '删除成功',
            icon: 'success',
            duration: 2000
          })
          // 将删除了的回复移除
          this.replies = this.replies.filter((reply) => reply.id !== replyId)
          this.$apply()
        }
        return deleteResponse
      } catch (err) {
        console.log(err)
        wepy.showModal({
          title: '提示',
          content: '服务器错误，请联系管理员'
        })
      }
    }
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

        // 获取当前用户
        let user = await this.$parent.getCurrentUser()
        replies.forEach((reply) => {
          // 控制是否可以删除
          reply.can_delete = this.canDelete(user, reply)
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
      console.log(err)
      wepy.showModal({
        title: '提示',
        content: '服务器错误，请联系管理员'
      })
    }
  }

  canDelete(user, reply) {
    if (!user) {
      return false
    }

    // 用户未回复发布者 或 有管理内容权限
    return (reply.user_id === user.id) || this.$parent.can('manage_contents')
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
