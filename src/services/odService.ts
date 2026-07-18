// ============================================================
//  src/services/odService.ts
//  OD Request CRUD service.
//
//  HOW TO SWITCH TO REAL BACKEND:
//    1. Set VITE_APP_MODE=live in .env
//    2. Uncomment the apiClient lines and remove the throw lines
//    3. The same ODRequest type is used throughout
// ============================================================

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { IS_MOCK } from '../config';
import type { ODRequest } from '../context/AppContext';

// ── Types ────────────────────────────────────────────────────
export type CreateODPayload = Omit<
  ODRequest,
  'id' | 'mentorStatus' | 'hodStatus' | 'finalStatus' | 'appliedDate'
>;

export interface UpdateStatusPayload {
  status: 'APPROVED' | 'REJECTED';
  reason?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

// ── API stubs (uncomment live blocks when backend is ready) ──

/**
 * Fetch all OD requests visible to the logged-in user.
 * In mock mode, AppContext manages state locally.
 */
export async function fetchRequests(): Promise<ODRequest[]> {
  if (IS_MOCK) return [];

  // LIVE — uncomment:
  // const { data } = await apiClient.get<PaginatedResponse<ODRequest>>('/od-requests');
  // return data.data;
  throw new Error('Live mode: uncomment apiClient call in odService.fetchRequests');
}

/**
 * Submit a new OD request.
 * In mock mode use AppContext.addRequest() directly.
 */
export async function createRequest(_payload: CreateODPayload): Promise<ODRequest> {
  if (IS_MOCK) throw new Error('Mock mode: use AppContext.addRequest()');

  // LIVE — uncomment:
  // const { data } = await apiClient.post<ODRequest>('/od-requests', _payload);
  // return data;
  throw new Error('Live mode: uncomment apiClient call in odService.createRequest');
}

/**
 * Mentor approves or rejects a request.
 */
export async function mentorUpdateStatus(
  _id: string,
  _payload: UpdateStatusPayload
): Promise<ODRequest> {
  if (IS_MOCK) throw new Error('Mock mode: use AppContext.updateMentorStatus()');

  // LIVE — uncomment:
  // const { data } = await apiClient.patch<ODRequest>(`/od-requests/${_id}/mentor-status`, _payload);
  // return data;
  throw new Error('Live mode: uncomment apiClient call in odService.mentorUpdateStatus');
}

/**
 * HOD approves or rejects a request.
 */
export async function hodUpdateStatus(
  _id: string,
  _payload: UpdateStatusPayload
): Promise<ODRequest> {
  if (IS_MOCK) throw new Error('Mock mode: use AppContext.updateHODStatus()');

  // LIVE — uncomment:
  // const { data } = await apiClient.patch<ODRequest>(`/od-requests/${_id}/hod-status`, _payload);
  // return data;
  throw new Error('Live mode: uncomment apiClient call in odService.hodUpdateStatus');
}

/**
 * HOD bulk approve.
 */
export async function bulkApprove(_ids: string[]): Promise<void> {
  if (IS_MOCK) throw new Error('Mock mode: use AppContext.bulkHODApprove()');

  // LIVE — uncomment:
  // await apiClient.post('/od-requests/bulk-approve', { ids: _ids });
  throw new Error('Live mode: uncomment apiClient call in odService.bulkApprove');
}

/**
 * HOD bulk reject.
 */
export async function bulkReject(_ids: string[], _reason: string): Promise<void> {
  if (IS_MOCK) throw new Error('Mock mode: use AppContext.bulkHODReject()');

  // LIVE — uncomment:
  // await apiClient.post('/od-requests/bulk-reject', { ids: _ids, reason: _reason });
  throw new Error('Live mode: uncomment apiClient call in odService.bulkReject');
}

/**
 * Fetch analytics summary. Computed locally in mock mode.
 */
export async function fetchAnalytics(): Promise<null> {
  if (IS_MOCK) return null;

  // LIVE — uncomment:
  // const { data } = await apiClient.get('/analytics/summary');
  // return data;
  throw new Error('Live mode: uncomment apiClient call in odService.fetchAnalytics');
}
