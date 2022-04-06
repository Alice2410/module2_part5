import { User } from './models/user'
import * as bcrypt from 'bcrypt'

interface UserLog {
    email: string;
    password: string;
}

export async function addNewUser(reqBody: UserLog) {

    try {
        const userEmail = reqBody.email;
        const userIsExist = await User.exists({email: userEmail});

        if(!userIsExist) {
            const salt = await bcrypt.genSalt(10);
            const password = await bcrypt.hash(reqBody.password, salt);
            const newUser = await User.create({email: userEmail, password: password, salt: salt});
            console.log(newUser);

            return true;
        } 

        return false;
    } catch(err) {
        let error = err as Error;
        console.log(error.message)
    }
}