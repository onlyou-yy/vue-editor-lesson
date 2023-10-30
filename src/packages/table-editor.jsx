import { $tableDialog } from "@/components/TableDialog";
import deepcopy from "deepcopy";
import { ElButton, ElTag } from "element-plus";
import { computed, defineComponent } from "vue";

export default defineComponent({
  props: {
    propConfig: { type: Object },
    modelValue: { type: Array },
  },
  emits: ["update:modelValue"],
  setup(props, ctx) {
    const data = computed({
      get() {
        return props.modelValue || [];
      },
      set(newVal) {
        ctx.emit("update:modelValue", deepcopy(newVal));
      },
    });
    const add = () => {
      $tableDialog({
        config: props.propConfig,
        data: data.value,
        onConfirm(newVal) {
          data.value = newVal;
        },
      });
    };
    return () => (
      <div>
        {(!data.value || data.value.length === 0) && (
          <ElButton onClick={add}>添加</ElButton>
        )}
        {(data.value || []).map((m) => {
          return <ElTag onClick={add}>{m[props.propConfig.table.key]}</ElTag>;
        })}
      </div>
    );
  },
});
