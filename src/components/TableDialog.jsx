import deepcopy from "deepcopy";
import {
  ElButton,
  ElDialog,
  ElInput,
  ElTable,
  ElTableColumn,
} from "element-plus";
import { createVNode, defineComponent, reactive, render } from "vue";

const DialogComponent = defineComponent({
  props: {
    options: { type: Object },
  },
  setup(props, ctx) {
    const state = reactive({
      isShow: false,
      options: props.options,
      editData: [], //便捷的数据
    });
    ctx.expose({
      showDialog(options) {
        state.isShow = true;
        state.options = options;
        state.editData = deepcopy(options.data);
      },
      hideDialog() {
        state.isShow = false;
      },
    });
    const onConfirm = () => {
      props.options.onConfirm && props.options.onConfirm(state.editData);
      state.isShow = false;
    };
    const addColumn = () => {
      state.editData.push({});
    };
    const reset = () => {
      state.editData = deepcopy(props.options.data);
    };
    const deleteItem = (index) => {
      state.editData.splice(index, 1);
    };
    return () => (
      <ElDialog title={props.options.config.label} v-model={state.isShow}>
        {{
          default: () => (
            <>
              <div>
                <ElButton onClick={addColumn}>添加</ElButton>
                <ElButton onClick={reset}>重置</ElButton>
              </div>
              <ElTable data={state.editData}>
                <ElTableColumn type="index"></ElTableColumn>
                {state.options.config.table.options.map((item, index) => {
                  return (
                    <>
                      <ElTableColumn label={item.label}>
                        {{
                          default: ({ row }) => (
                            <ElInput v-model={row[item.field]}></ElInput>
                          ),
                        }}
                      </ElTableColumn>
                    </>
                  );
                })}
                <ElTableColumn label="操作">
                  {{
                    default: ({ $index }) => {
                      return (
                        <ElButton
                          type="danger"
                          onClick={() => {
                            deleteItem($index);
                          }}
                        >
                          删除
                        </ElButton>
                      );
                    },
                  }}
                </ElTableColumn>
              </ElTable>
            </>
          ),
          footer: () => (
            <>
              <ElButton onClick={() => (state.isShow = false)}>取消</ElButton>
              <ElButton onClick={onConfirm}>确定</ElButton>
            </>
          ),
        }}
      </ElDialog>
    );
  },
});

let vnode;
export const $tableDialog = (options) => {
  if (!vnode) {
    let el = document.createElement("div");
    vnode = createVNode(DialogComponent, { options });
    render(vnode, el);
    document.body.appendChild(el);
  }

  const { showDialog } = vnode.component.exposed;
  showDialog(options);
};
