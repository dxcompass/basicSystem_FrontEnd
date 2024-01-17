import request from '@/utils/request'

// ルートを取得します
export const getRouters = () => {
  return request({
    url: '/getRouters',
    method: 'get'
  })
}