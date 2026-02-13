const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const getApiUrl = (endpoint) => {
    // Ensure endpoint starts with /
    const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    return `${API_BASE_URL}${path}`;
};
