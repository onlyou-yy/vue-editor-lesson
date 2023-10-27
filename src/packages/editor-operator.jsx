import deepcopy from "deepcopy";
import {
  ElButton,
  ElColorPicker,
  ElForm,
  ElFormItem,
  ElInput,
  ElInputNumber,
  ElOption,
  ElSelect,
} from "element-plus";
import { defineComponent, inject, reactive, watch } from "vue";

export const EditorOperator = defineComponent({
  props: {
    block: { type: Object }, // 最后选中的元素
    data: { type: Object }, // 所有数据
    updateContainer: { type: Function },
    updateBlock: { type: Function },
  },
  setup(props, ctx) {
    const config = inject("config"); // 组件的配置信息
    const state = reactive({
      editData: {},
    });
    const reset = () => {
      if (!props.block) {
        // 说明要绑定的是容器宽高
        state.editData = deepcopy(props.data.container);
      } else {
        state.editData = deepcopy(props.block);
      }
    };
    const apply = () => {
      if (!props.block) {
        // 更改组件容器大小
        props.updateContainer({ ...props.data, container: state.editData });
      } else {
        // 更改组件的配置
        props.updateBlock(state.editData, props.block);
      }
    };
    watch(() => props.block, reset, { immediate: true });

    return () => {
      let content = [];
      if (!props.block) {
        content.push(
          <>
            <ElFormItem label="容器宽度">
              <ElInputNumber v-model={state.editData.width} />
            </ElFormItem>
            <ElFormItem label="容器高度">
              <ElInputNumber v-model={state.editData.height} />
            </ElFormItem>
          </>
        );
      } else {
        let component = config.componentMap[props.block.key];
        if (component && component.props) {
          // {text:{}, size:{}, color:{}}
          content.push(
            Object.entries(component.props).map(([propName, propConfig]) => {
              return (
                <ElFormItem label={propConfig.label}>
                  {{
                    input: () => (
                      <ElInput v-model={state.editData.props[propName]} />
                    ),
                    color: () => (
                      <ElColorPicker v-model={state.editData.props[propName]} />
                    ),
                    select: () => (
                      <ElSelect v-model={state.editData.props[propName]}>
                        {propConfig.options.map((opt) => {
                          return (
                            <ElOption label={opt.label} value={opt.value} />
                          );
                        })}
                      </ElSelect>
                    ),
                  }[propConfig.type]()}
                </ElFormItem>
              );
            })
          );
        }
        if (component && component.model) {
          content.push(
            Object.entries(component.model).map(([modelName, label]) => {
              // default
              return (
                <ElFormItem label={label}>
                  {/* model => {deafult: 'username'} */}
                  <ElInput v-model={state.editData.model[modelName]} />
                </ElFormItem>
              );
            })
          );
        }
      }

      return (
        <ElForm labelPosition="top">
          {content}
          <ElFormItem>
            <ElButton type="primary" onClick={() => apply()}>
              应用
            </ElButton>
            <ElButton onClick={reset}>重置</ElButton>
          </ElFormItem>
        </ElForm>
      );
    };
  },
});
