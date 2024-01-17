<template>
  <el-form ref="genInfoForm" :model="info" :rules="rules" label-width="150px">
    <el-row>
      <el-col :span="12">
        <el-form-item prop="tplCategory">
          <template #label>テンプレートを生成します</template>
          <el-select v-model="info.tplCategory" @change="tplSelectChange">
            <el-option label="シングルウォッチ（追加、削除、および変更）" value="crud" />
            <el-option label="ツリーテーブル（追加、削除、および変更）" value="tree" />
            <el-option label="一次表（追加、削除、および変更）" value="sub" />
          </el-select>
        </el-form-item>
      </el-col>

      <el-col :span="12">
        <el-form-item prop="tplWebType">
          <template #label>フロントエンドタイプ</template>
          <el-select v-model="info.tplWebType">
            <el-option label="Vue2 Element UI ステンシル" value="element-ui" />
            <el-option label="Vue3 Element Plus ステンシル" value="element-plus" />
          </el-select>
        </el-form-item>
      </el-col>

      <el-col :span="12">
        <el-form-item prop="packageName">
          <template #label>
            パッケージパスを生成します
            <el-tooltip content="どれが生成されますかjava詰め込まれています，例えば com.ruoyi.system" placement="top">
              <el-icon><question-filled /></el-icon>
            </el-tooltip>
          </template>
          <el-input v-model="info.packageName" />
        </el-form-item>
      </el-col>

      <el-col :span="12">
        <el-form-item prop="moduleName">
          <template #label>
            モジュール名を生成します
            <el-tooltip content="サブシステム名として理解できます，例えば system" placement="top">
              <el-icon><question-filled /></el-icon>
            </el-tooltip>
          </template>
          <el-input v-model="info.moduleName" />
        </el-form-item>
      </el-col>

      <el-col :span="12">
        <el-form-item prop="businessName">
          <template #label>
            ビジネス名を生成します
            <el-tooltip content="機能英語名として理解できます，例えば user" placement="top">
              <el-icon><question-filled /></el-icon>
            </el-tooltip>
          </template>
          <el-input v-model="info.businessName" />
        </el-form-item>
      </el-col>

      <el-col :span="12">
        <el-form-item prop="functionName">
          <template #label>
            工場の関数名
            <el-tooltip content="クラスの説明として使用されます，例えば ユーザー" placement="top">
              <el-icon><question-filled /></el-icon>
            </el-tooltip>
          </template>
          <el-input v-model="info.functionName" />
        </el-form-item>
      </el-col>

      <el-col :span="12">
        <el-form-item prop="genType">
          <template #label>
            コードを生成する方法
            <el-tooltip content="デフォルトはですzip压缩詰め込まれています载，生成パスをカスタマイズすることもできます" placement="top">
              <el-icon><question-filled /></el-icon>
            </el-tooltip>
          </template>
          <el-radio v-model="info.genType" label="0">zipアーカイブ</el-radio>
          <el-radio v-model="info.genType" label="1">カスタムパス</el-radio>
        </el-form-item>
      </el-col>

      <el-col :span="12">
        <el-form-item>
          <template #label>
            優れたメニュー
            <el-tooltip content="指定されたメニューの下に割り当てます，例えば システムマネジメント" placement="top">
              <el-icon><question-filled /></el-icon>
            </el-tooltip>
          </template>
          <tree-select
            v-model:value="info.parentMenuId"
            :options="menuOptions"
            :objMap="{ value: 'menuId', label: 'menuName', children: 'children' }"
            placeholder="システムメニューを選択してください"
          />
        </el-form-item>
      </el-col>

      <el-col :span="24" v-if="info.genType == '1'">
        <el-form-item prop="genPath">
          <template #label>
            カスタムパス
            <el-tooltip content="ディスクの絶対パスを入力します，記入していない場合，電流に生成されますWebプロジェクトの下" placement="top">
              <el-icon><question-filled /></el-icon>
            </el-tooltip>
          </template>
          <el-input v-model="info.genPath">
            <template #append>
              <el-dropdown>
                <el-button type="primary">
                  すばやく選択する最近のパス
                  <i class="el-icon-arrow-down el-icon--right"></i>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="info.genPath = '/'">デフォルトの基本パスを復元します</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </template>
          </el-input>
        </el-form-item>
      </el-col>
    </el-row>
    
    <template v-if="info.tplCategory == 'tree'">
      <h4 class="form-header">その他の情報</h4>
      <el-row v-show="info.tplCategory == 'tree'">
        <el-col :span="12">
          <el-form-item>
            <template #label>
              ツリーコーディングフィールド
              <el-tooltip content="ツリーによって表示されるコードフィールド名， のように：dept_id" placement="top">
                <el-icon><question-filled /></el-icon>
              </el-tooltip>
            </template>
            <el-select v-model="info.treeCode" placeholder="選んでください">
              <el-option
                v-for="(column, index) in info.columns"
                :key="index"
                :label="column.columnName + '：' + column.columnComment"
                :value="column.columnName"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item>
            <template #label>
              ツリーファーザーコードフィールド
              <el-tooltip content="ツリーによって表示される父親のコーディングフィールド名， のように：parent_Id" placement="top">
                <el-icon><question-filled /></el-icon>
              </el-tooltip>
            </template>
            <el-select v-model="info.treeParentCode" placeholder="選んでください">
              <el-option
                v-for="(column, index) in info.columns"
                :key="index"
                :label="column.columnName + '：' + column.columnComment"
                :value="column.columnName"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item>
            <template #label>
              ツリー名フィールド
              <el-tooltip content="ツリーノードの名前のフィールド名を表示します， のように：dept_name" placement="top">
                <el-icon><question-filled /></el-icon>
              </el-tooltip>
            </template>
            <el-select v-model="info.treeName" placeholder="選んでください">
              <el-option
                v-for="(column, index) in info.columns"
                :key="index"
                :label="column.columnName + '：' + column.columnComment"
                :value="column.columnName"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </template>

    <template v-if="info.tplCategory == 'sub'">
      <h4 class="form-header">関連情報</h4>
      <el-row>
        <el-col :span="12">
          <el-form-item>
            <template #label>
              関連するサブテーブルの名前
              <el-tooltip content="関連するサブテーブルの名前， のように：sys_user" placement="top">
                <el-icon><question-filled /></el-icon>
              </el-tooltip>
            </template>
            <el-select v-model="info.subTableName" placeholder="選んでください" @change="subSelectChange">
              <el-option
                v-for="(table, index) in tables"
                :key="index"
                :label="table.tableName + '：' + table.tableComment"
                :value="table.tableName"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item>
            <template #label>
              サブテーブルに関連付けられた外側キー
              <el-tooltip content="サブテーブルに関連付けられた外側キー， のように：user_id" placement="top">
                <el-icon><question-filled /></el-icon>
              </el-tooltip>
            </template>
            <el-select v-model="info.subTableFkName" placeholder="選んでください">
              <el-option
                v-for="(column, index) in subColumns"
                :key="index"
                :label="column.columnName + '：' + column.columnComment"
                :value="column.columnName"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </template>

  </el-form>
</template>

<script setup>
import { listMenu } from "@/api/system/menu";

const subColumns = ref([]);
const menuOptions = ref([]);
const { proxy } = getCurrentInstance();

const props = defineProps({
  info: {
    type: Object,
    default: null
  },
  tables: {
    type: Array,
    default: null
  }
});

// フォーム検証
const rules = ref({
  tplCategory: [{ required: true, message: "選んでくださいテンプレートを生成します", trigger: "blur" }],
  packageName: [{ required: true, message: "请输入パッケージパスを生成します", trigger: "blur" }],
  moduleName: [{ required: true, message: "请输入モジュール名を生成します", trigger: "blur" }],
  businessName: [{ required: true, message: "请输入ビジネス名を生成します", trigger: "blur" }],
  functionName: [{ required: true, message: "请输入工場の関数名", trigger: "blur" }]
});
function subSelectChange(value) {
  props.info.subTableFkName = "";
}
function tplSelectChange(value) {
  if (value !== "sub") {
    props.info.subTableName = "";
    props.info.subTableFkName = "";
  }
}
function setSubTableColumns(value) {
  for (var item in props.tables) {
    const name = props.tables[item].tableName;
    if (value === name) {
      subColumns.value = props.tables[item].columns;
      break;
    }
  }
}
/** クエリメニューツリー構造をプルダウンします */
function getMenuTreeselect() {
  listMenu().then(response => {
    menuOptions.value = proxy.handleTree(response.data, "menuId");
  });
}

watch(() => props.info.subTableName, val => {
  setSubTableColumns(val);
});

watch(() => props.info.tplWebType, val => {
  if (val === '') {
    props.info.tplWebType = "element-plus";
  }
});

getMenuTreeselect();
</script>
