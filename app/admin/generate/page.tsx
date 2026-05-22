"use client";

import { useRouter } from "next/navigation";
import { FormRow } from "@/components/common";
import { ArrowIcon } from "@/public/icons";

export default function Page() {
  const router = useRouter();

  return (
    <>
      <div className="admin-title">규칙카드 생성</div>
      <div className="admin-sub">
        미션과 PR 번호 범위를 지정하면 서버가 리뷰를 수집하고 AI가 카드를 만들어요. 요청 후에는 작업 관리에서
        진행 상황을 확인해요.
      </div>
      <div className="form-card">
        <FormRow label="미션 선택">
          <select className="form-input" defaultValue="roomescape-member">
            <option>roomescape-member</option>
            <option>shopping-order</option>
            <option>coupon</option>
          </select>
        </FormRow>
        <FormRow label="PR 번호 범위">
          <div className="form-range">
            <input className="form-input mono" placeholder="시작" defaultValue="400" />
            <span className="dash">-</span>
            <input className="form-input mono" placeholder="끝" defaultValue="470" />
          </div>
          <div className="form-hint">71개 PR이 처리 대상이에요</div>
        </FormRow>
        <button
          className="btn-primary"
          type="button"
          onClick={() => {
            window.alert("생성 요청을 보냈어요. 작업 관리에서 확인하세요");
            window.setTimeout(() => router.push("/admin/jobs"), 700);
          }}
        >
          <ArrowIcon />
          생성 요청 보내기
        </button>
        <p className="admin-help">
          요청을 보내면 작업 관리 화면으로 이동해요. 생성은 백그라운드에서 진행되고, 완료되면 상태가 업데이트돼요.
        </p>
      </div>
    </>
  );
}
