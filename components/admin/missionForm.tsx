"use client";

import { useState } from "react";
import { createAdminMission } from "@/lib/reviewmoa/clientApi";
import { FormRow } from "@/components/common";

export function MissionForm() {
  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [githubOwner, setGithubOwner] = useState("");
  const [githubRepo, setGithubRepo] = useState("");
  const [prBaseUrl, setPrBaseUrl] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitMission = async () => {
    setIsSubmitting(true);
    setMessage(null);

    try {
      await createAdminMission({
        slug,
        name,
        githubOwner,
        githubRepo,
        prBaseUrl,
        isActive: true
      });
      setMessage("미션이 등록됐어요.");
      setSlug("");
      setName("");
      setGithubOwner("");
      setGithubRepo("");
      setPrBaseUrl("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "미션 등록에 실패했어요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-card">
      <FormRow label="미션명">
        <input
          className="form-input"
          placeholder="roomescape-member"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </FormRow>
      <FormRow label="slug">
        <input
          className="form-input mono"
          placeholder="roomescape-member"
          value={slug}
          onChange={(event) => setSlug(event.target.value)}
        />
      </FormRow>
      <div className="form-row form-two-cols">
        <div>
          <label className="form-label">owner</label>
          <input
            className="form-input mono"
            placeholder="woowacourse"
            value={githubOwner}
            onChange={(event) => setGithubOwner(event.target.value)}
          />
        </div>
        <div>
          <label className="form-label">repo</label>
          <input
            className="form-input mono"
            placeholder="spring-roomescape-member"
            value={githubRepo}
            onChange={(event) => setGithubRepo(event.target.value)}
          />
        </div>
      </div>
      <FormRow label="PR base URL">
        <input
          className="form-input mono"
          placeholder="https://github.com/woowacourse/spring-roomescape-member/pull/"
          value={prBaseUrl}
          onChange={(event) => setPrBaseUrl(event.target.value)}
        />
        <div className="form-hint">
          예: https://github.com/woowacourse/spring-roomescape-member/pull/
        </div>
      </FormRow>
      <button
        className="btn-primary"
        type="button"
        disabled={isSubmitting}
        onClick={submitMission}
      >
        {isSubmitting ? "등록 중" : "미션 등록"}
      </button>
      {message ? <p className="admin-help">{message}</p> : null}
    </div>
  );
}
