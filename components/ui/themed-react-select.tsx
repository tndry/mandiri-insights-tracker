import type { GroupBase, Props as ReactSelectProps } from "react-select";
import ReactSelect from "react-select";
import { useTheme } from "next-themes";

export function ThemedReactSelect<Option, IsMulti extends boolean = false, Group extends GroupBase<Option> = GroupBase<Option>>(
  props: ReactSelectProps<Option, IsMulti, Group>
) {
  const { resolvedTheme } = useTheme();
  return (
    <ReactSelect
      {...props}
      classNamePrefix={props.classNamePrefix || "react-select"}
      theme={theme => ({
        ...theme,
        colors: {
          ...theme.colors,
          neutral0: resolvedTheme === "dark" ? "#18181b" : "#fff", // background
          neutral80: resolvedTheme === "dark" ? "#fff" : "#18181b", // text
          primary25: resolvedTheme === "dark" ? "#27272a" : "#f3f4f6", // option hover
          primary: resolvedTheme === "dark" ? "#2563eb" : "#2563eb", // selected
        },
      })}
    />
  );
}
