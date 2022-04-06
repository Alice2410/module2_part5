const email = <HTMLInputElement>document.getElementById('email');
const errorEmail = document.getElementById('email-error');
const password = <HTMLInputElement>document.getElementById('password');
const errorPassword = document.getElementById('password-error');

email.addEventListener( 'input', function () { 

    if ((/\w[-\w+]@\w+\.\w{2,}/.test(email.value))) {
        email.classList.remove('invalid');
        email.classList.add('valid');
        if (errorEmail) {
            errorEmail.innerHTML = 'Email корректен.'
            errorEmail.classList.remove('authorization-form__error--invalid');
            errorEmail.classList.add('authorization-form__error--valid');
        } else {
            console.log (`Element ${errorEmail} is not exist`)
        }
    } else {
        email.classList.remove('valid');
        email.classList.add('invalid');
        if (errorEmail) {
            errorEmail.innerHTML = 'Введите корректный email.'
            errorEmail.classList.remove('authorization-form__error--valid');
            errorEmail.classList.add('authorization-form__error--invalid');
        } else {
            console.log (`Element ${errorEmail} is not exist`)
        }
    }

})

password.addEventListener( 'input', function () { 

    if ((/[a-zA-Z0-9]{8,}/.test(password.value))) {
        password.classList.remove('invalid');
        password.classList.add('valid');
        if (errorPassword) {
            errorPassword.innerHTML = 'Пароль верен.'
            errorPassword.classList.remove('authorization-form__error--invalid');
            errorPassword.classList.add('authorization-form__error--valid');
        } else {
            console.log (`Element ${errorPassword} is not exist`)
        }
    } else {
        password.classList.remove('valid');
        password.classList.add('invalid');
        if (errorPassword) {
            errorPassword.innerHTML = 'Пароль неверен.'
            errorPassword.classList.remove('authorization-form__error--valid');
            errorPassword.classList.add('authorization-form__error--invalid');
        } else {
            console.log (`Element ${errorPassword} is not exist`)
        }
    }
})
    
    
