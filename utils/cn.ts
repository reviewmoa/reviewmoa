export const cx = (...values: Array<string | false | undefined>) =>
  values.filter(Boolean).join(" ");
