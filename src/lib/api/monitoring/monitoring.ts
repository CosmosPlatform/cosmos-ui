import { ApiResult, sendRequestWithAuth } from "@/lib/api/cosmosServerClient";
import { Application } from "../applications/applications";

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

export type ApplicationInformation = {
  name: string;
  team: string;
};

export type ApplicationDependency = {
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

// -----------------------------------------------------------------

type GetApplicationOpenAPISpecificationResponse = {
  applicationName: string;
  openAPISpec: string;
};

export async function getApplicationOpenAPISpecification(
  application: string,
): Promise<ApiResult<GetApplicationOpenAPISpecificationResponse>> {
  return sendRequestWithAuth<never, GetApplicationOpenAPISpecificationResponse>(
    "GET",
    `/monitoring/openapi/${application}`,
  );
}

// -----------------------------------------------------------------

export type GetCompleteApplicationMonitoringResponse = {
  application: Application;
  openAPISpec?: string;
  dependencies: ApplicationDependency[];
  consumedEndpoints: ConsumedEndpoints;
};

export type ConsumedEndpoints = Record<string, ConsumedEndpointMethods>;

export type ConsumedEndpointMethods = Record<string, ConsumedEndpointDetails>;

export type ConsumedEndpointDetails = {
  consumers: string[];
};

export async function getCompleteApplicationMonitoring(
  application: string,
): Promise<ApiResult<GetCompleteApplicationMonitoringResponse>> {
  return sendRequestWithAuth<never, GetCompleteApplicationMonitoringResponse>(
    "GET",
    `/monitoring/complete/${application}`,
  );
}

// -----------------------------------------------------------------

export type GetSentinelSettingsResponse = {
  interval: number;
  enabled: boolean;
};

export async function getSentinelSettings(): Promise<
  ApiResult<GetSentinelSettingsResponse>
> {
  return sendRequestWithAuth<never, GetSentinelSettingsResponse>(
    "GET",
    `/monitoring/sentinel/settings`,
  );
}

// -----------------------------------------------------------------

export type UpdateSentinelSettingsRequest = {
  interval?: number;
  enabled?: boolean;
};

export async function updateSentinelSettings(
  settings: UpdateSentinelSettingsRequest,
): Promise<ApiResult<null>> {
  return sendRequestWithAuth<UpdateSentinelSettingsRequest, null>(
    "PUT",
    `/monitoring/sentinel/settings`,
    settings,
  );
}
