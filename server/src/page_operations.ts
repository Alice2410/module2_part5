import * as fs from "fs";
import * as url from "url";
import * as config from "./config"
import { Image } from "./models/image";

const path = config.IMAGES_PATH;
let picOnPage: number;

interface responseObj {
    objects: object[];
    page: number;
    total: number;
}

interface Error{
    errorMessage: string;
}

function getLimit(reqURL: string) {
    picOnPage = parseInt(url.parse(reqURL, true).query.limit as string);
}

async function getArrayLength () { //вычисляет количество картинок всего
    const imagesArr = await getImagesArr();
    const arrLength = imagesArr.length;
    
    return arrLength;
}

export async function getImagesArr() { //получает массив строк с адресами всех картинок
    let imagesArr = await fs.promises.readdir(path);
    
    return imagesArr;
}


async function getTotal(resObj: responseObj) { //вычисляет количество страниц 
    const picturesAmount = await getArrayLength();         // назначает TOTAL
    const pagesAmount = Math.ceil(picturesAmount / picOnPage);

    resObj.total = pagesAmount;

    return resObj;
}

function getCurrentPage(obj: responseObj, reqURL: string) { //назначает PAGE
    const requestedPage = url.parse(reqURL, true).query.page as string;
    
    obj.page = +requestedPage;
        
    return obj;
}

async function getRequestedImages(resObj: responseObj) { //назначает OBJECTS
   
    const page = resObj.page;
    const picArr = await getImagesArr();

    let arrForPage = await Image.find({}, null, {skip: picOnPage * page - picOnPage, limit: picOnPage});

    resObj.objects = arrForPage as unknown as object[];

    return resObj;
}

function checkPage(resObj: responseObj) {
    if ((resObj.page > 0) && (resObj.page <= resObj.total)) {
        return resObj;
    } 

    return false;
}

export {getTotal, getCurrentPage, getLimit, getRequestedImages, checkPage, getArrayLength, responseObj};