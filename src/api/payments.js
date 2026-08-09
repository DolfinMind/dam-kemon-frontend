// Payment operations stay in their own lazy-loaded client so public visitors do
// not download an inventory of privileged payment endpoints. The server remains
// the authority for every operation and never returns secrets or full keys.
import api from './api';

const BASE = '/admin/payments';
const modeParams = (testMode) => ({ testMode });

export const getPaymentOverview = (appId, testMode) =>
  api.get(`${BASE}/overview`, { params: { appId, ...modeParams(testMode) } });
export const getPaymentProviderStatus = (testMode) =>
  api.get(`${BASE}/provider/status`, { params: modeParams(testMode) });
export const listPaymentApplications = () => api.get(`${BASE}/applications`);
export const listPaymentProducts = (appId) => api.get(`${BASE}/applications/${encodeURIComponent(appId)}/products`);
export const listPaymentRecords = (resource, appId, testMode, limit = 50) =>
  api.get(`${BASE}/${resource}`, { params: { appId, ...modeParams(testMode), limit } });
export const listPaymentProviderCatalog = (appId, storeId, testMode) =>
  api.get(`${BASE}/provider/catalog`, { params: { appId, storeId, ...modeParams(testMode) } });
export const listPaymentWebhooks = (appId, storeId, testMode) =>
  api.get(`${BASE}/provider/webhooks`, { params: { appId, storeId, ...modeParams(testMode) } });
export const ensurePaymentWebhook = (appId, storeId, testMode, confirmUrl) =>
  api.post(`${BASE}/provider/webhooks/ensure`, { appId, storeId, testMode, confirmUrl });

// These mutation endpoints are deliberately narrow. The page requires a typed
// confirmation before calling them, and their server-side audit/revalidation is
// still mandatory.
export const disablePaymentLicense = (providerLicenseId, confirmLicenseId) =>
  api.patch(`${BASE}/provider/licenses/${encodeURIComponent(providerLicenseId)}`, { activationLimit: null, expiresAt: null, disabled: true, confirmLicenseId });
export const refundPaymentOrder = (providerOrderId, confirmOrderId) =>
  api.post(`${BASE}/provider/orders/${encodeURIComponent(providerOrderId)}/refund`, { amount: null, confirmOrderId });
