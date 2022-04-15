import * as fs from "fs";
import * as url from "url";
import * as config from "./config"
import { Image } from "./models/image";
import { ImageInterface } from "./interfaces";
import { ResponseObject } from "./interfaces"
import { ObjectId } from "mongodb";

const path = config.IMAGES_PATH;
let picOnPage: number;

function getLimit(reqURL: string) { 
    picOnPage = parseInt(url.parse(reqURL, true).query.limit as string);
}

async function getArrayLength (id: ObjectId, reqUrl: string) { 
    const filter = url.parse(reqUrl, true).query.filter as string;
    const findFilter = (filter === 'true') ? {'owner': id} : {$or: [{'owner': id}, {'owner': null}]};
    const imagesCount = await Image.countDocuments(findFilter);

    return imagesCount;
}

export async function getImagesArr() { 
    let imagesArr = await fs.promises.readdir(path);
    
    return imagesArr;
}


async function getTotal(reqUrl: string ,resObj: ResponseObject, id: ObjectId) { 
    const picturesAmount = await getArrayLength(id, reqUrl);         
    const pagesAmount = Math.ceil(picturesAmount / picOnPage);

    resObj.total = pagesAmount;

    return resObj;
}

function getCurrentPage(obj: ResponseObject, reqURL: string) {
    const requestedPage = url.parse(reqURL, true).query.page as string;
    
    obj.page = +requestedPage;
        
    return obj;
}

async function getRequestedImages(reqUrl: string , resObj: ResponseObject, id: ObjectId) { 
   
    const page = resObj.page;
    const filter = url.parse(reqUrl, true).query.filter as string;
    const findFilter = (filter === 'true') ? {'owner': id} : {$or: [{'owner': id}, {'owner': null}]};
    const arrForPage = await Image.find(findFilter, null, {skip: picOnPage * page - picOnPage, limit: picOnPage});

    resObj.objects = arrForPage as unknown as object[];

    return resObj;
}

function checkPage(resObj: ResponseObject) {
    return ((resObj.page > 0) && (resObj.page <= resObj.total)) ? resObj : false;
}

export {getTotal, getCurrentPage, getLimit, getRequestedImages, checkPage, getArrayLength, ResponseObject};