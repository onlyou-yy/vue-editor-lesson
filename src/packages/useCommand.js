import deepcopy from "deepcopy";
import { events } from "./events";
import { onUnmounted } from "vue";

export function useCommand(data) {
  const state = {
    current: -1, //前进后退索引值
    queue: [], //存放所有操作的命令
    commands: {}, //命令和方法的映射
    commandArray: [], //所有的命令
    destoryArray: [], //需要执行销毁的操作
  };

  const register = (command) => {
    state.commandArray.push(command);
    state.commands[command.name] = (...argv) => {
      const { redo, undo } = command.execute(...argv);
      redo();
      if (!command.pushQueue) return;
      let { queue, current } = state;

      // 可能在放置过程中有撤销操作，所以根据当前最新的current值来计算新的队列
      // 组件1 -- 组件2 -- 撤销组件2 -- 组件3
      // 组件1 -- 组件3
      // 只有记录新的状态到队列的时候才将后续的状态进行删除
      if (queue.length > 0) {
        queue = queue.slice(0, current + 1);
        state.queue = queue;
      }

      queue.push({ redo, undo });
      state.current = current + 1;
    };
  };

  register({
    name: "redo", //前进
    keyboard: "ctrl+y",
    execute() {
      return {
        redo() {
          let item = state.queue[state.current + 1]; // 还原撤销
          if (item) {
            item.redo && item.redo();
            state.current++;
          }
        },
      };
    },
  });

  register({
    name: "undo", //后退
    keyboard: "ctrl+z",
    execute() {
      return {
        redo() {
          //撤销
          if (state.current === -1) return;
          let item = state.queue[state.current]; // 找到上一步还原
          if (item) {
            item.undo && item.undo();
            state.current--;
          }
        },
      };
    },
  });

  // 如果希望将操作放到队列中可以增加一个属性， 标识等会操作要放到队列中
  register({
    name: "drag",
    pushQueue: true,
    init() {
      this.before = null;
      // 监控拖拽开始事件，保存状态
      const start = () => (this.before = deepcopy(data.value.blocks));
      // 拖拽之后需要出发对应的指令，存储一下操作到队列中
      const end = () => state.commands.drag();
      events.on("start", start);
      events.on("end", end);
      return () => {
        events.off("start", start);
        events.off("end", end);
      };
    },
    execute() {
      // 这里形成了一个闭包，而且 data.value.blocks 是深拷贝更新，所以具有的数据数量不回被后面修改
      let before = this.before;
      let after = data.value.blocks;
      return {
        redo() {
          // 前进
          data.value = { ...data.value, blocks: after };
        },
        undo() {
          // 后退
          data.value = { ...data.value, blocks: before };
        },
      };
    },
  });

  const keyboardEvent = (() => {
    const keyCodes = {
      90: "z",
      89: "y",
    };
    const onKeydown = (e) => {
      const { ctrlKey, keyCode } = e;
      let keyString = [];
      if (ctrlKey) keyString.push("ctrl");
      keyString.push(keyCodes[keyCode]);
      keyString = keyString.join("+");

      state.commandArray.forEach(({ keyboard, name }) => {
        if (!keyboard) return;
        if (keyString === keyboard) {
          state.commands[name]();
          e.preventDefault();
        }
      });
    };
    const init = () => {
      window.addEventListener("keydown", onKeydown);
      return () => {
        window.removeEventListener("keydown", onKeydown);
      };
    };
    return init;
  })();

  register({
    name: "updateContainer",
    pushQueue: true,
    execute(newValue) {
      let state = {
        before: data.value,
        after: newValue,
      };
      return {
        redo() {
          data.value = state.after;
        },
        undo() {
          data.value = state.before;
        },
      };
    },
  });

  ~(() => {
    state.destoryArray.push(keyboardEvent());
    // 初始化
    state.commandArray.forEach(
      (command) => command.init && state.destoryArray.push(command.init())
    );
  })();

  onUnmounted(() => {
    // 清理绑定的事件
    state.destoryArray.forEach((fn) => fn && fn());
  });

  return state;
}
