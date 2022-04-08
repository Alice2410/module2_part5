import * as http from "http";
import * as config from "./config";
import * as pageOperations from './page_operations';
import morgan from "morgan";
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import * as bcrypt from 'bcrypt'
import express, {NextFunction, Request, Response} from "express";
import upload, { UploadedFile } from "express-fileupload";
import { addNewUser } from "./add_new_user";
import { User } from './models/user';
import { UserLog } from './interfaces';
import { checkUser } from './check_valid';
import { saveUser } from "./add_users";
import { saveImages } from "./add_images";
import { ResponseObject } from "./interfaces";
import { deleteUserImages } from "./delete_images";
import { accessLogStream } from "./generator";
import passport from "passport";
import LocalPassport from "passport-local";
import jwt from "jsonwebtoken";

const PORT = 5000;
const app = express();
const LocalStrategy = LocalPassport.Strategy;

dotenv.config()
const dbURL = process.env.DB_CONN as string;

startServer();

passport.use(new LocalStrategy({usernameField:"email", passwordField:"password"},
    async function(email, password, done) {  
        try {
            const userIsExist = await User.exists({email: email});
            
            if(userIsExist) {
                const userData = await User.findOne({email: email}) as UserLog;
                console.log(userData)
                const validPassword = userData.password;
                const userSalt = userData.salt;
                const userPassword = await bcrypt.hash(password, userSalt); 
                if (userPassword === validPassword) {
                    return done(null, { user: email });
                }
            } 

            return done(null, false);

        } catch(err) {
            let error = err as Error;
            console.log(error.message)
        }
    }
));

app.use(passport.initialize());

app.use(morgan('tiny', { stream: accessLogStream }));

app.use('/', express.static(config.SCRIPTS_STATIC_PATH), express.static(config.SOURCES_STATIC_PATH));

app.use(express.json());

app.post('/signup', async (req, res) => {

    let result = await addNewUser(req.body);
    if (result) { 

        res.sendStatus(200);
    } 
    if (!result) {

        res.sendStatus(401);
    }
    
});

app.post('/authorization', passport.authenticate('local', {
    session:false
}), async (req, res) => {
    const tokenKey = process.env.TOKEN_KEY as string;
    console.log(tokenKey);
    let token = jwt.sign(req.body.email, tokenKey);
    console.log(token);

    res.statusCode = 200;
    res.end(JSON.stringify({token: token}));
    
});

app.use(upload());

app.use('/gallery', checkToken);

app.post('/gallery', async (req, res) => {
    
    try{
        if(!req.files) {
            throw new Error('Ошибка загрузки. Картинка не сохранена');
        } else {
            let file = req.files.file as UploadedFile;

            await getUploadedFileName(file, res);
        }
    } catch(err) {
        let error = err as Error;
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
        
});

app.use((req, res) => {
    res.redirect('http://localhost:5000/404.html');
});

async function startServer() {
    await connectToDB();
    await deleteUserImages();
    await saveUser();
    await saveImages();

    app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
}

async function connectToDB() {
    await mongoose.connect(dbURL);
    console.log('connected to DB'); 
}

function sendNotFoundStatus (resObj: ResponseObject, res: http.ServerResponse) {

    if (!pageOperations.checkPage(resObj)) {
        res.statusCode = 404;
        res.end();

        return false;
    } 

    return resObj;
}

async function sendResponse (resObj: ResponseObject, reqUrl: string, res: http.ServerResponse) {
    
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
            let id = (number - 1).toString();
            let path = newFileName;
            
            await saveImages(id, path);
            res.end(); 
        }
    })
}

function checkToken (req: Request, res: Response, next: NextFunction) {
    const headers = req.headers;

    if (headers.authorization === 'token') {  
        next();
    } else {
        res.sendStatus(403);
        next()
    }
}
