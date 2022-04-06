import { User } from './models/user'
import * as bcrypt from 'bcrypt';

interface UserLog {
    email: string;
    password: string;
    salt: string
}

export async function checkUser(reqBody: UserLog) {

    try {
        const userEmail = reqBody.email;
        const userIsExist = await User.exists({email: userEmail});

        if(userIsExist) {
            const userData = await User.findOne({email: userEmail});
            const validPassword: string = userData.password;
            const userSalt: string = userData.salt;
            const password = await bcrypt.hash(reqBody.password, userSalt); 
            const isValid = (password === validPassword);

            return isValid;
        } 

        return false;
    } catch(err) {
        let error = err as Error;
        console.log(error.message)
    }
}


