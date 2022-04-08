import { Image } from './models/image';
import { ImageInterface } from './interfaces';
import { getImagesArr } from './page_operations';
import { getMetadata } from './get_metadata';
import { ObjectId } from 'mongodb';

export async function saveImages(id?: string, path?: string, userID?: ObjectId) {
    let imagesPathsArr = await getImagesArr();

    if( id && path && userID) {
        console.log('i have userid: ' + userID);
        let owner = userID;
        console.log('string ' + owner);
        let result = await addImage(id, path, owner);
        console.log(result)
    } else {
    
    for(let i = 0; i < imagesPathsArr.length; i++) {
        console.log(i);
        
        let imageIsExist = await Image.exists({id: i});

        if(!imageIsExist) {
            try{
                let imagePath = imagesPathsArr[i];
                let id = i.toString();
                let image = await addImage(id, imagePath);
                console.log('image obj: ' + image)
            } catch(err) {
                let error = err as Error;
                console.log(error.message)
            }
        }
    }
}
}

    
export async function addImage (id: string, imagePath: string, owner?: ObjectId) {
    let image: ImageInterface;
    let metadata = await getMetadata(imagePath);

    if (!owner) {
        console
        return image = await Image.create({id: id, path: imagePath, metadata: metadata, owner: null});
    } else {
        return image = await Image.create({id: id, path: imagePath, metadata: metadata, owner: owner});
    }
}