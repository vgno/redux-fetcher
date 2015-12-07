export function createDefaultBailout(storeNode, force) {
    return (store) => {
        if (store[storeNode]) {
            const cached = !!store[storeNode].payload && !force;
            return store[storeNode].loading || cached;
        }
        return false;
    };
}

export function createPendingType(prefix, url) {
    return {
        type: prefix + '_FETCH_PENDING',
        payload: () => {
            return {
                endpoint: url
            };
        }
    };
}

export function overrideOptions(action, options) {
    const result = {
        ...action
    };

    if (options.headers) {
        result.headers = options.headers;
    }

    if (options.credentials) {
         // omit, same-origin or include
        result.credentials = options.credentials;
    }

    if (options.method !== 'GET' && options.method !== 'HEAD') {
         // json encoded string
        result.body = options.body;
    }

    return result;
}
