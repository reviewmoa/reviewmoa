import { cx } from "@/utils";

interface CodeBlockProps {
  label: string;
  code: string;
  tone: "bad" | "good";
}

export function CodeBlock({ label, code, tone }: CodeBlockProps) {
  return (
    <pre className={cx("code-block", tone === "bad" ? "code-bad" : "code-good")}>
      <span className="code-label">{label}</span>
      {code}
    </pre>
  );
}
