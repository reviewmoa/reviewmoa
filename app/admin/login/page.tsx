import { AdminLoginForm } from "@/components/admin/adminLoginForm";

export default async function Page({
  searchParams
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next = "/admin" } = await searchParams;

  return (
    <div className="view active">
      <div className="admin-login-page">
        <div>
          <div className="admin-title">관리자 로그인</div>
          <div className="admin-sub">Supabase Auth 계정으로 로그인하면 관리자 콘솔을 사용할 수 있어요.</div>
          <AdminLoginForm next={next} />
        </div>
      </div>
    </div>
  );
}
