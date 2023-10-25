import { computed, defineComponent, inject, ref } from "vue";
import "./editor.scss";
import EditorBlock from "./editor-block";
import deepcopy from "deepcopy";
import { useMenuDragger } from "./useMenuDragger";
import { useBlockFocus } from "./useBlockFocus";
import { useBlockGragger } from "./useBlockDragger";
export default defineComponent({
  props: {
    modelValue: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ["update:modelValue"],
  setup(props, ctx) {
    const data = computed({
      get() {
        return props.modelValue;
      },
      set(newVal) {
        ctx.emit("update:modelValue", deepcopy(newVal));
      },
    });
    console.log("editor setup");
    const containerStyle = computed(() => ({
      width: data.value.container.width + "px",
      height: data.value.container.height + "px",
    }));

    const config = inject("config");
    const componentList = config.componentList;

    const containerRef = ref(null);
    // 实现菜单拖拽功能
    const { dragstart, dragend } = useMenuDragger(containerRef, data);
    // 拖动
    // 点击选中
    const { blockMousedown, containerMousedown, focusData, lastSelectBlock } =
      useBlockFocus(data, (e) => {
        // 选中后可以直接进行拖拽
        console.log(focusData.value.focus);
        mousedown(e);
      });
    const { mousedown, markLine } = useBlockGragger(
      focusData,
      lastSelectBlock,
      data
    );

    return () => (
      <div className="editor">
        <div className="editor-left">
          {componentList.map((component) => {
            return (
              <div
                className="editor-left-item"
                draggable
                onDragstart={(e) => dragstart(e, component)}
                onDragend={(e) => dragend(e, component)}
              >
                <span>{component.name}</span>
                <div>{component.preview()}</div>
              </div>
            );
          })}
        </div>
        <div className="editor-top">top</div>
        <div className="editor-right">right</div>
        <div
          className="editor-container"
          onMousedown={() => {
            containerMousedown();
          }}
        >
          {/* 负责产生滚动条 */}
          <div className="editor-container-canvas">
            {/* 产生内容区域 */}
            <div
              className="editor-container-canvas__content"
              style={containerStyle.value}
              ref={containerRef}
            >
              {data.value.blocks.map((block, i) => {
                return (
                  <EditorBlock
                    class={block.focus ? "editor-block-focus" : ""}
                    block={block}
                    onMousedown={(e) => {
                      blockMousedown(e, block, i);
                    }}
                  ></EditorBlock>
                );
              })}

              {/* 辅助线 */}
              {markLine.x !== null && (
                <div
                  className="line-x"
                  style={{ left: `${markLine.x}px` }}
                ></div>
              )}
              {markLine.y !== null && (
                <div
                  className="line-y"
                  style={{ top: `${markLine.y}px` }}
                ></div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  },
});
