import request from '@/utils/request'

// クエリスケジューリングログリスト
export function listJobLog(query) {
  return request({
    url: '/monitor/jobLog/list',
    method: 'get',
    params: query
  })
}

// スケジューリングを削除します
export function delJobLog(jobLogId) {
  return request({
    url: '/monitor/jobLog/' + jobLogId,
    method: 'delete'
  })
}

// クリアスケジューリングログ
export function cleanJobLog() {
  return request({
    url: '/monitor/jobLog/clean',
    method: 'delete'
  })
}
