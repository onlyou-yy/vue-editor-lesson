import { computed, defineComponent, inject, ref } from "vue";
import "./editor.scss";
import EditorBlock from "./editor-block";
import deepcopy from "deepcopy";
import { useMenuDragger } from "./useMenuDragger";
import { useBlockFocus } from "./useBlockFocus";
import { useBlockGragger } from "./useBlockDragger";
import { ElButton } from "element-plus";
import {
  DArrowLeft,
  DArrowRight,
  Download,
  Upload,
  SortDown,
  SortUp,
  Delete,
  View,
  Hide,
  CloseBold,
} from "@element-plus/icons-vue";
import { useCommand } from "./useCommand";
import { $dialog } from "@/components/Dialog";
import { $dropdown, DropdownItem } from "@/components/Dropdown";
import { EditorOperator } from "./editor-operator";
export default defineComponent({
  props: {
    modelValue: {
      type: Object,
      default: () => ({}),
    },
    formData: {
      type: Object,
    },
  },
  emits: ["update:modelValue"],
  setup(props, ctx) {
    // 预览的时候内容不能再操作，可以点击输入内容方便看效果
    const previewRef = ref(false);
    // 是否处在页面编辑状态，否就是预览页面
    const editorRef = ref(true);

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
    const {
      blockMousedown,
      containerMousedown,
      clearBlockFocus,
      focusData,
      lastSelectBlock,
    } = useBlockFocus(data, previewRef, (e) => {
      // 选中后可以直接进行拖拽
      console.log(focusData.value.focus);
      mousedown(e);
    });
    const { mousedown, markLine } = useBlockGragger(
      focusData,
      lastSelectBlock,
      data
    );

    const { commands } = useCommand(data, focusData);
    const buttons = [
      { label: "撤销", icon: <DArrowLeft />, handler: () => commands.undo() },
      { label: "还原", icon: <DArrowRight />, handler: () => commands.redo() },
      {
        label: "导出",
        icon: <Upload />,
        handler: () => {
          $dialog({
            title: "导出json使用",
            content: JSON.stringify(data.value),
            footer: false,
          });
        },
      },
      {
        label: "导入",
        icon: <Download />,
        handler: () => {
          $dialog({
            title: "导入json使用",
            content: "",
            footer: true,
            onConfirm(text) {
              commands.updateContainer(JSON.parse(text));
            },
          });
        },
      },
      { label: "置顶", icon: <SortUp />, handler: () => commands.placeTop() },
      {
        label: "置底",
        icon: <SortDown />,
        handler: () => commands.placeBottom(),
      },
      { label: "删除", icon: <Delete />, handler: () => commands.delete() },
      {
        label: () => (previewRef.value ? "编辑" : "预览"),
        icon: () => (previewRef.value ? <Hide /> : <View />),
        handler: () => {
          previewRef.value = !previewRef.value;
          clearBlockFocus();
        },
      },
      {
        label: "关闭",
        icon: <CloseBold />,
        handler: () => {
          editorRef.value = false;
          clearBlockFocus();
        },
      },
    ];

    const onContextMenuBlock = (e, block) => {
      e.preventDefault();
      $dropdown({
        el: e.target, // 以哪个元素为准产生一个dropdown
        content: () => {
          return (
            <>
              <DropdownItem
                label="删除"
                icon={<Delete style="width: 1rem" />}
                onClick={() => commands.delete()}
              />
              <DropdownItem
                label="置顶"
                icon={<SortUp style="width: 1rem" />}
                onClick={() => commands.placeTop()}
              />
              <DropdownItem
                label="置底"
                icon={<SortDown style="width: 1rem" />}
                onClick={() => commands.placeBottom()}
              />
              <DropdownItem
                label="查看"
                icon={<View style="width: 1rem" />}
                onClick={() => {
                  $dialog({
                    title: "查看节点数据",
                    content: JSON.stringify(block, null, 2),
                  });
                }}
              />
              <DropdownItem
                label="导入"
                icon={<Download style="width: 1rem" />}
                onClick={() => {
                  $dialog({
                    title: "导入节点数据",
                    content: "",
                    footer: true,
                    onConfirm(text) {
                      commands.updateBlock(JSON.parse(text), block);
                    },
                  });
                }}
              />
            </>
          );
        },
      });
    };

    return () =>
      !editorRef.value ? (
        <>
          <div
            className="editor-container-canvas__content"
            style={[containerStyle.value, { margin: 0 }]}
          >
            {data.value.blocks.map((block, i) => {
              return (
                <EditorBlock
                  class={"editor-block-preview"}
                  block={block}
                  formData={props.formData}
                ></EditorBlock>
              );
            })}
          </div>
          <div>
            <ElButton
              onClick={() => {
                editorRef.value = true;
              }}
            >
              继续编辑
            </ElButton>
          </div>
        </>
      ) : (
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
          <div className="editor-top">
            {buttons.map((btn, index) => {
              const icon =
                typeof btn.icon === "function" ? btn.icon() : btn.icon;
              const label =
                typeof btn.label === "function" ? btn.label() : btn.label;
              return (
                <ElButton
                  type="primary"
                  size="small"
                  icon={icon}
                  key={index}
                  onClick={btn.handler}
                >
                  {label}
                </ElButton>
              );
            })}
          </div>
          <div className="editor-right">
            <EditorOperator
              block={lastSelectBlock.value}
              data={data.value}
              updateContainer={commands.updateContainer}
              updateBlock={commands.updateBlock}
            ></EditorOperator>
          </div>
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
                      class={[
                        block.focus ? "editor-block-focus" : "",
                        previewRef.value ? "editor-block-preview" : "",
                      ]}
                      block={block}
                      onMousedown={(e) => {
                        blockMousedown(e, block, i);
                      }}
                      onContextmenu={(e) => {
                        onContextMenuBlock(e, block);
                      }}
                      formData={props.formData}
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
