import request from '@/utils/request'

// クエリキャッシュの詳細
export function getCache() {
  return request({
    url: '/monitor/cache',
    method: 'get'
  })
}

// キャッシュ名のリスト
export function listCacheName() {
  return request({
    url: '/monitor/cache/getNames',
    method: 'get'
  })
}

// クエリキャッシュキーリスト
export function listCacheKey(cacheName) {
  return request({
    url: '/monitor/cache/getKeys/' + cacheName,
    method: 'get'
  })
}

// クエリキャッシュコンテンツ
export function getCacheValue(cacheName, cacheKey) {
  return request({
    url: '/monitor/cache/getValue/' + cacheName + '/' + cacheKey,
    method: 'get'
  })
}

// 指定された名前キャッシュをクリーンアップします
export function clearCacheName(cacheName) {
  return request({
    url: '/monitor/cache/clearCacheName/' + cacheName,
    method: 'delete'
  })
}

// 指定されたキー名キャッシュをクリーニングします
export function clearCacheKey(cacheKey) {
  return request({
    url: '/monitor/cache/clearCacheKey/' + cacheKey,
    method: 'delete'
  })
}

// すべてのキャッシュをきれいにします
export function clearCacheAll() {
  return request({
    url: '/monitor/cache/clearCacheAll',
    method: 'delete'
  })
}
