"use client";

import { FormRow } from "@/components/common";

export function MissionForm() {
  return (
    <div className="form-card">
      <FormRow label="미션명">
        <input className="form-input" placeholder="roomescape-member" />
      </FormRow>
      <div className="form-row form-two-cols">
        <div>
          <label className="form-label">owner</label>
          <input className="form-input mono" placeholder="woowacourse" />
        </div>
        <div>
          <label className="form-label">repo</label>
          <input className="form-input mono" placeholder="spring-roomescape-member" />
        </div>
      </div>
      <FormRow label="PR base URL">
        <input
          className="form-input mono"
          defaultValue="https://github.com/woowacourse/spring-roomescape-member/pull/"
        />
        <div className="form-hint">
          예: https://github.com/woowacourse/spring-roomescape-member/pull/
        </div>
      </FormRow>
      <button
        className="btn-primary"
        type="button"
        onClick={() => window.alert("미션이 등록되었어요 (데모)")}
      >
        미션 등록
      </button>
    </div>
  );
}
