import request from '@/utils/request'

// クエリログインログリスト
export function list(query) {
  return request({
    url: '/monitor/logininfor/list',
    method: 'get',
    params: query
  })
}

// ログインログを削除します
export function delLogininfor(infoId) {
  return request({
    url: '/monitor/logininfor/' + infoId,
    method: 'delete'
  })
}

// ユーザーログインステータスのロックを解除します
export function unlockLogininfor(userName) {
  return request({
    url: '/monitor/logininfor/unlock/' + userName,
    method: 'get'
  })
}

// ログインしてログインします
export function cleanLogininfor() {
  return request({
    url: '/monitor/logininfor/clean',
    method: 'delete'
  })
}
