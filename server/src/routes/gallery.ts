import express from "express";
import passport from "passport";
import { UserLog } from './../interfaces';
import passportJWT from "passport-jwt";
import { User } from './../models/user';
import { ObjectId } from "mongodb";
import upload, { UploadedFile } from "express-fileupload";
import { sendResponse } from "../send_response";
import { getUploadedFileName } from "../get_filename";

export const galleryRouter = express.Router();

const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.TOKEN_KEY,
  },
   async function (jwtPayload, done) {
    let email = jwtPayload.sub;
    let user = await User.findOne({email: email})

    return user ? done(null, user) : done(null, false);
  }
))

galleryRouter.post('/gallery', passport.authenticate('jwt', {session: false}), async (req, res) => {
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

galleryRouter.get('/gallery', passport.authenticate('jwt', {session: false}), async (req, res) => {
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