import * as http from "http";

function getCurrentUrl (req: http.IncomingMessage) {
    let currentUrl = 'http://' + req.headers.host + req.url;

    if ((req.url)?.includes('index') || ((req.url)?.includes('gallery') && !((req.url)?.includes('gallery.html?') || (req.url)?.includes('gallery?')))){
        currentUrl = currentUrl + '.html';
    } 

    return currentUrl;
}

export {getCurrentUrl};