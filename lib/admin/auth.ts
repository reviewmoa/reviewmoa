import "server-only";

import type { User } from "@supabase/supabase-js";
import { forbidden, serverError, unauthorized } from "@/lib/api/response";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

export type AdminAuthState = {
  user: User;
  email: string;
  isAdmin: boolean;
};

export class AdminAuthError extends Error {
  constructor(
    public readonly status: 401 | 403,
    message: string
  ) {
    super(message);
  }
}

export async function getAdminAuthState(): Promise<AdminAuthState> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user?.email) {
    throw new AdminAuthError(401, "Authentication is required");
  }

  const service = createSupabaseServiceClient();
  const { data, error: adminError } = await service
    .from("admin_users")
    .select("email")
    .eq("normalized_email", user.email.toLowerCase())
    .maybeSingle();

  if (adminError) {
    throw adminError;
  }

  return {
    user,
    email: user.email,
    isAdmin: Boolean(data)
  };
}

export async function requireAdmin() {
  const state = await getAdminAuthState();

  if (!state.isAdmin) {
    throw new AdminAuthError(403, "Admin permission is required");
  }

  return state;
}

export function adminAuthErrorResponse(error: unknown) {
  if (error instanceof AdminAuthError) {
    return error.status === 401 ? unauthorized(error.message) : forbidden(error.message);
  }

  return serverError(error);
}
