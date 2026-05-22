import { cx } from "@/utils";

interface PageTitleProps {
  title: string;
  sub: string;
  compact?: boolean;
}

export function PageTitle({ title, sub, compact = false }: PageTitleProps) {
  return (
    <div className={cx("sec-head", compact && "page-title-compact")}>
      <div>
        <h1 className="page-title">{title}</h1>
        <p className="page-sub">{sub}</p>
      </div>
    </div>
  );
}
