"use client";

import { useRouter } from "next/navigation";
import { FormRow } from "@/components/common";
import { ArrowIcon } from "@/public/icons";

export function GenerateForm() {
  const router = useRouter();

  return (
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
  );
}
