import useUserStore from '@/store/modules/user'

function authPermission(permission) {
  const all_permission = "*:*:*";
  const permissions = useUserStore().permissions
  if (permission && permission.length > 0) {
    return permissions.some(v => {
      return all_permission === v || v === permission
    })
  } else {
    return false
  }
}

function authRole(role) {
  const super_admin = "admin";
  const roles = useUserStore().roles
  if (role && role.length > 0) {
    return roles.some(v => {
      return super_admin === v || v === role
    })
  } else {
    return false
  }
}

export default {
  // ユーザーが特定の権限を持っているかどうかを確認します
  hasPermi(permission) {
    return authPermission(permission);
  },
  // ユーザーが指定された権限を含んでいるかどうかを確認します，そのうちの1つを含めるだけです
  hasPermiOr(permissions) {
    return permissions.some(item => {
      return authPermission(item)
    })
  },
  // ユーザーが指定された権限を含んでいるかどうかを確認します，すべてが必要です
  hasPermiAnd(permissions) {
    return permissions.every(item => {
      return authPermission(item)
    })
  },
  // ユーザーが特定の役割を持っているかどうかを確認します
  hasRole(role) {
    return authRole(role);
  },
  // ユーザーに指定された役割が含まれているかどうかを確認します，そのうちの1つを含めるだけです
  hasRoleOr(roles) {
    return roles.some(item => {
      return authRole(item)
    })
  },
  // ユーザーに指定された役割が含まれているかどうかを確認します，すべてが必要です
  hasRoleAnd(roles) {
    return roles.every(item => {
      return authRole(item)
    })
  }
}
