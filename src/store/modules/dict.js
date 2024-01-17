const useDictStore = defineStore(
  'dict',
  {
    state: () => ({
      dict: new Array()
    }),
    actions: {
      // 辞書を入手します
      getDict(_key) {
        if (_key == null && _key == "") {
          return null;
        }
        try {
          for (let i = 0; i < this.dict.length; i++) {
            if (this.dict[i].key == _key) {
              return this.dict[i].value;
            }
          }
        } catch (e) {
          return null;
        }
      },
      // 辞書を設定します
      setDict(_key, value) {
        if (_key !== null && _key !== "") {
          this.dict.push({
            key: _key,
            value: value
          });
        }
      },
      // 辞書を削除します
      removeDict(_key) {
        var bln = false;
        try {
          for (let i = 0; i < this.dict.length; i++) {
            if (this.dict[i].key == _key) {
              this.dict.splice(i, 1);
              return true;
            }
          }
        } catch (e) {
          bln = false;
        }
        return bln;
      },
      // 空の辞書
      cleanDict() {
        this.dict = new Array();
      },
      // 初期辞書
      initDict() {
      }
    }
  })

export default useDictStore
