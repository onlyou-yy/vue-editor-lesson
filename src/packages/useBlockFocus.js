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
      // 当按住shift的时候不用清空
      block.focus = !block.focus;
    } else {
      if (!block.focus) {
        // 添加 focus 属性，是否被选择
        clearBlockFocus();
        block.focus = true;
      } else {
        block.focus = false;
      }
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
