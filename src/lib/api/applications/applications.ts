import { ApiResult, sendRequest } from "@/lib/api/cosmosServerClient";

export type Team = {
  name: string;
  description: string;
};

export type Application = {
  name: string;
  description: string;
  team?: Team;
};

type CreateApplicationRequest = {
  name: string;
  description: string;
  team: string;
};

type CreateApplicationResponse = {
  application: Application;
};

export async function createApplication(
  request: CreateApplicationRequest,
): Promise<ApiResult<CreateApplicationResponse>> {
  return sendRequest<CreateApplicationRequest, CreateApplicationResponse>(
    "POST",
    "/applications",
    request,
  );
}

// -----------------------------------------------------------------

export type GetApplicationsResponse = {
  applications: Array<Application>;
};

// If filter is "" then it returns all applications
export async function getApplicationsWithFilter(
  name: string,
): Promise<ApiResult<GetApplicationsResponse>> {
  return sendRequest<never, GetApplicationsResponse>(
    "GET",
    "/applications",
    null,
    { name },
  );
}

// -----------------------------------------------------------------

export async function getApplication(
  name: string,
): Promise<ApiResult<CreateApplicationResponse>> {
  return sendRequest<never, CreateApplicationResponse>(
    "GET",
    `/applications/${name}`,
  );
}
