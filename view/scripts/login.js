// Get form
const form = document.querySelector('#login')

// Add event listener: when enter is pressed, try to login.
form.addEventListener('onclick', login)

function handle(e) {
    if (e.keyCode === 13) {
        e.preventDefault()
        login()
    }
}

// When login, check the credentials, load corresponding html.
function login() {
    const email = document.getElementById('email').value
    const psw = document.getElementById('password').value
    if (email == '' || psw == '') {
        window.alert('Please enter all information.')
        return
    }
    const data = {
        email: email,
        password: psw
    }

    fetch('/users/login', {
        method: 'POST',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify(data)
    }).then(res => {
        if (res.status == 404) {
            window.alert('Email or password not valid.')
        } else {
            location.href = res.url
        }
    })
}