import { Image } from './models/image';
import { getImagesArr } from './page_operations';
import { getMetadata } from './get_metadata';

export async function saveImages(id?: string, path?: string) {
    let imagesPathsArr = await getImagesArr();
    if( id && path) {
        let result = await addImage(id, path);
        console.log(result)
    } else {
    
    for(let i = 0; i < imagesPathsArr.length; i++) {
        console.log(i);
        
        let imageIsExist = await Image.exists({id: i});

        if(!imageIsExist) {
            try{
                let imagePath = imagesPathsArr[i];
                let id = i.toString();
                let image = await addImage(id, imagePath)
                console.log('image obj: ' + image)
            } catch(err) {
                let error = err as Error;
                console.log(error.message)
            }
        }
    }
}
}

    
export async function addImage (id: string, imagePath: string) {
    let metadata = await getMetadata(imagePath);
    let image = await Image.create({id: id, path: imagePath, metadata: metadata})
    return image;
}