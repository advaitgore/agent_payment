const ORG_KEY = 'agentpay_org_id';
const ORG_NAME_KEY = 'agentpay_org_name';
const AGENT_KEY = 'agentpay_agent_id';
const MANDATE_KEY = 'agentpay_mandate_id';
const API_BASE_URL_KEY = 'agentpay_api_base_url';

export function getStoredOrgId(): string | null {
  return localStorage.getItem(ORG_KEY);
}

export function setStoredOrgId(value: string) {
  localStorage.setItem(ORG_KEY, value);
}

export function getStoredOrgName(): string | null {
  return localStorage.getItem(ORG_NAME_KEY);
}

export function setStoredOrgName(value: string) {
  localStorage.setItem(ORG_NAME_KEY, value);
}

export function getStoredAgentId(): string | null {
  return localStorage.getItem(AGENT_KEY);
}

export function setStoredAgentId(value: string) {
  localStorage.setItem(AGENT_KEY, value);
}

export function getStoredMandateId(): string | null {
  return localStorage.getItem(MANDATE_KEY);
}

export function setStoredMandateId(value: string) {
  localStorage.setItem(MANDATE_KEY, value);
}

export function getStoredApiBaseUrl(): string | null {
  return localStorage.getItem(API_BASE_URL_KEY);
}

export function setStoredApiBaseUrl(value: string) {
  localStorage.setItem(API_BASE_URL_KEY, value);
}

export function clearStoredSessionData() {
  localStorage.removeItem(ORG_KEY);
  localStorage.removeItem(ORG_NAME_KEY);
  localStorage.removeItem(AGENT_KEY);
  localStorage.removeItem(MANDATE_KEY);
}
