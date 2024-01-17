<template>
   <div class="app-container">
      <el-form :model="queryParams" ref="queryRef" v-show="showSearch" :inline="true" label-width="68px">
         <el-form-item label="ロール名" prop="roleName">
            <el-input
               v-model="queryParams.roleName"
               placeholder="请输入ロール名"
               clearable
               style="width: 240px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item label="权限字符" prop="roleKey">
            <el-input
               v-model="queryParams.roleKey"
               placeholder="请输入权限字符"
               clearable
               style="width: 240px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item label="州" prop="status">
            <el-select
               v-model="queryParams.status"
               placeholder="角色州"
               clearable
               style="width: 240px"
            >
               <el-option
                  v-for="dict in sys_normal_disable"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
               />
            </el-select>
         </el-form-item>
         <el-form-item label="作成時間" style="width: 308px">
            <el-date-picker
               v-model="dateRange"
               value-format="YYYY-MM-DD"
               type="daterange"
               range-separator="-"
               start-placeholder="開始日"
               end-placeholder="終了日"
            ></el-date-picker>
         </el-form-item>
         <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">検索</el-button>
            <el-button icon="Refresh" @click="resetQuery">選ぶり戻し</el-button>
         </el-form-item>
      </el-form>
      <el-row :gutter="10" class="mb8">
         <el-col :span="1.5">
            <el-button
               type="primary"
               plain
               icon="Plus"
               @click="handleAdd"
               v-hasPermi="['system:role:add']"
            >増加</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="success"
               plain
               icon="Edit"
               :disabled="single"
               @click="handleUpdate"
               v-hasPermi="['system:role:edit']"
            >改訂</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="danger"
               plain
               icon="Delete"
               :disabled="multiple"
               @click="handleDelete"
               v-hasPermi="['system:role:remove']"
            >選ぶり除く去</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="warning"
               plain
               icon="Download"
               @click="handleExport"
               v-hasPermi="['system:role:export']"
            >輸出</el-button>
         </el-col>
         <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>

      <!-- テーブルデータ -->
      <el-table v-loading="loading" :data="roleList" @selection-change="handleSelectionChange">
         <el-table-column type="selection" width="55" align="center" />
         <el-table-column label="文字番号" prop="roleId" width="120" />
         <el-table-column label="ロール名" prop="roleName" :show-overflow-tooltip="true" width="150" />
         <el-table-column label="寛容な性格" prop="roleKey" :show-overflow-tooltip="true" width="150" />
         <el-table-column label="表示順" prop="roleSort" width="100" />
         <el-table-column label="州" align="center" width="100">
            <template #default="scope">
               <el-switch
                  v-model="scope.row.status"
                  active-value="0"
                  inactive-value="1"
                  @change="handleStatusChange(scope.row)"
               ></el-switch>
            </template>
         </el-table-column>
         <el-table-column label="作成時間" align="center" prop="createTime">
            <template #default="scope">
               <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
         </el-table-column>
         <el-table-column label="動作します" align="center" class-name="small-padding fixed-width">
            <template #default="scope">
              <el-tooltip content="改訂" placement="top" v-if="scope.row.roleId !== 1">
                <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:role:edit']"></el-button>
              </el-tooltip>
              <el-tooltip content="選ぶり除く去" placement="top" v-if="scope.row.roleId !== 1">
                <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:role:remove']"></el-button>
              </el-tooltip>
              <el-tooltip content="データ許可" placement="top" v-if="scope.row.roleId !== 1">
                <el-button link type="primary" icon="CircleCheck" @click="handleDataScope(scope.row)" v-hasPermi="['system:role:edit']"></el-button>
              </el-tooltip>
              <el-tooltip content="ユーザーを割り当てます" placement="top" v-if="scope.row.roleId !== 1">
                <el-button link type="primary" icon="User" @click="handleAuthUser(scope.row)" v-hasPermi="['system:role:edit']"></el-button>
              </el-tooltip>
            </template>
         </el-table-column>
      </el-table>

      <pagination
         v-show="total > 0"
         :total="total"
         v-model:page="queryParams.pageNum"
         v-model:limit="queryParams.pageSize"
         @pagination="getList"
      />

      <!-- 添加或改訂角色配置对话框 -->
      <el-dialog :title="title" v-model="open" width="500px" append-to-body>
         <el-form ref="roleRef" :model="form" :rules="rules" label-width="100px">
            <el-form-item label="ロール名" prop="roleName">
               <el-input v-model="form.roleName" placeholder="请输入ロール名" />
            </el-form-item>
            <el-form-item prop="roleKey">
               <template #label>
                  <span>
                     <el-tooltip content="控制器中確かに义的寛容な性格，のように：@PreAuthorize(`@ss.hasRole('admin')`)" placement="top">
                        <el-icon><question-filled /></el-icon>
                     </el-tooltip>
                     寛容な性格
                  </span>
               </template>
               <el-input v-model="form.roleKey" placeholder="请输入寛容な性格" />
            </el-form-item>
            <el-form-item label="ロールオーダー" prop="roleSort">
               <el-input-number v-model="form.roleSort" controls-position="right" :min="0" />
            </el-form-item>
            <el-form-item label="州">
               <el-radio-group v-model="form.status">
                  <el-radio
                     v-for="dict in sys_normal_disable"
                     :key="dict.value"
                     :label="dict.value"
                  >{{ dict.label }}</el-radio>
               </el-radio-group>
            </el-form-item>
            <el-form-item label="メニュー許可">
               <el-checkbox v-model="menuExpand" @change="handleCheckedTreeExpand($event, 'menu')">拡大する/折り畳み</el-checkbox>
               <el-checkbox v-model="menuNodeAll" @change="handleCheckedTreeNodeAll($event, 'menu')">すべて選択/すべてを選択してください</el-checkbox>
               <el-checkbox v-model="form.menuCheckStrictly" @change="handleCheckedTreeConnect($event, 'menu')">父 - ソンリンケージ</el-checkbox>
               <el-tree
                  class="tree-border"
                  :data="menuOptions"
                  show-checkbox
                  ref="menuRef"
                  node-key="id"
                  :check-strictly="!form.menuCheckStrictly"
                  empty-text="読み込み，お待ちください"
                  :props="{ label: 'label', children: 'children' }"
               ></el-tree>
            </el-form-item>
            <el-form-item label="述べる">
               <el-input v-model="form.remark" type="textarea" placeholder="コンテンツを入力してください"></el-input>
            </el-form-item>
         </el-form>
         <template #footer>
            <div class="dialog-footer">
               <el-button type="primary" @click="submitForm">確かに 確かに</el-button>
               <el-button @click="cancel">選ぶ 選ぶり除く</el-button>
            </div>
         </template>
      </el-dialog>

      <!-- 分配角色データ許可对话框 -->
      <el-dialog :title="title" v-model="openDataScope" width="500px" append-to-body>
         <el-form :model="form" label-width="80px">
            <el-form-item label="ロール名">
               <el-input v-model="form.roleName" :disabled="true" />
            </el-form-item>
            <el-form-item label="寛容な性格">
               <el-input v-model="form.roleKey" :disabled="true" />
            </el-form-item>
            <el-form-item label="範囲">
               <el-select v-model="form.dataScope" @change="dataScopeSelectChange">
                  <el-option
                     v-for="item in dataScopeOptions"
                     :key="item.value"
                     :label="item.label"
                     :value="item.value"
                  ></el-option>
               </el-select>
            </el-form-item>
            <el-form-item label="データ許可" v-show="form.dataScope == 2">
               <el-checkbox v-model="deptExpand" @change="handleCheckedTreeExpand($event, 'dept')">拡大する/折り畳み</el-checkbox>
               <el-checkbox v-model="deptNodeAll" @change="handleCheckedTreeNodeAll($event, 'dept')">すべて選択/すべてを選択してください</el-checkbox>
               <el-checkbox v-model="form.deptCheckStrictly" @change="handleCheckedTreeConnect($event, 'dept')">父 - ソンリンケージ</el-checkbox>
               <el-tree
                  class="tree-border"
                  :data="deptOptions"
                  show-checkbox
                  default-expand-all
                  ref="deptRef"
                  node-key="id"
                  :check-strictly="!form.deptCheckStrictly"
                  empty-text="読み込み，お待ちください"
                  :props="{ label: 'label', children: 'children' }"
               ></el-tree>
            </el-form-item>
         </el-form>
         <template #footer>
            <div class="dialog-footer">
               <el-button type="primary" @click="submitDataScope">確かに 確かに</el-button>
               <el-button @click="cancelDataScope">選ぶ 選ぶり除く</el-button>
            </div>
         </template>
      </el-dialog>
   </div>
</template>

<script setup name="Role">
import { addRole, changeRoleStatus, dataScope, delRole, getRole, listRole, updateRole, deptTreeSelect } from "@/api/system/role";
import { roleMenuTreeselect, treeselect as menuTreeselect } from "@/api/system/menu";

const router = useRouter();
const { proxy } = getCurrentInstance();
const { sys_normal_disable } = proxy.useDict("sys_normal_disable");

const roleList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const dateRange = ref([]);
const menuOptions = ref([]);
const menuExpand = ref(false);
const menuNodeAll = ref(false);
const deptExpand = ref(true);
const deptNodeAll = ref(false);
const deptOptions = ref([]);
const openDataScope = ref(false);
const menuRef = ref(null);
const deptRef = ref(null);

/** データ範囲オプション*/
const dataScopeOptions = ref([
  { value: "1", label: "全部データ許可" },
  { value: "2", label: "自確かにデータ許可" },
  { value: "3", label: "本部门データ許可" },
  { value: "4", label: "本部门及以下データ許可" },
  { value: "5", label: "仅本人データ許可" }
]);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    roleName: undefined,
    roleKey: undefined,
    status: undefined
  },
  rules: {
    roleName: [{ required: true, message: "ロール名不能为空", trigger: "blur" }],
    roleKey: [{ required: true, message: "寛容な性格不能为空", trigger: "blur" }],
    roleSort: [{ required: true, message: "ロールオーダー不能为空", trigger: "blur" }]
  },
});

const { queryParams, form, rules } = toRefs(data);

/** コーナーリストをクエリします */
function getList() {
  loading.value = true;
  listRole(proxy.addDateRange(queryParams.value, dateRange.value)).then(response => {
    roleList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}
/** 検索按钮動作します */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}
/** 選ぶり戻し按钮動作します */
function resetQuery() {
  dateRange.value = [];
  proxy.resetForm("queryRef");
  handleQuery();
}
/** 選ぶり除く去按钮動作します */
function handleDelete(row) {
  const roleIds = row.roleId || ids.value;
  proxy.$modal.confirm('是否確かに认選ぶり除く去文字番号为"' + roleIds + '"データ項目?').then(function () {
    return delRole(roleIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("選ぶり除く去成功");
  }).catch(() => {});
}
/** 輸出按钮動作します */
function handleExport() {
  proxy.download("system/role/export", {
    ...queryParams.value,
  }, `role_${new Date().getTime()}.xlsx`);
}
/** マルチ選択ボックスはデータを選択します */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.roleId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}
/** 角色州改訂 */
function handleStatusChange(row) {
  let text = row.status === "0" ? "開いてください" : "停止";
  proxy.$modal.confirm('確かに认要"' + text + '""' + row.roleName + '"キャラクターですか？?').then(function () {
    return changeRoleStatus(row.roleId, row.status);
  }).then(() => {
    proxy.$modal.msgSuccess(text + "成功");
  }).catch(function () {
    row.status = row.status === "0" ? "1" : "0";
  });
}
/** 更多動作します */
function handleCommand(command, row) {
  switch (command) {
    case "handleDataScope":
      handleDataScope(row);
      break;
    case "handleAuthUser":
      handleAuthUser(row);
      break;
    default:
      break;
  }
}
/** ユーザーを割り当てます */
function handleAuthUser(row) {
  router.push("/system/role-auth/user/" + row.roleId);
}
/** クエリメニューツリー構造 */
function getMenuTreeselect() {
  menuTreeselect().then(response => {
    menuOptions.value = response.data;
  });
}
/** すべての部門ノードデータ */
function getDeptAllCheckedKeys() {
  // 選択した部門ノードが現在選択されています
  let checkedKeys = deptRef.value.getCheckedKeys();
  // ハーフ選挙での部門ノード
  let halfCheckedKeys = deptRef.value.getHalfCheckedKeys();
  checkedKeys.unshift.apply(checkedKeys, halfCheckedKeys);
  return checkedKeys;
}
/** 選ぶり戻し増加的表单以及其他数据  */
function reset() {
  if (menuRef.value != undefined) {
    menuRef.value.setCheckedKeys([]);
  }
  menuExpand.value = false;
  menuNodeAll.value = false;
  deptExpand.value = true;
  deptNodeAll.value = false;
  form.value = {
    roleId: undefined,
    roleName: undefined,
    roleKey: undefined,
    roleSort: 0,
    status: "0",
    menuIds: [],
    deptIds: [],
    menuCheckStrictly: true,
    deptCheckStrictly: true,
    remark: undefined
  };
  proxy.resetForm("roleRef");
}
/** 役割を追加します */
function handleAdd() {
  reset();
  getMenuTreeselect();
  open.value = true;
  title.value = "役割を追加します";
}
/** 改訂角色 */
function handleUpdate(row) {
  reset();
  const roleId = row.roleId || ids.value;
  const roleMenu = getRoleMenuTreeselect(roleId);
  getRole(roleId).then(response => {
    form.value = response.data;
    form.value.roleSort = Number(form.value.roleSort);
    open.value = true;
    nextTick(() => {
      roleMenu.then((res) => {
        let checkedKeys = res.checkedKeys;
        checkedKeys.forEach((v) => {
          nextTick(() => {
            menuRef.value.setChecked(v, true, false);
          });
        });
      });
    });
    title.value = "改訂角色";
  });
}
/** 役割によるとIDクエリメニューツリー構造 */
function getRoleMenuTreeselect(roleId) {
  return roleMenuTreeselect(roleId).then(response => {
    menuOptions.value = response.menus;
    return response;
  });
}
/** 役割によるとIDクエリ部門のツリー構造 */
function getDeptTree(roleId) {
  return deptTreeSelect(roleId).then(response => {
    deptOptions.value = response.depts;
    return response;
  });
}
/** 木の権威（拡大する/折り畳み）*/
function handleCheckedTreeExpand(value, type) {
  if (type == "menu") {
    let treeList = menuOptions.value;
    for (let i = 0; i < treeList.length; i++) {
      menuRef.value.store.nodesMap[treeList[i].id].expanded = value;
    }
  } else if (type == "dept") {
    let treeList = deptOptions.value;
    for (let i = 0; i < treeList.length; i++) {
      deptRef.value.store.nodesMap[treeList[i].id].expanded = value;
    }
  }
}
/** 木の権威（すべて選択/すべてを選択してください） */
function handleCheckedTreeNodeAll(value, type) {
  if (type == "menu") {
    menuRef.value.setCheckedNodes(value ? menuOptions.value : []);
  } else if (type == "dept") {
    deptRef.value.setCheckedNodes(value ? deptOptions.value : []);
  }
}
/** 木の権威（父 - ソンリンケージ） */
function handleCheckedTreeConnect(value, type) {
  if (type == "menu") {
    form.value.menuCheckStrictly = value ? true : false;
  } else if (type == "dept") {
    form.value.deptCheckStrictly = value ? true : false;
  }
}
/** すべてのメニューノードデータ */
function getMenuAllCheckedKeys() {
  // 選択したメニューノードが現在選択されています
  let checkedKeys = menuRef.value.getCheckedKeys();
  // セミ選出のメニューノード
  let halfCheckedKeys = menuRef.value.getHalfCheckedKeys();
  checkedKeys.unshift.apply(checkedKeys, halfCheckedKeys);
  return checkedKeys;
}
/** [提出]ボタン */
function submitForm() {
  proxy.$refs["roleRef"].validate(valid => {
    if (valid) {
      if (form.value.roleId != undefined) {
        form.value.menuIds = getMenuAllCheckedKeys();
        updateRole(form.value).then(response => {
          proxy.$modal.msgSuccess("改訂成功");
          open.value = false;
          getList();
        });
      } else {
        form.value.menuIds = getMenuAllCheckedKeys();
        addRole(form.value).then(response => {
          proxy.$modal.msgSuccess("増加成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}
/** 選ぶ選ぶり除く按钮 */
function cancel() {
  open.value = false;
  reset();
}
/** 选择角色範囲触发 */
function dataScopeSelectChange(value) {
  if (value !== "2") {
    deptRef.value.setCheckedKeys([]);
  }
}
/** 分配データ許可動作します */
function handleDataScope(row) {
  reset();
  const deptTreeSelect = getDeptTree(row.roleId);
  getRole(row.roleId).then(response => {
    form.value = response.data;
    openDataScope.value = true;
    nextTick(() => {
      deptTreeSelect.then(res => {
        nextTick(() => {
          if (deptRef.value) {
            deptRef.value.setCheckedKeys(res.checkedKeys);
          }
        });
      });
    });
    title.value = "分配データ許可";
  });
}
/** [提出]ボタン（データ許可） */
function submitDataScope() {
  if (form.value.roleId != undefined) {
    form.value.deptIds = getDeptAllCheckedKeys();
    dataScope(form.value).then(response => {
      proxy.$modal.msgSuccess("改訂成功");
      openDataScope.value = false;
      getList();
    });
  }
}
/** 選ぶ選ぶり除く按钮（データ許可）*/
function cancelDataScope() {
  openDataScope.value = false;
  reset();
}

getList();
</script>
