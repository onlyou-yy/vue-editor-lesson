export function useBlockGragger(focusData) {
  let dragState = {
    startX: 0,
    startY: 0,
  };
  const mousemove = (e) => {
    console.log("move");
    let { clientX: moveX, clientY: moveY } = e;
    let { startX, startY } = dragState;
    let durX = moveX - startX;
    let durY = moveY - startY;
    focusData.value.focus.forEach((block, idx) => {
      block.top = dragState.startPos[idx].top + durY;
      block.left = dragState.startPos[idx].left + durX;
    });
  };
  const mouseup = (e) => {
    document.removeEventListener("mousemove", mousemove);
    document.removeEventListener("mouseup", mouseup);
  };
  const mousedown = (e) => {
    // 记录点击时的位置
    dragState = {
      startX: e.clientX,
      startY: e.clientY,
      startPos: focusData.value.focus.map(({ top, left }) => ({ top, left })),
    };
    document.addEventListener("mousemove", mousemove);
    document.addEventListener("mouseup", mouseup);
  };
  return { mousedown };
}
