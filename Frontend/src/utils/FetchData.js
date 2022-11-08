export function fetchData(url, type, params = "", body = []) {
    if (params.trim() != "") {
        url += "?" + params;
    }

    const data = {
        method: type,
        cache: 'no-cache',
        headers: {
            'Content-Type': 'application/json'
        }
    }

    if (type.toLowerCase() == "post") {
        data.body = JSON.stringify(body);
    }

    return fetch(url, data).then(result => {
        return result.json();
    }).catch(err => {
        return {
            success: false,
            message: "Something went wrong.. Please, check the fetching function!",
            error: err
        };
    });
};