// 列表区可以显示所有的物料
// key对应的组件映射关系

import { ElButton, ElInput } from "element-plus";

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

registerConfig.register({
  key: "text",
  name: "文本",
  preview: () => "这是一个预览文本",
  render: () => "这是渲染的文本",
});

registerConfig.register({
  key: "button",
  name: "按钮",
  preview: () => <ElButton>这是预览按钮</ElButton>,
  render: () => <ElButton>这是渲染的按钮</ElButton>,
});

registerConfig.register({
  key: "input",
  name: "输入框",
  preview: () => <ElInput placeholder="这是预览input"></ElInput>,
  render: () => <ElInput placeholder="这是渲染的input"></ElInput>,
});
