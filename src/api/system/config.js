import request from '@/utils/request'

// クエリパラメーターリスト
export function listConfig(query) {
  return request({
    url: '/system/config/list',
    method: 'get',
    params: query
  })
}

// クエリパラメーター詳細
export function getConfig(configId) {
  return request({
    url: '/system/config/' + configId,
    method: 'get'
  })
}

// パラメーターキー名によるクエリパラメーター値
export function getConfigKey(configKey) {
  return request({
    url: '/system/config/configKey/' + configKey,
    method: 'get'
  })
}

// 新しいパラメーター構成
export function addConfig(data) {
  return request({
    url: '/system/config',
    method: 'post',
    data: data
  })
}

// パラメーター構成を変更します
export function updateConfig(data) {
  return request({
    url: '/system/config',
    method: 'put',
    data: data
  })
}

// パラメーター構成を削除します
export function delConfig(configId) {
  return request({
    url: '/system/config/' + configId,
    method: 'delete'
  })
}

// パラメーターキャッシュを更新します
export function refreshCache() {
  return request({
    url: '/system/config/refreshCache',
    method: 'delete'
  })
}
