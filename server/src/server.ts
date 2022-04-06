import * as http from "http";
import * as rfs from "rotating-file-stream";
import * as config from "./config";
import * as pageOperations from './page_operations';
import morgan from "morgan";
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import express, {NextFunction, Request, Response} from "express";
import upload, { UploadedFile } from "express-fileupload";
import { checkUser } from './check_valid';
import { saveUser } from "./add_users";
import { saveImages } from "./add_images";
import { responseObj } from "./page_operations";
import { deleteUserImages } from "./delete_images";

const token = { token: "token" };
const PORT = 5000;
const app = express();

dotenv.config()
const dbURL = process.env.DB_CONN as string;

async function connectToDB() {
    await mongoose.connect(dbURL);
    console.log('connected to DB'); 
}

connectToDB()
.then(() => deleteUserImages())
.then(() => {
    saveUser();
    saveImages();
})


const generator = () => {
    let ISOTime = (new Date(Date.now())).toISOString().slice(0, -5).replace( /[T]/, '_');

    return ISOTime;
};

let accessLogStream = rfs.createStream( generator, {
    interval: '1h',
    path: config.LOG_PATH,
});

app.use(morgan('tiny', { stream: accessLogStream }))

app.use('/', express.static(config.SCRIPTS_STATIC_PATH), express.static(config.SOURCES_STATIC_PATH));

app.use(express.json());

app.post('/authorization', async (req, res) => {
    let result = await checkUser(req.body);
    if (result) { //проверка данных пользователя

        res.statusCode = 200;
        res.end(JSON.stringify(token));
    } else {

        res.sendStatus(403);
    }
    
})

app.use(upload())

app.use('/gallery', checkToken)

app.post('/gallery', async (req, res) => {
    
    try{
        if(!req.files) {
            throw new Error('Ошибка загрузки. Картинка не сохранена')
        } else {
            
            let file = req.files.file as UploadedFile;

            await getUploadedFileName(file, res);
        }
    } catch(err) {
        let error = err as Error
        res.status(500).send(error);
    }
    
});

app.get('/gallery', async (req, res) => {
               
        const reqUrl = req.url;
        const resObj = {
            objects: [{}],
            page: 0,
            total: 0,
        }

        try {
            await sendResponse(resObj, reqUrl, res);
        } catch (error) {
            console.log(error);
        }
        
})

app.use((req, res) => {
    res.redirect('http://localhost:5000/404.html')
})

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

function sendNotFoundStatus (resObj: responseObj, res: http.ServerResponse) {

    if (!pageOperations.checkPage(resObj)) {
        res.statusCode = 404;
        res.end();
        return false;
    } 

    return resObj;
}

async function sendResponse (resObj: responseObj, reqUrl: string, res: http.ServerResponse) {
    
    pageOperations.getLimit(reqUrl);
    await pageOperations.getTotal(resObj);
    pageOperations.getCurrentPage(resObj, reqUrl);

    try {
        if (sendNotFoundStatus(resObj, res)) {
            await pageOperations.getRequestedImages(resObj);
            res.statusCode = 200;
            res.end(JSON.stringify(resObj));
        }
    } catch (err) {
        return err;
    }
}

async function getUploadedFileName(file: UploadedFile, res: Response) {
    
    let fileName = file.name;
    let noSpaceFileName = fileName.replace(/\s/g, '');
    let number = await pageOperations.getArrayLength() + 1;

    let newFileName = 'user-' + number + '_' +  noSpaceFileName;

    file.mv((config.IMAGES_PATH + newFileName), async (err: Error) => {
    
        if(err){
            res.send (err);
        } else {
            // await saveImages();
            let id = (number - 1).toString();
            let path = newFileName;
            await saveImages(id, path);
            res.end() 
        }
    })
}

function checkToken (req: Request, res: Response, next: NextFunction) {
    const headers = req.headers;

    if (headers.authorization === 'token') {  
        next()
    } else {
        res.sendStatus(403);
        next()
    }
}
