// 列表区可以显示所有的物料
// key对应的组件映射关系

import Range from "@/components/Range";
import { ElButton, ElInput, ElOption, ElSelect } from "element-plus";

function createEditorConfig() {
  const componentList = []; //物料区组件列表
  const componentMap = {}; //物料区和渲染区组件的映射
  return {
    componentList,
    componentMap,
    register(config) {
      componentList.push(config);
      componentMap[config.key] = config;
    },
  };
}

export const registerConfig = createEditorConfig();
const createInputProp = (label) => ({ type: "input", label });
const createColorProp = (label) => ({ type: "color", label });
const createSelectProp = (label, options) => ({
  type: "select",
  label,
  options,
});
const createTableProp = (label, table) => ({ type: "table", table, label });

registerConfig.register({
  key: "text",
  name: "文本",
  preview: () => "这是一个预览文本",
  render: ({ props }) => (
    <span style={{ color: props.color, fontSize: props.size }}>
      {props.text || "渲染文本"}
    </span>
  ),
  props: {
    text: createInputProp("文本内容"),
    color: createColorProp("字体颜色"),
    size: createSelectProp("字体大小", [
      { label: "14px", value: "14px" },
      { label: "24px", value: "24px" },
      { label: "34px", value: "34px" },
    ]),
  },
});

registerConfig.register({
  key: "button",
  name: "按钮",
  preview: () => <ElButton>这是预览按钮</ElButton>,
  render: ({ props, size }) => (
    <ElButton
      style={{ width: `${size.width}px`, height: `${size.height}px` }}
      type={props.type}
    >
      {props.text || "渲染按钮"}
    </ElButton>
  ),
  props: {
    text: createInputProp("按钮内容"),
    type: createSelectProp("按钮类型", [
      { label: "基础", value: "primary" },
      { label: "成功", value: "success" },
      { label: "警告", value: "warning" },
      { label: "危险", value: "danger" },
      { label: "文本", value: "text" },
    ]),
    size: createSelectProp("按钮尺寸", [
      { label: "默认", value: "default" },
      { label: "大", value: "large" },
      { label: "小", value: "small" },
    ]),
  },
  resize: {
    width: true,
    height: true,
  },
});

registerConfig.register({
  key: "input",
  name: "输入框",
  preview: () => <ElInput placeholder="这是预览input"></ElInput>,
  render: ({ model, size }) => (
    <ElInput
      style={{ width: `${size.width}px` }}
      placeholder="渲染输入框"
      {...model.default}
    ></ElInput>
  ),
  model: {
    default: "绑定字段",
  },
  resize: {
    width: true, //更改输入框的横向大小
  },
});

registerConfig.register({
  key: "range",
  name: "范围选择器",
  preview: () => <Range></Range>,
  render: ({ model }) => (
    <Range
      {...{
        start: model.start.modelValue,
        "onUpdate:start": model.start["onUpdate:modelValue"],
        end: model.end.modelValue,
        "onUpdate:end": model.end["onUpdate:modelValue"],
      }}
    ></Range>
  ),
  model: {
    start: "开始范围字段",
    end: "结束范围字段",
  },
});

registerConfig.register({
  key: "select",
  name: "下拉选择器",
  preview: () => <ElSelect modelValue=""></ElSelect>,
  render: ({ props, model }) => (
    <ElSelect {...model.default}>
      {(props.options || []).map((item) => {
        return <ElOption label={item.label} value={item.value}></ElOption>;
      })}
    </ElSelect>
  ),
  props: {
    options: createTableProp("下拉选项", {
      options: [
        { label: "显示值", field: "label" },
        { label: "绑定值", field: "value" },
      ],
      key: "label", //显示给用户的值是label值
    }),
  },
  model: {
    default: "绑定字段",
  },
});
