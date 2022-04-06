import { User } from './models/user'
import { validUsers} from './valid_users'

export async function saveUser() {
    
    try {
        let userEmailsArr = Object.keys(validUsers);

        for (let i = 0; i < userEmailsArr.length; i++) {

            let userEmail = userEmailsArr[i];
            let userIsExist = await User.exists({email: userEmail});

            if (!userIsExist) {
                try{
                    
                    let user = await User.create({email: userEmail, password: validUsers[userEmail]})

                } catch(err) {
                    let error = err as Error;
                    console.log(error.message)
                }
            }
            
        }
    } catch (err) {
        let error = err as Error;
        console.log(error.message)
    }
}