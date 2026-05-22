import { AdminResetPasswordForm } from "@/components/admin/adminResetPasswordForm";

export default async function Page({
  searchParams
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;

  return (
    <div className="view active">
      <div className="admin-login-page">
        <div>
          <div className="admin-title">비밀번호 재설정</div>
          <div className="admin-sub">메일 링크 확인이 끝나면 새 비밀번호를 설정할 수 있어요.</div>
          <AdminResetPasswordForm code={code} />
        </div>
      </div>
    </div>
  );
}
