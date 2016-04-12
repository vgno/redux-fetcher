export function createDefaultBailout(id, force) {
    return (state) => {
        if (state[id]) {
            const cached = !!state[id.toLowerCase()].payload && !force;
            return state[id].loading || cached;
        }
        return false;
    };
}

export function createSuccessType(prefix, url) {
    return {
        type: prefix + '_FETCH_SUCCESS',
        meta: (action, state, res) => {
            return {
                endpoint: url,
                response: {
                    status: res.status,
                    type: res.type
                }
            };
        }
    };
}

export function createPendingType(prefix, url) {
    return {
        type: prefix + '_FETCH_PENDING',
        meta: () => {
            return {
                endpoint: url
            };
        }
    };
}

export function createFailureType(prefix, url) {
    return {
        type: prefix + '_FETCH_FAILURE',
        meta: (action, state, res) => {
            if (res) {
                return {
                    endpoint: url,
                    response: {
                        status: res.status,
                        type: res.type
                    }
                };
            }
            return {
                endpoint: url
            };
        }
    };
}

export function extendAction(action, options) {
    const newAction = {
        ...action
    };

    if (options.headers) {
        newAction.headers = options.headers;
    }

    if (options.credentials) {
         // omit, same-origin or include
        newAction.credentials = options.credentials;
    }

    if (options.method !== 'GET' && options.method !== 'HEAD') {
         // json encoded string
        newAction.body = options.body;
    }

    return newAction;
}
