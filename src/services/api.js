/**
 * Comfort Aircon - Reusable Backend REST API Service
 * Base URL configured via NEXT_PUBLIC_API_BASE_URL
 */

function getApiBaseUrl() {
  let raw = (
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'https://dev.api.comfortair.co.in/api/v1'
  )
    .trim()
    .replace(/\/+$/, '');

  // If a frontend domain was mistakenly provided (without api. subdomain)
  if (!raw.includes('.api.') && !raw.includes('localhost') && !raw.includes('127.0.0.1')) {
    if (raw.includes('dev.comfortair.co.in')) {
      raw = raw.replace('dev.comfortair.co.in', 'dev.api.comfortair.co.in');
    } else if (raw.includes('staging.comfortair.co.in')) {
      raw = raw.replace('staging.comfortair.co.in', 'staging.api.comfortair.co.in');
    } else if (raw.includes('comfortair.co.in')) {
      raw = raw.replace('comfortair.co.in', 'api.comfortair.co.in');
    }
  }

  // Automatically append /api/v1 if only root domain was provided
  if (!raw.endsWith('/api/v1')) {
    raw = `${raw}/api/v1`;
  }
  return raw;
}

class ApiError extends Error {
  constructor(message, status = 500, errors = null, raw = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
    this.raw = raw;
  }
}

/**
 * Core fetch wrapper with base URL, default headers, JSON parsing & error handling
 */
async function request(endpoint, options = {}) {
  const baseUrl = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${baseUrl}${cleanEndpoint}`;

  const defaultHeaders = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  let response;
  try {
    response = await fetch(url, config);
  } catch (netErr) {
    throw new ApiError(
      netErr?.message || 'Network connection error. Please check your internet connection.',
      0,
      null,
      netErr
    );
  }

  let data = null;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    try {
      const text = await response.text();
      data = text ? { message: text } : null;
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const message =
      data?.message ||
      (data?.errors && typeof data.errors === 'string'
        ? data.errors
        : `Request failed with status ${response.status}`);
    const errors = data?.errors || null;
    throw new ApiError(message, response.status, errors, data);
  }

  return data;
}

/**
 * 1. GET /products -> List of products
 */
export async function getProducts() {
  return request('/products', { method: 'GET' });
}

/**
 * 2. GET /gallery -> List of gallery items & categories
 */
export async function getGallery() {
  return request('/gallery', { method: 'GET' });
}

/**
 * 3. POST /enquiry -> Submit customer enquiry
 * Payload:
 * {
 *   name: string,
 *   mobile_number: string,
 *   email?: string,
 *   service_required: string,
 *   product_interested_in?: string,
 *   location: string,
 *   message?: string
 * }
 */
export async function submitEnquiry(payload) {
  return request('/enquiry', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * 4. GET /contact -> Company contact details
 */
export async function getContact() {
  return request('/contact', { method: 'GET' });
}

export { ApiError };
