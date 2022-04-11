import {Error, loginURL, signUpUrl, Token, localStorageTokenKey, tokenTimestampKey} from './url.js'
const authorizationForm = document.getElementById('authorization-form');
const userEmail = <HTMLInputElement>document.getElementById('email');
const userPassword = <HTMLInputElement>document.getElementById('password');
const signUpButton = <HTMLButtonElement>document.getElementById('signup');

authorizationForm?.addEventListener("submit", startAuthorization);
signUpButton?.addEventListener("click", startSignUp)

function startAuthorization(e: Event) {
    e.preventDefault();
    loginWithToken();
}

function startSignUp(e: Event) {
    e.preventDefault();
    signUp();
}

async function signUp() {
    let user = {
        email: userEmail.value,
        password: userPassword.value
    };
    
    try{
        const response = await fetch( signUpUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(user),
        })

        checkSignUpResponse(response);
    } catch (err) {
        let error = err as Error;
        alert(error) 
    }
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
    const params = currentPage.search; //?page=2

    authorizationForm?.removeEventListener("submit", startAuthorization);

    if (params) {
        window.location.href = "gallery.html" + params;
    } else {
        let searchParams = new URLSearchParams(params);
        searchParams.append('page', '1');
        searchParams.append('limit', '2');
        searchParams.append('filter', 'false');
        window.location.href = "gallery.html?" + searchParams;
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

function checkSignUpResponse(response: Response) {
    let messageElement = document.getElementById('token-error');

    if (response.ok){

        if (messageElement) {
            messageElement.innerHTML = 'Пользователь успешно добавлен';
        } else {
            throw new Error(`HTML-элемент не найден. ${response.status} — ${response.statusText}`)
        }

        return response;
    } 
    
    if (response.status === 401){

        if (messageElement) {
            messageElement.innerHTML = 'Такой пользователь уже существует';
        } else {
            throw new Error(`HTML-элемент не найден. ${response.status} — ${response.statusText}`)
        }

        return response;
    } else {

        if (messageElement) {
            messageElement.innerHTML = 'Что-то пошло не так';
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