import https from "https";

export const getRequest = (url) => {
    const promise = new Promise((resolve, reject) => {
        https.get(url, res => {
            let data = '';
            res.on('data', chunk => {
                data += chunk;
            });
            res.on('end', () => {
                resolve(JSON.parse(data));
            });
        }).on('error', err => {
            reject(err);
        });
    });
    return promise;
}
