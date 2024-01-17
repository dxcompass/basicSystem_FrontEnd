import request from '@/utils/request'

// クエリタイミングタスクスケジューリングリスト
export function listJob(query) {
  return request({
    url: '/monitor/job/list',
    method: 'get',
    params: query
  })
}

// クエリタイミングタスクのスケジューリング詳細
export function getJob(jobId) {
  return request({
    url: '/monitor/job/' + jobId,
    method: 'get'
  })
}

// Timeタスクのスケジューリングを新たに追加します
export function addJob(data) {
  return request({
    url: '/monitor/job',
    method: 'post',
    data: data
  })
}

// タイミングタスクのスケジューリングを変更します
export function updateJob(data) {
  return request({
    url: '/monitor/job',
    method: 'put',
    data: data
  })
}

// タイミングタスクのスケジューリングを削除します
export function delJob(jobId) {
  return request({
    url: '/monitor/job/' + jobId,
    method: 'delete'
  })
}

// タスクステータスの変更
export function changeJobStatus(jobId, status) {
  const data = {
    jobId,
    status
  }
  return request({
    url: '/monitor/job/changeStatus',
    method: 'put',
    data: data
  })
}


// すぐにもう一度実行されました
export function runJob(jobId, jobGroup) {
  const data = {
    jobId,
    jobGroup
  }
  return request({
    url: '/monitor/job/run',
    method: 'put',
    data: data
  })
}