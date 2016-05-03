// successful fetches expose payload
export function fetchSuccess(payload, meta) {
    return {
        loading: false,
        error: false,
        payload,
        meta
    };
}

// failed fetches set error and disable loading
export function fetchFailure(payload, meta) {
    return {
        loading: false,
        error: true,
        payload,
        meta
    };
}

// pending fetches indicate loading and exposes the pending endpoint
export function fetchPending(payload, meta, error = false) {
    return {
        loading: !error,
        error,
        payload,
        meta
    };
}
