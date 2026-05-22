import { MissionForm, MissionTable } from "@/components/admin";

export default function Page() {
  return (
    <>
      <div className="admin-title">미션 관리</div>
      <div className="admin-sub">
        GitHub 저장소를 미션으로 등록해요. PR base URL은 카드 생성 시 PR 번호와 합쳐져요.
      </div>
      <MissionForm />
      <div className="sec-head admin-table-head">
        <div className="sec-title">등록된 미션</div>
      </div>
      <MissionTable />
    </>
  );
}
