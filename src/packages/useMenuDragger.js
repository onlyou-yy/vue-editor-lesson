import { events } from "./events";

export function useMenuDragger(containerRef, data) {
  let currentComponent = null;
  const dragenter = (e) => {
    e.dataTransfer.dropEffect = "move";
  };
  const dragover = (e) => {
    e.preventDefault();
  };
  const dragleave = (e) => {
    e.dataTransfer.dropEffect = "none";
  };
  const drop = (e) => {
    let blocks = data.value.blocks; //内部已经渲染的组件的配置
    data.value = {
      ...data.value,
      blocks: [
        ...blocks,
        {
          key: currentComponent.key,
          top: e.offsetY,
          left: e.offsetX,
          zIndex: 1,
          alignCenter: true, //渲染完是否居中
        },
      ],
    };

    currentComponent = null;
  };
  const dragstart = (e, component) => {
    currentComponent = component;
    // 进入元素中添加一个移动的标识
    containerRef.value.addEventListener("dragenter", dragenter);
    // 在目标元素经过必须要阻止默认行为，否则不能触发 drop 事件
    containerRef.value.addEventListener("dragover", dragover);
    // 离开元素需要添加一个禁用的标识
    containerRef.value.addEventListener("dragleave", dragleave);
    // 松手的时候，根据拖拽的组件添加一个组件
    containerRef.value.addEventListener("drop", drop);
    events.emit("start");
  };

  const dragend = (e, component) => {
    containerRef.value.removeEventListener("dragenter", dragenter);
    containerRef.value.removeEventListener("dragover", dragover);
    containerRef.value.removeEventListener("dragleave", dragleave);
    containerRef.value.removeEventListener("drop", drop);
    events.emit("end");
  };

  return { dragstart, dragend, currentComponent };
}
