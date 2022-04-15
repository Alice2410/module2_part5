import express from "express";
import jwt from "jsonwebtoken";
import passport from "passport";
import LocalPassport from "passport-local";
import { checkUser } from "./../check_valid";

export const authRouter = express.Router();

const LocalStrategy = LocalPassport.Strategy;

passport.use(new LocalStrategy({usernameField:"email", passwordField:"password"},
    async function(email, password, done) {  
        try {
            let isValid = await checkUser(email, password);

            return isValid ? done(null, { user: email }) : done(null, false);

        } catch(err) {
            let error = err as Error;
            console.log(error.message)
        }
    }
));

authRouter.post('/authorization', passport.authenticate('local', {
    session:false
}), async (req, res) => {
    const tokenKey = process.env.TOKEN_KEY as string;
    let token = jwt.sign({sub: req.body.email}, tokenKey);

    res.statusCode = 200;
    res.end(JSON.stringify({token: token}));
    
});