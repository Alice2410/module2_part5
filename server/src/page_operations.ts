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
    
    let imagesObjectsArr;
    let findFilter;

    if (filter === 'true') {
        findFilter = {'owner': id};
    } else {
        findFilter = {$or: [{'owner': id}, {'owner': null}]}
    }

    imagesObjectsArr = await Image.find(findFilter, null, {});
    return imagesObjectsArr.length;
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
    let arrForPage;

    if (filter === "false") {
        arrForPage = await Image.find({$or: [ {'owner': id}, {'owner': null}]}, null, {skip: picOnPage * page - picOnPage, limit: picOnPage});
    } else {
        arrForPage = await Image.find({'owner': id}, null, {skip: picOnPage * page - picOnPage, limit: picOnPage});
    }
    
    resObj.objects = arrForPage as unknown as object[];

    return resObj;
}

function checkPage(resObj: ResponseObject) {
    if ((resObj.page > 0) && (resObj.page <= resObj.total)) {
        return resObj;
    } 

    return false;
}

function makeImagesPathsArr(imgObjectsArr: ImageInterface[]) {
    let pathsArr = imgObjectsArr.map(imgObject => imgObject.path);

    return pathsArr;
}

export {getTotal, getCurrentPage, getLimit, getRequestedImages, checkPage, getArrayLength, ResponseObject};