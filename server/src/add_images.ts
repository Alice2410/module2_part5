import { Image } from './models/image';
import { ImageInterface } from './interfaces';
import { getImagesArr } from './page_operations';
import { getMetadata } from './get_metadata';
import { ObjectId } from 'mongodb';

export async function saveImages(path?: string, userID?: ObjectId) {
    let imagesPathsArr = await getImagesArr();

    if( path && userID) {
        let owner = userID;
        let result = await addImage(path, owner);
    } else {
    
    for(let i = 0; i < imagesPathsArr.length; i++) {
        let imageIsExist = await Image.exists({path: imagesPathsArr[i]});

        if(!imageIsExist) {
            try{
                let imagePath = imagesPathsArr[i];
                let image = await addImage(imagePath);
                
            } catch(err) {
                let error = err as Error;
                console.log(error.message)
            }
        }
    }
}
}

    
export async function addImage (imagePath: string, owner?: ObjectId) {
    let image: ImageInterface;
    let metadata = await getMetadata(imagePath);

    if (!owner) {
        
        return image = await Image.create({path: imagePath, metadata: metadata, owner: null});
    } else {
        return image = await Image.create({path: imagePath, metadata: metadata, owner: owner});
    }
}