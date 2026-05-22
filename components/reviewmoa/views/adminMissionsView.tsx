import { FormRow } from "../common";

export function AdminMissionsView({ showToast }: { showToast: (message: string) => void }) {
  return (
    <>
      <div className="admin-title">미션 관리</div>
      <div className="admin-sub">
        GitHub 저장소를 미션으로 등록해요. PR base URL은 카드 생성 시 PR 번호와
        합쳐져요.
      </div>
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
          <div className="form-hint">예: https://github.com/woowacourse/spring-roomescape-member/pull/</div>
        </FormRow>
        <button className="btn-primary" type="button" onClick={() => showToast("미션이 등록되었어요 (데모)")}>
          미션 등록
        </button>
      </div>
      <div className="sec-head admin-table-head">
        <div className="sec-title">등록된 미션</div>
      </div>
      <div className="job-table">
        <div className="job-row job-head">
          <div>미션명</div>
          <div>owner</div>
          <div>repo</div>
          <div>카드</div>
          <div>상태</div>
        </div>
        {[
          ["roomescape-member", "woowacourse", "spring-roomescape...", "1,204"],
          ["shopping-order", "woowacourse", "spring-shopping...", "982"],
          ["coupon", "woowacourse", "java-coupon", "661"]
        ].map(([name, owner, repo, count]) => (
          <div key={name} className="job-row">
            <div className="job-mission">{name}</div>
            <div className="job-range">{owner}</div>
            <div className="job-range">{repo}</div>
            <div className="job-range">{count}</div>
            <div>
              <span className="status-badge status-completed">
                <span className="status-dot" />
                활성
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
