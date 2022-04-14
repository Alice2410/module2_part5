import { User } from './models/user';
import * as bcrypt from 'bcrypt';
import { UserLog } from './interfaces';

export async function checkUser(email: string, password: string) {

    try {
        const userIsExist = await User.exists({email: email});

        if(userIsExist) {
            const userData = await User.findOne({email: email}) as UserLog;
            const validPassword = userData.password;
            const userSalt = userData.salt;
            const userPassword = await bcrypt.hash(password, userSalt); 
            const isValid = (userPassword === validPassword);

            return isValid;
        } 

        return false;
    } catch(err) {
        let error = err as Error;
        console.log(error.message)
    }
}


