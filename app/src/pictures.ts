import { Token, basicGalleryURL, Gallery, tokenTimestampKey, localStorageTokenKey, ImageObject } from "./url.js";
const linksList = document.getElementById('links');
const uploadImageForm = document.getElementById('upload') as HTMLFormElement;
const uploadFile = document.getElementById("file") as HTMLInputElement;
const filterButton = document.getElementById("filter-button") as HTMLButtonElement;
let formData = new FormData();
let tokenObject: Token;

setInterval(checkTokenIs, 1000);
checkLocalStorage();
goToNewGalleryPage();
renderButton();
linksList?.addEventListener("click", createNewAddressOfCurrentPage);
filterButton?.addEventListener("click", changeFilter);
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
                    'Authorization': 'Bearer ' + tokenObject.token
                }
            }
        );
        
        checkResponse(response);
        let responseObj: Gallery = await response.json();
        createLinks(responseObj);
        createImages(responseObj);
    } catch(error) {
        console.log(error);
        alert(error);
    }

}

async function uploadImage() {
    let postUrl = '/gallery';

    if (uploadFile.files) {

        for (const file of uploadFile.files) {
            formData.append("file", file);
        }
    }
    
    try {
        await fetch( postUrl,
            {
                method: "POST",
                headers: {
                    'Authorization': 'Bearer ' + tokenObject.token
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
        let imagesPathsArr = imagesObjArray.map(imageObject => imageObject.path);

        let imageSection = document.getElementById("photo-section");

        for (const imgPath of imagesPathsArr) {
            let galleryImage = document.createElement('img');
            
            galleryImage.src = './resources/images/' + imgPath;
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

    if (response.status === 401) {
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
    let number = (e.target as HTMLLinkElement).textContent as string;
    params.set('page', number);
    window.location.href = "gallery.html?" + params;
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
    
function changeFilter(e: Event) {
    let currentPage = window.location.href;
    let params = new URL(currentPage).searchParams;
    let filter = params.get('filter');

    if (filter === 'false'){
        params.set('filter', 'true');
        window.location.href = "gallery.html?" + params;
    } 

    if (filter === 'true'){ 
        params.set('filter', 'false');
        window.location.href = "gallery.html?" + params;
    }
}

function renderButton() {
    let filter = new URL(window.location.href).searchParams.get('filter');
    if (filter === 'true'){
        filterButton.textContent = 'Показать все картинки';
    } else {
        filterButton.textContent = 'Показать мои картинки';
    }
}
