import { ElButton, ElDialog, ElInput } from "element-plus";
import { createVNode, defineComponent, reactive, render } from "vue";

const DialogComponent = defineComponent({
  props: {
    option: {
      type: Object,
    },
  },
  setup(props, ctx) {
    const state = reactive({
      option: props.option,
      isShow: false,
    });
    ctx.expose({
      // 暴露方法供外部使用
      showDialog(option) {
        state.isShow = true;
        state.option = option;
      },
      hideDialog() {
        state.isShow = false;
      },
    });
    const onCancel = () => {
      state.isShow = false;
    };
    const onConfirm = () => {
      state.option.onConfirm && state.option.onConfirm(state.option.content);
      state.isShow = false;
    };
    return () => {
      return (
        <ElDialog title={state.option.title} v-model={state.isShow}>
          {{
            default: () => (
              <ElInput
                type="textarea"
                v-model={state.option.content}
                rows={10}
              ></ElInput>
            ),
            footer: () =>
              state.option.footer && (
                <div>
                  <ElButton onClick={onCancel}>取消</ElButton>
                  <ElButton type="primary" onClick={onConfirm}>
                    确定
                  </ElButton>
                </div>
              ),
          }}
        </ElDialog>
      );
    };
  },
});

let vnode;
export function $dialog(option) {
  // 手动挂载组件
  // 在vue2中需要使用 Vue.extend(options) 创建组件（.vue文件导出的数据就是options）
  /**
   * const Comp = Vue.extend(CompVue);
   * const comp = new Comp({propsData:{}})
   * comp.$mount("#container")
   */

  // 在 Vue3 中也是差不多，但是可以使用 createVNode(options,传递的属性数据对象) 创建虚拟节点
  // 然后使用 render(VNode,mountEl) 方法将 VNode 渲染成真实节点到 mountEl 上
  if (!vnode) {
    let el = document.createElement("div");
    vnode = createVNode(DialogComponent, { option });
    render(vnode, el);
    document.body.appendChild(el);
  }

  const { showDialog } = vnode.component.exposed;
  showDialog(option);
}
