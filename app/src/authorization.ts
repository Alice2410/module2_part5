import {Error, loginURL, Token, localStorageTokenKey, tokenTimestampKey} from './url.js'
const authorizationForm = document.getElementById('authorization-form');
const userEmail = <HTMLInputElement>document.getElementById('email');
const userPassword = <HTMLInputElement>document.getElementById('password');

authorizationForm?.addEventListener("submit", startAuthorization);

function startAuthorization(e: Event) {
    e.preventDefault();
    loginWithToken();
}

async function loginWithToken() { 
    let user = {
        email: userEmail.value,
        password: userPassword.value
    };
    
    try {
        const response = await fetch( loginURL,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(user),
        });
        
        checkTokenResponse(response);

        const jsonObj: Token = await response.json();
        const tokenJson = tokenIs(jsonObj);

        saveToken(tokenJson);
        saveTokenReceiptTime();
        redirect();

    } catch (err) {
        let error = err as Error;
        alert(error) 
    } 

}

function redirect() {
    const currentPage = window.location; //currentPage: http://localhost:5000/ || http://localhost:5000/index.html?page=2
    const pageNumber = currentPage.search; //?page=2

    authorizationForm?.removeEventListener("submit", startAuthorization);

    if (pageNumber) {
        window.location.href = "gallery.html" + pageNumber;
    } else {
        window.location.href = "gallery.html" + "?page=1" + "&limit=2";
    }
}

function saveToken(json: Token) {
    localStorage.setItem (localStorageTokenKey, JSON.stringify(json));
}

function saveTokenReceiptTime() {
    let tokenReceiptTime = Date.now();
    localStorage.setItem (tokenTimestampKey, JSON.stringify(tokenReceiptTime));
}

function checkTokenResponse(response: Response) {
    if (response.ok){
        return response;
    } else {
        let TokenErrorElement = document.getElementById('token-error');

        if (TokenErrorElement) {
            TokenErrorElement.innerHTML = 'Ошибка получения токена. Введите верные логин и пароль.';
        } else {
            throw new Error(`HTML-элемент не найден. ${response.status} — ${response.statusText}`)
        }
    }

    throw new Error(`${response.status} — ${response.statusText}`); 
}

function tokenIs (json: Token) {

    if (!json.token){ 
        let TokenErrorElement = document.getElementById('token-error');
        if (TokenErrorElement) {
            TokenErrorElement.innerHTML = 'Ошибка получения токена';

            throw new Error('Token is not exist')
        }
    } 

    return json;   
}