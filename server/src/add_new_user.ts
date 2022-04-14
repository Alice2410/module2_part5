import { User } from './models/user'
import * as bcrypt from 'bcrypt'
import { UserLog } from './interfaces';
import { validUsers} from './valid_users'

export async function addNewUser(reqBody?: UserLog) {
    
    try {
        if (reqBody) {
            console.log('has reqBody')
            let email = reqBody.email;
            let password = reqBody.password;
            let result = await createUserInDB(email, password);
            return result
        } else {
            console.log('adding default users')
            for (const email in validUsers) {
                console.log('user email: ', email);
                console.log('user password: ', validUsers[email]);
                await createUserInDB(email, validUsers[email])
            }
        }        
    } catch(err) {
        let error = err as Error;
        console.log(error.message);
    }
}

async function createUserInDB(email:string, password:string) {

    let userIsExist = await User.exists({email: email});

    if(!userIsExist) {
        const salt = await bcrypt.genSalt(10);
        const encPassword = await bcrypt.hash(password, salt);
        const newUser: UserLog = await User.create({email: email, password: encPassword, salt: salt});
        console.log(newUser);

        return true;
    }

    return false;
}
    
