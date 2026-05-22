import { ok, serverError } from "@/lib/api/response";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("missions").select("id").limit(1);

    if (error) {
      throw error;
    }

    return ok({
      ok: true
    });
  } catch (error) {
    return serverError(error);
  }
}
