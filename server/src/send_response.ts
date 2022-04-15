import { ResponseObject } from "./interfaces";
import * as http from "http";
import { ObjectId } from "mongodb";
import * as pageOperations from './page_operations';

export async function sendResponse (resObj: ResponseObject, reqUrl: string, res: http.ServerResponse, id: ObjectId) {
    
    pageOperations.getLimit(reqUrl);
    await pageOperations.getTotal(reqUrl, resObj, id);
    pageOperations.getCurrentPage(resObj, reqUrl);

    try {
        if (sendNotFoundStatus(resObj, res)) {
            await pageOperations.getRequestedImages(reqUrl, resObj, id);
            res.statusCode = 200;
            res.end(JSON.stringify(resObj));
        }
    } catch (err) {
        return err;
    }
}

function sendNotFoundStatus (resObj: ResponseObject, res: http.ServerResponse) {

    if (!pageOperations.checkPage(resObj)) {
        res.statusCode = 404;
        res.end();

        return false;
    } 

    return resObj;
}