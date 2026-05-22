import { adminAuthErrorResponse, getAdminAuthState } from "@/lib/admin/auth";
import { ok } from "@/lib/api/response";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const state = await getAdminAuthState();

    return ok({
      email: state.email,
      isAdmin: state.isAdmin
    });
  } catch (error) {
    return adminAuthErrorResponse(error);
  }
}
