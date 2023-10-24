import { computed } from "vue";

export function useBlockFocus(data, callback) {
  const clearBlockFocus = () => {
    data.value.blocks.forEach((block) => {
      block.focus = false;
    });
  };
  const blockMousedown = (e, block) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.shiftKey) {
      // 按住shiftKey键
      if (focusData.value.focus.length <= 1) {
        block.focus = true; // 当只有一个节点被选中时，按住shift键也不会切换focus状态
      } else {
        block.focus = !block.focus;
      }
    } else {
      if (!block.focus) {
        // 添加 focus 属性，是否被选择
        clearBlockFocus();
        block.focus = true;
      } // 当自己被选中，再次点击时还是选中状态
    }

    callback && callback(e);
  };
  const containerMousedown = (e) => {
    clearBlockFocus();
  };
  const focusData = computed(() => {
    let focus = [];
    let unfocus = [];
    data.value.blocks.forEach((block) =>
      (block.focus ? focus : unfocus).push(block)
    );
    return { focus, unfocus };
  });
  return { blockMousedown, containerMousedown, focusData };
}
