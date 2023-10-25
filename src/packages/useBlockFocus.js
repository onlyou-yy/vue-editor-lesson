import { computed, ref } from "vue";

export function useBlockFocus(data, callback) {
  const selectIndex = ref(-1); //还没有选中

  // 最后选择的组件
  const lastSelectBlock = computed(() => data.value.blocks[selectIndex.value]);

  const clearBlockFocus = () => {
    data.value.blocks.forEach((block) => {
      block.focus = false;
    });
  };
  const blockMousedown = (e, block, index) => {
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
    selectIndex.value = index;
    callback && callback(e);
  };
  const containerMousedown = (e) => {
    clearBlockFocus();
    selectIndex.value = -1;
  };
  const focusData = computed(() => {
    let focus = [];
    let unfocus = [];
    data.value.blocks.forEach((block) =>
      (block.focus ? focus : unfocus).push(block)
    );
    return { focus, unfocus };
  });
  return {
    blockMousedown,
    containerMousedown,
    clearBlockFocus,
    focusData,
    lastSelectBlock,
  };
}
