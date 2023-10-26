import {
  computed,
  createVNode,
  defineComponent,
  inject,
  onBeforeUnmount,
  onMounted,
  provide,
  reactive,
  ref,
  render,
} from "vue";

const hideSymbol = Symbol("hide");
export const DropdownItem = defineComponent({
  props: {
    label: String,
    icon: Object,
  },
  setup(props, ctxt) {
    const { label, icon } = props;
    const hide = inject(hideSymbol);
    return () => (
      <div className="dropdown-item" onClick={hide}>
        {icon}
        <span>{label}</span>
      </div>
    );
  },
});

const DropdownComponent = defineComponent({
  props: {
    option: { type: Object },
  },
  setup(props, ctx) {
    const state = reactive({
      option: props.option,
      isShow: false,
      top: 0,
      left: 0,
    });
    ctx.expose({
      showDialog(option) {
        state.isShow = true;
        state.option = option;
        //返回元素的大小及其相对于窗口或者文档的位置
        let { top, left, height } = option.el.getBoundingClientRect();
        state.top = top + height;
        state.left = left;
      },
      hideDialog() {
        state.isShow = false;
      },
    });
    provide(hideSymbol, () => (state.isShow = false));
    const classes = computed(() => [
      "dropdown",
      {
        "dropdown-show": state.isShow,
      },
    ]);
    const styles = computed(() => ({
      top: `${state.top}px`,
      left: `${state.left}px`,
    }));
    const dropdownRef = ref(null);
    const onMousedownEvent = (e) => {
      if (dropdownRef.value.contains(e.target)) return;
      state.isShow = false;
    };
    onMounted(() => {
      // 事件的传递行为 先捕获再冒泡
      // 之前为了阻止事件传播 给block 都增加了stopPropagation
      document.body.addEventListener("mousedown", onMousedownEvent, true);
    });
    onBeforeUnmount(() => {
      document.body.removeEventListener("mousedown", onMousedownEvent, true);
    });
    return () => (
      <>
        <div ref={dropdownRef} style={styles.value} class={classes.value}>
          {state.option.content()}
        </div>
      </>
    );
  },
});

let vnode;
export const $dropdown = (option) => {
  if (!vnode) {
    const el = document.createElement("div");
    vnode = createVNode(DropdownComponent, { option });
    render(vnode, el);
    document.body.appendChild(el);
  }

  const { showDialog } = vnode.component.exposed;
  showDialog(option);
};
