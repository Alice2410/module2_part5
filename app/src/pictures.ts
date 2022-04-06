import { Token, basicGalleryURL, Gallery, tokenTimestampKey, localStorageTokenKey, ImageObject } from "./url.js";
const linksList = document.getElementById('links');
const uploadImageForm = document.getElementById('upload') as HTMLFormElement;
const uploadFile = document.getElementById("file") as HTMLInputElement;
let formData = new FormData();
let tokenObject: Token;

setInterval(checkTokenIs, 1000);
checkLocalStorage();
goToNewGalleryPage();
linksList?.addEventListener("click", createNewAddressOfCurrentPage);
uploadImageForm?.addEventListener("submit", startUpload);

function startUpload(e: Event) {
    e.preventDefault();
    uploadImage();
}

async function goToNewGalleryPage() { 
    let requestGalleryURL = basicGalleryURL + window.location.search;
    
    try {
        
        const response = await fetch( requestGalleryURL,
            {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': tokenObject.token
                }
            }
        );
        
        checkResponse(response);
        let responseObj = await response.json();
        createLinks(responseObj);
        createImages(responseObj);
    } catch(error) {
        console.log(error);
        alert(error);
    }

}

async function uploadImage() {
    //-------------POST FOR PICS
    let postUrl = '/gallery';
    if (uploadFile.files) {
        for (const file of uploadFile.files) {
            formData.append("file", file);
        }
    }
    

    try {
        const response = await fetch( postUrl,
            {
                method: "POST",
                headers: {
                    'Authorization': tokenObject.token
                },
                body: formData
            }
        );
        let currentPage = window.location;
        let searchParam = currentPage.search;

        window.location.href = "gallery.html" + searchParam;
    } catch(error) {
        let err = error as Error;
        console.log(err.message);
    }
}



function createLinks(imagesObject: Gallery){
    let totalPages = imagesObject.total;
    let linksSection = document.getElementById("links");

    for ( let i = 1; i <= totalPages; i++) {
        let pictureLink = document.createElement('li');
        pictureLink.innerHTML = `<a>${i}</a>`
        linksSection?.append(pictureLink);
    }

    return imagesObject;
}

function createImages(imagesObject: Gallery) {
        let imagesObjArray = imagesObject.objects;
        let imagesPathArr: string[] = [];
        for (let i = 0; i < imagesObjArray.length; i++) {
            let imageObject: ImageObject = imagesObjArray[i];
            let imagePath = imageObject.path;
            imagesPathArr.push(imagePath);
        }
        let imageSection = document.getElementById("photo-section");

        for ( let i = 0; i < imagesPathArr.length; i++) {
            let galleryImage = document.createElement('img');
            galleryImage.src = './resources/images/' + imagesPathArr[i];
            imageSection?.append(galleryImage);
        }
}

function checkTokenIs() {
    if ((Date.now() - JSON.parse(localStorage.getItem(tokenTimestampKey) || "")) >= 600000) {
        localStorage.removeItem(localStorageTokenKey);
        localStorage.removeItem(tokenTimestampKey);
        linksList?.removeEventListener("click", createNewAddressOfCurrentPage);
        redirectToAuthorization();
    }
}

function redirectToAuthorization() {
        let currentPage = window.location;
        let searchParam = currentPage.search;
        window.location.href = "index.html" + searchParam;
}

function checkResponse (response: Response) {
    if (response.ok) {
        return response;
    } 

    let errorMessage: string;

    if (response.status === 403) {
        errorMessage = "Токен некорректен или отсутствует. Повторите авторизацию."
        writeErrorMessage (errorMessage, response);
    } else if (response.status === 404) {
        errorMessage = "Такой страницы не существует."
        writeErrorMessage (errorMessage, response);
    }

    throw new Error(`${response.status} — ${response.body}`);
    
}

function checkLocalStorage () {
    if (localStorage.getItem(localStorageTokenKey)) {
        tokenObject = JSON.parse(localStorage.getItem(localStorageTokenKey) || '');
    } else {
         redirectToAuthorization()
     }
}

function createNewAddressOfCurrentPage(e: Event) {
    let currentPage = window.location.href;
    let params = new URL(currentPage).searchParams;
    let limit = params.get('limit');
    let number = (e.target as HTMLLinkElement).textContent;
    window.location.href = "gallery.html" + "?page=" + number + "&limit=" + limit;
}

function writeErrorMessage (message: string, response: Response) {
    const errorMessage = document.getElementById('error-message');
        if (errorMessage) {
            errorMessage.innerHTML = message;
            
            const toAuthorizationLink = document.getElementById('back-gallery');
            if (toAuthorizationLink) {

                toAuthorizationLink.classList.remove('back-link--disabled');
                toAuthorizationLink.classList.add('aback-link--abled');
                toAuthorizationLink.addEventListener("click", redirectToAuthorization);
            }
        }  
    throw new Error(`${response.status} — ${response.body}`);
}
            
