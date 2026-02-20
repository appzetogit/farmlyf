const normalizeUrl = (value) => (value || '').toString().trim();

const ensureApiPath = (value) => {
    if (!value) return '';
    try {
        const url = new URL(value);
        if (!url.pathname || url.pathname === '/') {
            url.pathname = '/api';
        }
        return url.toString().replace(/\/$/, '');
    } catch {
        return value.replace(/\/+$/, '');
    }
};

const resolveApiBase = () => {
    const raw = normalizeUrl(import.meta.env.VITE_API_URL);
    const base = ensureApiPath(raw);

    if (typeof window !== 'undefined' && base) {
        const origin = window.location.origin.replace(/\/+$/, '');
        const normalizedBase = base.replace(/\/+$/, '');
        if (normalizedBase.startsWith(origin)) {
            console.error(
                'API base URL points to the frontend origin. Set VITE_API_URL to your backend domain (e.g. https://api.example.com/api).'
            );
        }
    }

    return base.replace(/\/+$/, '');
};

export const API_BASE_URL = resolveApiBase();
