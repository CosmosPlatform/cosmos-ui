import { ApiResult, sendRequestWithAuth } from "@/lib/api/cosmosServerClient";

export async function updateApplicationMonitoring(
  application: string,
): Promise<ApiResult<null>> {
  return sendRequestWithAuth<never, null>(
    "POST",
    `/monitoring/update/${application}`,
  );
}

// -----------------------------------------------------------------

export type GetApplicationInteractionsResponse = {
  mainApplication: string;
  applicationsInvolved: Record<string, ApplicationInformation>;
  dependencies: ApplicationDependency[];
};

type ApplicationInformation = {
  name: string;
  team: string;
};

type ApplicationDependency = {
  consumer: string;
  provider: string;
  reasons?: string[];
  endpoints: Endpoints;
};

type Endpoints = Record<string, EndpointMethods>;

type EndpointMethods = Record<string, EndpointDetails>;

type EndpointDetails = {
  reasons?: string[];
};

export async function getApplicationInteractions(
  application: string,
): Promise<ApiResult<GetApplicationInteractionsResponse>> {
  return sendRequestWithAuth<never, GetApplicationInteractionsResponse>(
    "GET",
    `/monitoring/interactions/${application}`,
  );
}

// -----------------------------------------------------------------

export type GetApplicationsInteractionsRequest = {
  teams?: string[];
  includeNeighbors?: boolean;
};

export type ApplicationsInvolved = Record<string, ApplicationInformation>;

export type ApplicationDependencies = ApplicationDependency[];

export type GetApplicationsInteractionsResponse = {
  applicationsInvolved: ApplicationsInvolved;
  dependencies: ApplicationDependencies;
};

export async function getApplicationsInteractions(
  request: GetApplicationsInteractionsRequest,
): Promise<ApiResult<GetApplicationsInteractionsResponse>> {
  const queryParams: Record<string, string> = {};

  if (request.teams && request.teams.length > 0) {
    queryParams.teams = request.teams.join(",");
  }

  if (request.includeNeighbors !== undefined) {
    queryParams.includeNeighbors = request.includeNeighbors.toString();
  }

  return sendRequestWithAuth<
    GetApplicationsInteractionsRequest,
    GetApplicationsInteractionsResponse
  >("GET", "/monitoring/interactions", null, queryParams);
}
