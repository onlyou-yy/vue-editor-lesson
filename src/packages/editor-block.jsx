import { computed, defineComponent, inject, onMounted, ref } from "vue";

export default defineComponent({
  props: {
    block: {
      type: Object,
    },
  },
  setup(props) {
    const blockStyle = computed(() => ({
      top: `${props.block.top}px`,
      left: `${props.block.left}px`,
      zIndex: props.block.zIndex,
    }));
    const config = inject("config");

    const blockRef = ref(null);
    onMounted(() => {
      let { offsetWidth, offsetHeight } = blockRef.value;
      if (props.block.alignCenter) {
        // 拖拽出来渲染的要进行居中操作
        props.block.top = props.block.top - offsetHeight / 2;
        props.block.left = props.block.left - offsetWidth / 2;
        props.block.alignCenter = false; // 居中后就不需要居中了
      }
      props.block.width = offsetWidth;
      props.block.height = offsetHeight;
    });

    return () => {
      const { componentMap } = config;
      const component = componentMap[props.block.key];
      const RenderComponent = component.render(props.block);
      return (
        <div ref={blockRef} class="editor-block" style={blockStyle.value}>
          <RenderComponent></RenderComponent>
        </div>
      );
    };
  },
});
