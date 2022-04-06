import { User } from './models/user'

interface UserLog {
    email: string;
    password: string;
}

export async function checkUser(reqBody: UserLog) {

    try {
        const userEmail = reqBody.email;
        const userIsExist = await User.exists({email: userEmail});

        if(userIsExist) {
            const userData = await User.findOne({email: userEmail});
            const validPassword: string = userData.password;
            const isValid = (reqBody.password === validPassword);

            return isValid;
        } 

        return false;
    } catch(err) {
        let error = err as Error;
        console.log(error.message)
    }
}


