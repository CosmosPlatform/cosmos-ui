import { ApiResult, sendRequestWithAuth } from "@/lib/api/cosmosServerClient";
import { Token } from "@/lib/api/token/token";

export type Team = {
  name: string;
  description: string;
};

export type Application = {
  name: string;
  description: string;
  team?: Team;
  gitInformation?: GitInformation;
  monitoringInformation?: MonitoringInformation;
  token?: Token;
};

type CreateApplicationRequest = {
  name: string;
  description: string;
  team: string;
  gitInformation?: GitInformation;
  monitoringInformation?: MonitoringInformation;
  tokenName: string;
};

type GitInformation = {
  provider: string;
  repositoryOwner: string;
  repositoryName: string;
  repositoryBranch: string;
};

type MonitoringInformation = {
  hasOpenAPI: boolean;
  openAPIPath?: string;
  hasOpenClient: boolean;
  openClientPath?: string;
};

type CreateApplicationResponse = {
  application: Application;
};

export async function createApplication(
  request: CreateApplicationRequest,
): Promise<ApiResult<CreateApplicationResponse>> {
  return sendRequestWithAuth<
    CreateApplicationRequest,
    CreateApplicationResponse
  >("POST", "/applications", request);
}

// -----------------------------------------------------------------

export type GetApplicationsResponse = {
  applications: Array<Application>;
};

// If filter is "" then it returns all applications
export async function getApplicationsWithFilter(
  name: string,
): Promise<ApiResult<GetApplicationsResponse>> {
  return sendRequestWithAuth<never, GetApplicationsResponse>(
    "GET",
    "/applications",
    null,
    { name },
  );
}

// -----------------------------------------------------------------

export type GetApplicationResponse = {
  application: Application;
};

export async function getApplication(
  name: string,
): Promise<ApiResult<GetApplicationResponse>> {
  return sendRequestWithAuth<never, GetApplicationResponse>(
    "GET",
    `/applications/${name}`,
  );
}

// -----------------------------------------------------------------

export async function deleteApplication(
  name: string,
): Promise<ApiResult<null>> {
  return sendRequestWithAuth<never, null>("DELETE", `/applications/${name}`);
}

// -----------------------------------------------------------------

export type GetApplicationsByTeamResponse = {
  applications: Array<Application>;
};

export async function getApplicationsByTeam(
  teamName: string,
): Promise<ApiResult<GetApplicationsByTeamResponse>> {
  return sendRequestWithAuth<never, GetApplicationsByTeamResponse>(
    "GET",
    `/applications/team/${teamName}`,
  );
}

// -----------------------------------------------------------------

export type UpdateApplicationRequest = {
  name: string;
  description: string;
  team: string;
  gitInformation?: GitInformation;
  monitoringInformation?: MonitoringInformation;
};

export type UpdateApplicationResponse = {
  application: Application;
};

export async function updateApplication(
  name: string,
  request: UpdateApplicationRequest,
): Promise<ApiResult<UpdateApplicationResponse>> {
  return sendRequestWithAuth<
    UpdateApplicationRequest,
    UpdateApplicationResponse
  >("PUT", `/applications/${name}`, request);
}
