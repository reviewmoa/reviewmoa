import { ZodError } from "zod";
import { adminAuthErrorResponse, requireAdmin } from "@/lib/admin/auth";
import { updateAdminMission, updateMissionSchema } from "@/lib/admin/missions";
import { notFound, ok } from "@/lib/api/response";
import { validationErrorResponse } from "@/lib/api/validation";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ missionId: string }> }
) {
  try {
    await requireAdmin();

    const { missionId } = await params;
    const input = updateMissionSchema.parse(await request.json());
    const mission = await updateAdminMission(missionId, input);

    if (!mission) {
      return notFound("Mission not found");
    }

    return ok(mission);
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error);
    }

    return adminAuthErrorResponse(error);
  }
}
