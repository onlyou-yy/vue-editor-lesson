import { reactive } from "vue";
import { events } from "./events";

export function useBlockGragger(focusData, lastSelectBlock, data) {
  let dragState = {
    startX: 0,
    startY: 0,
    dragging: false, //默认不是在拖拽
  };
  let markLine = reactive({
    x: null,
    y: null,
  });
  const mousemove = (e) => {
    let { clientX: moveX, clientY: moveY } = e;
    if (!dragState.dragging) {
      dragState.dragging = true;
      events.emit("start"); //触发事件记住拖拽前的位置
    }
    // 计算当前元素最新的left和top去线里面找，找到显示线
    // 鼠标移动后 - 鼠标移动前 + left
    let left = moveX - dragState.startX + dragState.startLeft;
    let top = moveY - dragState.startY + dragState.startTop;

    // 计算横线，距离参照物还有5px的时候就显示横线
    let y = null;
    let x = null;
    for (let i = 0; i < dragState.lines.y.length; i++) {
      const { top: t, showTop: s } = dragState.lines.y[i];
      if (Math.abs(top - t) < 5) {
        y = s;

        // 实现快速贴边;
        // 下面的 durY 就等于 t - dragState.startTop
        // 就是直接算出移动开始到当前贴边点的距离，之后直接将元素移动到该位置
        moveY = dragState.startY + t - dragState.startTop;

        break;
      }
    }
    for (let i = 0; i < dragState.lines.x.length; i++) {
      const { left: l, showLeft: s } = dragState.lines.x[i];
      if (Math.abs(l - left) < 5) {
        x = s;
        moveX = dragState.startX - dragState.startLeft + l;
        break;
      }
    }

    markLine.x = x;
    markLine.y = y;

    let durX = moveX - dragState.startX;
    let durY = moveY - dragState.startY;
    focusData.value.focus.forEach((block, idx) => {
      block.top = dragState.startPos[idx].top + durY;
      block.left = dragState.startPos[idx].left + durX;
    });
  };
  const mouseup = (e) => {
    document.removeEventListener("mousemove", mousemove);
    document.removeEventListener("mouseup", mouseup);
    markLine.x = null;
    markLine.y = null;

    if (dragState.dragging) {
      dragState.dragging = false;
      events.emit("end");
    }
  };
  const mousedown = (e) => {
    const { width: BWidth, height: BHeight } = lastSelectBlock.value;
    // 记录点击时的位置
    dragState = {
      startX: e.clientX,
      startY: e.clientY,
      startLeft: lastSelectBlock.value.left, // B 拖拽开始前的位置
      startTop: lastSelectBlock.value.top,
      startPos: focusData.value.focus.map(({ top, left }) => ({ top, left })),
      dragging: false,
      lines: (() => {
        // 记录当前选择的元素与其他元素的位置关系的辅助线关系
        // 辅助线是在未选中的元素中创建的
        // 获取其他没选择的元素，以他们的位置做辅助线
        const { unfocus } = focusData.value;
        const lines = { x: [], y: [] }; //用y来记录横向的横线，用x来记录纵向的横线
        [
          ...unfocus,
          {
            top: 0,
            left: 0,
            width: data.value.container.width,
            height: data.value.container.height,
          }, //这个是容器的信息
        ].forEach((block) => {
          const {
            top: ATop,
            left: ALeft,
            width: AWidth,
            height: AHeight,
          } = block;
          // 此元素拖拽到和A元素top一致的时候，要显示这根辅助线，辅助线的位置就是ATop
          // showTop:线的位置 top:移动模块位置
          // 当 B（原点） 到达 top 的时候显示辅助线，辅助线的位置就在 showTop 处
          lines.y.push({ showTop: ATop, top: ATop }); // A顶对B顶
          lines.y.push({ showTop: ATop, top: ATop - BHeight }); // A顶对B底
          lines.y.push({
            showTop: ATop + AHeight / 2,
            top: ATop + AHeight / 2 - BHeight / 2,
          }); //A中对B中
          lines.y.push({ showTop: ATop + AHeight, top: ATop + AHeight }); // 底对顶
          lines.y.push({
            showTop: ATop + AHeight,
            top: ATop + AHeight - BHeight,
          }); // 底对底

          // 当 B（原点） 到达 left 的时候显示辅助线，辅助线的位置就在 showLeft 处
          lines.x.push({ showLeft: ALeft, left: ALeft }); // 左对左
          lines.x.push({ showLeft: ALeft + AWidth, left: ALeft + AWidth }); // 右对左
          lines.x.push({
            showLeft: ALeft + AWidth / 2,
            left: ALeft + AWidth / 2 - BWidth / 2,
          }); // 中对中
          lines.x.push({
            showLeft: ALeft + AWidth,
            left: ALeft + AWidth - BWidth,
          }); // 右对右
          lines.x.push({ showLeft: ALeft, left: ALeft - BWidth }); // 左对右
        });
        return lines;
      })(),
    };
    document.addEventListener("mousemove", mousemove);
    document.addEventListener("mouseup", mouseup);
  };
  return { mousedown, markLine };
}
