"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { FormRow } from "@/components/common";

export function AdminLoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingRecovery, setIsSendingRecovery] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      const response = await fetch("/api/admin/me", {
        credentials: "same-origin"
      });

      if (!response.ok) {
        await supabase.auth.signOut();
        setMessage(response.status === 403 ? "관리자 권한이 없는 계정이에요." : "관리자 인증에 실패했어요.");
        return;
      }

      router.replace(next);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "로그인에 실패했어요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const sendRecoveryEmail = async () => {
    if (!email) {
      setMessage("비밀번호를 재설정할 이메일을 먼저 입력해주세요.");
      return;
    }

    setIsSendingRecovery(true);
    setMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin/reset-password`
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      setMessage("비밀번호 재설정 메일을 보냈어요. 메일의 링크로 새 비밀번호를 설정해주세요.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "재설정 메일 발송에 실패했어요.");
    } finally {
      setIsSendingRecovery(false);
    }
  };

  return (
    <form className="form-card admin-login-card" onSubmit={submit}>
      <FormRow label="이메일">
        <input
          className="form-input"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </FormRow>
      <FormRow label="비밀번호">
        <input
          className="form-input"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </FormRow>
      <button className="btn-primary" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "로그인 중" : "로그인"}
      </button>
      <button
        className="admin-text-btn"
        type="button"
        disabled={isSendingRecovery}
        onClick={sendRecoveryEmail}
      >
        {isSendingRecovery ? "재설정 메일 발송 중" : "비밀번호 재설정 메일 받기"}
      </button>
      {message ? <p className="admin-help">{message}</p> : null}
    </form>
  );
}
