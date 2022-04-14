import { Image } from './models/image';
import { ImageInterface } from './interfaces';
import { getImagesArr } from './page_operations';
import { getMetadata } from './get_metadata';
import { ObjectId } from 'mongodb';

export async function saveImagesToDB(path?: string, userID?: ObjectId) {
    let imagesPathsArr = await getImagesArr();

    if( path && userID) {
        let owner = userID;
        let result = await addImage(path, owner);
        console.log(result);
    } else {
    
    for(const imgPath of imagesPathsArr) {
        let imageIsExist = await Image.exists({path: imgPath});

        if(!imageIsExist) {
            try{

                let image = await addImage(imgPath);
                
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

    return image = await Image.create({path: imagePath, metadata: metadata, owner: owner ?? null});

}