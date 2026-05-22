"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { FormRow } from "@/components/common";

export function AdminResetPasswordForm({ code }: { code?: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    async function prepareRecoverySession() {
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          setMessage(error.message);
          setIsReady(false);
          return;
        }

        window.history.replaceState(null, "", "/admin/reset-password");
      }

      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        setMessage("재설정 링크가 만료됐거나 세션을 만들지 못했어요. 재설정 메일을 다시 요청해주세요.");
        setIsReady(false);
        return;
      }

      setIsReady(true);
    }

    prepareRecoverySession().catch((error: Error) => {
      setMessage(error.message);
      setIsReady(false);
    });
  }, [code]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password.length < 8) {
      setMessage("비밀번호는 8자 이상으로 설정해주세요.");
      return;
    }

    if (password !== passwordConfirm) {
      setMessage("비밀번호 확인이 일치하지 않아요.");
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.updateUser({
        password
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      setMessage("비밀번호를 변경했어요. 새 비밀번호로 로그인해주세요.");
      await supabase.auth.signOut();
      router.replace("/admin/login");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "비밀번호 변경에 실패했어요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="form-card admin-login-card" onSubmit={submit}>
      <FormRow label="새 비밀번호">
        <input
          className="form-input"
          type="password"
          autoComplete="new-password"
          disabled={!isReady}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </FormRow>
      <FormRow label="새 비밀번호 확인">
        <input
          className="form-input"
          type="password"
          autoComplete="new-password"
          disabled={!isReady}
          value={passwordConfirm}
          onChange={(event) => setPasswordConfirm(event.target.value)}
        />
      </FormRow>
      <button className="btn-primary" type="submit" disabled={!isReady || isSubmitting}>
        {isSubmitting ? "변경 중" : "비밀번호 변경"}
      </button>
      {message ? <p className="admin-help">{message}</p> : null}
    </form>
  );
}
