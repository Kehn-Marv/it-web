// API helper module for Charterhouse Lagos IT Device Inventory
// Centralizes all fetch calls with credentials and error handling

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000/api';

interface FetchOptions extends RequestInit {
  credentials: 'include';
}

// Helper to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 401) {
    // Redirect to login on unauthorized
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  // Handle empty responses (like DELETE)
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    return {} as T;
  }

  return response.json();
}

// Generic fetch wrapper
async function apiFetch<T>(
  endpoint: string,
  options: Partial<FetchOptions> = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const config: FetchOptions = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);
  return handleResponse<T>(response);
}

// ============================================
// AUTH API
// ============================================

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  user?: {
    id: number;
    username: string;
  };
}

export const authApi = {
  login: (credentials: LoginCredentials) =>
    apiFetch<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  logout: () =>
    apiFetch<AuthResponse>('/auth/logout', {
      method: 'POST',
    }),

  me: () =>
    apiFetch<{ user: { id: number; username: string } }>('/auth/me'),
};

// ============================================
// DEVICES API
// ============================================

export interface Device {
  id: number;
  device_model: string;
  serial_number: string;
  owner_name: string;
  date_enrolled: string;
  next_maintenance: string;
  location: string;
  category: string;
  color_tag: string;
  workbook: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DeviceInput {
  device_model: string;
  serial_number: string;
  owner_name: string;
  date_enrolled: string;
  next_maintenance: string;
  location: string;
  category: string;
  color_tag: string;
  workbook: string;
  notes?: string;
}

export interface DevicesListResponse {
  devices: Device[];
  total: number;
  limit: number;
  offset: number;
}

export interface DevicesQueryParams {
  q?: string;
  workbook?: string;
  location?: string;
  category?: string;
  limit?: number;
  offset?: number;
}

export const devicesApi = {
  list: (params?: DevicesQueryParams) => {
    const queryString = params
      ? '?' + new URLSearchParams(
          Object.entries(params)
            .filter(([_, v]) => v !== undefined && v !== '')
            .map(([k, v]) => [k, String(v)])
        ).toString()
      : '';
    return apiFetch<DevicesListResponse>(`/devices${queryString}`);
  },

  get: (id: number) =>
    apiFetch<Device>(`/devices/${id}`),

  create: (device: DeviceInput) =>
    apiFetch<Device>('/devices', {
      method: 'POST',
      body: JSON.stringify(device),
    }),

  update: (id: number, device: Partial<DeviceInput>) =>
    apiFetch<Device>(`/devices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(device),
    }),

  delete: (id: number) =>
    apiFetch<{ message: string }>(`/devices/${id}`, {
      method: 'DELETE',
    }),

  import: async (file: File): Promise<{ message: string; imported: number }> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE}/devices/import`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    return handleResponse(response);
  },

  export: async (): Promise<Blob> => {
    const response = await fetch(`${API_BASE}/devices/export`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Export failed');
    }

    return response.blob();
  },
};

// ============================================
// WORKBOOKS API
// ============================================

export interface Workbook {
  id: number;
  name: string;
  created_at?: string;
}

export interface WorkbookInput {
  name: string;
}

export const workbooksApi = {
  list: () =>
    apiFetch<{ workbooks: Workbook[] }>('/workbooks'),

  create: (workbook: WorkbookInput) =>
    apiFetch<Workbook>('/workbooks', {
      method: 'POST',
      body: JSON.stringify(workbook),
    }),

  delete: (id: number) =>
    apiFetch<{ message: string }>(`/workbooks/${id}`, {
      method: 'DELETE',
    }),
};
