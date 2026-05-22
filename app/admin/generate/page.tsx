import { GenerateForm } from "@/components/admin";

export default function Page() {
  return (
    <>
      <div className="admin-title">규칙카드 생성</div>
      <div className="admin-sub">
        미션과 PR 번호 범위를 지정하면 서버가 리뷰를 수집하고 AI가 카드를 만들어요. 요청 후에는 작업 관리에서
        진행 상황을 확인해요.
      </div>
      <GenerateForm />
    </>
  );
}
