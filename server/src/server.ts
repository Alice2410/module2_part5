import * as http from "http";
import * as config from "./config";
import * as pageOperations from './page_operations';
import morgan from "morgan";
import fs from "fs";
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import * as bcrypt from 'bcrypt'
import { checkUser } from "./check_valid";
import express, { Response } from "express";
import upload, { UploadedFile } from "express-fileupload";
import { addNewUser } from "./add_new_user";
import { User } from './models/user';
import { UserLog } from './interfaces';
import { saveImagesToDB } from "./add_images";
import { ResponseObject } from "./interfaces";
import { accessLogStream } from "./generator";
import passport from "passport";
import LocalPassport from "passport-local";
import jwt from "jsonwebtoken";
import passportJWT from "passport-jwt";
import { ObjectId } from "mongodb";
import path from "path";

const PORT = 5000;
const app = express();

const LocalStrategy = LocalPassport.Strategy;
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

dotenv.config()
const dbURL = process.env.DB_CONN as string;

startServer();

passport.use(new LocalStrategy({usernameField:"email", passwordField:"password"},
    async function(email, password, done) {  
        try {
            let isValid = await checkUser(email, password);

                if (isValid) {
                    return done(null, { user: email });
                }
            
            return done(null, false);

        } catch(err) {
            let error = err as Error;
            console.log(error.message)
        }
    }
));

passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.TOKEN_KEY,
  },
   async function (jwtPayload, done) {
    let email = jwtPayload.sub;
    let user = await User.findOne({email: email})

    if (user) {
        return done(null, user);
    }

    return done(null, false)
  }
))

app.use(passport.initialize());

app.use(morgan('tiny', { stream: accessLogStream }));

app.use('/', express.static(config.SCRIPTS_STATIC_PATH), express.static(config.SOURCES_STATIC_PATH));

app.use(express.json());

app.post('/signup', async (req, res) => {

    let result = await addNewUser(req.body);
    let status = 401;

    if (result) { 
        status = 200;
    } 

    res.sendStatus(status);
    
});

app.post('/authorization', passport.authenticate('local', {
    session:false
}), async (req, res) => {
    const tokenKey = process.env.TOKEN_KEY as string;
    let token = jwt.sign({sub: req.body.email}, tokenKey);

    res.statusCode = 200;
    res.end(JSON.stringify({token: token}));
    
});

app.use(upload());

app.post('/gallery', passport.authenticate('jwt', {session: false}), async (req, res) => {
    let user = req.user as UserLog;
    let id = user._id;
    try{
        if(!req.files) {
            throw new Error('Ошибка загрузки. Картинка не сохранена');
        } else {
            let file = req.files.file as UploadedFile;
            if(id) {
                await getUploadedFileName(id, file, res);
            }
        }
    } catch(err) {
        let error = err as Error;
        res.status(500).send(error);
    }
    
});

app.get('/gallery', passport.authenticate('jwt', {session: false}), async (req, res) => {
    let user = req.user as UserLog;
    let id = user._id as ObjectId;
               
    const reqUrl = req.url;
    const resObj = {
        objects: [{}],
        page: 0,
        total: 0,
    }

    try {
        await sendResponse(resObj, reqUrl, res, id);
    } catch (error) {
        console.log(error);
    }
        
});

app.use((req, res) => {
    res.redirect('http://localhost:5000/404.html');
});

async function startServer() {
    console.log('start server');
    await connectToDB();
    // await deleteUserImages();
    // await saveUser();
    await addNewUser();
    await saveImagesToDB();

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

async function sendResponse (resObj: ResponseObject, reqUrl: string, res: http.ServerResponse, id: ObjectId) {
    
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

async function getUploadedFileName(userId: ObjectId, file: UploadedFile, res: Response) {
    
    let fileName = file.name;
    let noSpaceFileName = fileName.replace(/\s/g, '');
    let newFileName = 'user' + '_' +  noSpaceFileName;

    file.mv((config.IMAGES_PATH + newFileName), async (err: Error) => {
    
        if(err){
            res.send (err);
        } else {
            let path = newFileName;
            await saveImagesToDB(path, userId);
            res.end(); 
        }
        console.log((config.IMAGES_PATH + newFileName), path.join(config.IMAGES_PATH, "../../../../storage/", ));
        console.log('saved')
        await copyImage(newFileName)
    })

    
}

async function copyImage(fileName: string) {
    let from = path.join(config.IMAGES_PATH , fileName);
    let dest = path.join(config.IMAGES_PATH, "../../../../storage/", fileName);
    console.log('from: ' + from);
    console.log('dest: ' + dest);
    await fs.promises.copyFile(from, dest);
}
