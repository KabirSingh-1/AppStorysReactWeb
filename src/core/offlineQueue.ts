import { WebStorage } from '../adapters/web/storage';
import useAppStorysStore, { getAccessToken } from './store';
import verifyAccount from './verifyAccount';

const OFFLINE_QUEUE_KEY = "appstorys_offline_queue";

export interface QueuedRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: any;
  retryCount?: number;
  lastAttempt?: number;
  authRetried?: boolean;
}

async function getQueue(): Promise<QueuedRequest[]> {
  const existing = await WebStorage.getItem(OFFLINE_QUEUE_KEY);
  return existing ? JSON.parse(existing) : [];
}

async function saveQueue(queue: QueuedRequest[]) {
  await WebStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
}

function getBackoffDelay(retryCount: number): number {
  // Exponential backoff: 30s, 1min, 2min (max 2min)
  return Math.min(30000 * Math.pow(2, retryCount), 120000);
}

function shouldRetryRequest(request: QueuedRequest): boolean {
  const maxRetries = 3;
  const retryCount = request.retryCount || 0;
  const lastAttempt = request.lastAttempt || 0;
  const backoffDelay = getBackoffDelay(retryCount);

  return retryCount < maxRetries && Date.now() - lastAttempt >= backoffDelay;
}

async function validateCredentials(): Promise<boolean> {
  const state = useAppStorysStore.getState();
  if (!state.accountId || !state.appId) return false;
  
  return await verifyAccount(
    state.accountId,
    state.appId,
    state.userId
  );
}

async function handleAuthError(
  request: QueuedRequest,
  onSuccess: (request: QueuedRequest) => void
) {
  const credentialsValid = await validateCredentials();

  if (credentialsValid) {
    const newToken = await WebStorage.getItem('access_token');
    if (newToken) {
      request.headers = {
        ...request.headers,
        Authorization: `Bearer ${newToken}`,
      };
    }
    request.authRetried = true;
    request.lastAttempt = Date.now();
    onSuccess(request);
  }
}

async function handleCriticalError(
  request: QueuedRequest, 
  onSuccess: (request: QueuedRequest) => void
) {
  const retryCount = (request.retryCount || 0) + 1;

  if (retryCount <= 3) {
    request.retryCount = retryCount;
    request.lastAttempt = Date.now();
    onSuccess(request);
  }
}

async function addToQueue(request: QueuedRequest) {
  const queue = await getQueue();
  queue.push(request);
  await saveQueue(queue);
}

export async function flushQueue() {
  const queue = await getQueue();
  if (queue.length === 0) return;

  const newQueue: QueuedRequest[] = [];

  for (const req of queue) {
    if (!shouldRetryRequest(req)) {
      newQueue.push(req);
      continue;
    }

    try {
      const res = await fetch(req.url, {
        method: req.method,
        headers: req.headers,
        body: JSON.stringify(req.body),
      });

      if (res.ok) continue;

      if (res.status === 401 || res.status === 403) {
        if (!req.authRetried) {
          await handleAuthError(req, (r) => newQueue.push(r));
        }
      } else if (res.status >= 500) {
        await handleCriticalError(req, (r) => newQueue.push(r));
      }
    } catch (err) {
      await handleCriticalError(req, (r) => newQueue.push(r));
    }
  }

  await saveQueue(newQueue);
}

export async function sendOrQueue(request: QueuedRequest): Promise<Response | void> {
  if (!navigator.onLine) {
    await addToQueue(request);
    return;
  }

  // Auto-flush existing queue
  await flushQueue();

  try {
    const res = await fetch(request.url, {
      method: request.method,
      headers: request.headers,
      body: JSON.stringify(request.body),
    });

    if (res.ok) return res;

    if (res.status === 401 || res.status === 403) {
      await handleAuthError(request, addToQueue);
    } else if (res.status >= 500) {
      await handleCriticalError(request, addToQueue);
    }

    return res;
  } catch (err) {
    await handleCriticalError(request, addToQueue);
    return;
  }
}
