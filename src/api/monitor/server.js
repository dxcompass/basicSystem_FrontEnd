import request from '@/utils/request'

// サービス情報を取得します
export function getServer() {
  return request({
    url: '/monitor/server',
    method: 'get'
  })
}