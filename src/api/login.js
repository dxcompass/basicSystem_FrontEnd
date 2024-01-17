import request from '@/utils/request'

// ログインメソッド
export function login(username, password, code, uuid) {
  const data = {
    username,
    password,
    code,
    uuid
  }
  return request({
    url: '/login',
    headers: {
      isToken: false,
      repeatSubmit: false
    },
    method: 'post',
    data: data
  })
}

// 登録方法
export function register(data) {
  return request({
    url: '/register',
    headers: {
      isToken: false
    },
    method: 'post',
    data: data
  })
}

// ユーザーの詳細を取得します
export function getInfo() {
  return request({
    url: '/getInfo',
    method: 'get'
  })
}

// 終了方法
export function logout() {
  return request({
    url: '/logout',
    method: 'post'
  })
}

// 確認コードを取得します
export function getCodeImg() {
  return request({
    url: '/captchaImage',
    headers: {
      isToken: false
    },
    method: 'get',
    timeout: 20000
  })
}