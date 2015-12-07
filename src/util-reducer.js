// successful fetches expose payload
export function fetchSuccess(payload) {
    return {
        loading: false,
        error: false,
        payload
    };
}

// failed fetches set error and disable loading
export function fetchFailure(payload) {
    return {
        loading: false,
        error: `${payload.name}: ${payload.message}`
    };
}

// pending fetches indicate loading and exposes the pending endpoint
export function fetchPending(payload) {
    return {
        loading: true,
        error: false,
        endpoint: payload.endpoint
    };
}
