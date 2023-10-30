import { computed, defineComponent } from "vue";

export default defineComponent({
  props: {
    start: { type: Number },
    end: { type: Number },
  },
  emit: ["update:end", "update:end"],
  setup(props, ctx) {
    const start = computed({
      get() {
        return props.start;
      },
      set(newVal) {
        ctx.emit("update:start", newVal);
      },
    });
    const end = computed({
      get() {
        return props.end;
      },
      set(newVal) {
        ctx.emit("update:end", newVal);
      },
    });
    return () => (
      <div className="range">
        <input type="text" v-model={start.value} />
        <span>~</span>
        <input type="text" v-model={end.value} />
      </div>
    );
  },
});
