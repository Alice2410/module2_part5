import { User } from './models/user';
import * as bcrypt from 'bcrypt';
import { UserLog } from './interfaces';

export async function checkUser(reqBody: UserLog) {

    try {
        const userEmail = reqBody.email;
        const userIsExist = await User.exists({email: userEmail});

        if(userIsExist) {
            const userData = await User.findOne({email: userEmail}) as UserLog;
            const validPassword = userData.password;
            const userSalt = userData.salt;
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


