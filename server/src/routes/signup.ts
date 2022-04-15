import express from "express";
import { addNewUser } from "./../add_new_user";

export const signupRouter = express.Router();

signupRouter.post('/signup', async (req, res) => {

    let result = await addNewUser(req.body);
    let status = result ? 200 : 401;

    res.sendStatus(status);
    
});