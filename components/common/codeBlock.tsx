import { cx } from "../utils";

export function CodeBlock({
  label,
  code,
  tone
}: {
  label: string;
  code: string;
  tone: "bad" | "good";
}) {
  return (
    <pre className={cx("code-block", tone === "bad" ? "code-bad" : "code-good")}>
      <span className="code-label">{label}</span>
      {code}
    </pre>
  );
}
