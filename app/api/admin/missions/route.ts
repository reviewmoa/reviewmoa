import { ZodError } from "zod";
import { adminAuthErrorResponse, requireAdmin } from "@/lib/admin/auth";
import { createAdminMission, createMissionSchema, listAdminMissions } from "@/lib/admin/missions";
import { conflict, created, ok } from "@/lib/api/response";
import { validationErrorResponse } from "@/lib/api/validation";

export const dynamic = "force-dynamic";

type PostgresError = {
  code?: string;
  message?: string;
};

export async function GET() {
  try {
    await requireAdmin();

    return ok(await listAdminMissions());
  } catch (error) {
    return adminAuthErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const input = createMissionSchema.parse(await request.json());

    return created(await createAdminMission(input));
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error);
    }

    if ((error as PostgresError).code === "23505") {
      return conflict("Mission slug already exists");
    }

    return adminAuthErrorResponse(error);
  }
}
