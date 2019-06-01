const log = console.log

/* Select the DOM form element reset and then reset all the input fields */

document.getElementById('reset').onclick = function () {
    const field = document.getElementsByClassName('form-control')
    for (let i = 0; i < field.length; i++) {
        field[i].value = field[i].defaultValue

        if (field[i].id == 'inputTerm') {
            field[i].selectedIndex = 0
        }
    }
}

/* Select all DOM form input elements */

const inputCode = document.querySelector('#inputCode')
const inputTerm = document.querySelector('#inputTerm')
const inputSection = document.querySelector('#inputSection')
const inputName = document.querySelector('#inputName')
const inputDescription = document.querySelector('#exampleFormControlTextarea1')

function addProject() {
    // need to get the current session user id.
    const url = '/add_project'
    // The data we are going to send in our request
    let data = {
        course_code: inputCode.value,
        term: inputTerm.value,
        section: inputSection.value,
        name: inputName.value,
        description: inputDescription.value
    }
    // Create our request constructor with all the parameters we need
    const request = new Request(url, {
        method: 'put',
        body: JSON.stringify(data),
        headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        }
    })
    fetch(request)
        .then(function (res) {
            // Handle response we get from the API
            // Usually check the error codes to see what happened
            if (res.status === 200) {
                window.alert('Success: Added a project.')
            } else {
                window.alert('Could not add project')
            }
            window.location.href = '/projects'
        })
        .catch(error => {})
}