import { Image } from './models/image';

export async function deleteUserImages() {
    let user = await Image.deleteMany({"path": { "$regex": "user" }});
    console.log(user)
}
