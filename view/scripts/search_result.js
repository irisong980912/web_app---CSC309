/* Select all DOM form elements */

const viewBtn = document.getElementsByClassName('viewBtn')
const requestBtn = document.getElementsByClassName('requestBtn')
const searchTitle = document.querySelector('#searchTitle')

/* Change view button inner text when clicked */

for (let i = 0; i < viewBtn.length; i++) {
    viewBtn[i].onclick = function () {
        if (viewBtn[i].classList.contains('unclicked')) {
            viewBtn[i].innerHTML = 'Hide Info'
            viewBtn[i].classList.remove('unclicked')
            viewBtn[i].classList.add('clicked')
        } else if (viewBtn[i].classList.contains('clicked')) {
            viewBtn[i].innerHTML = 'View Teammates'
            viewBtn[i].classList.remove('clicked')
            viewBtn[i].classList.add('unclicked')
        }
    }
}

/* Send invitation to a corresponding group */

function sendInvitation(e, id) {
    const project_id = id.slice(1, id.len)

    if (!e.classList.contains('sent')) {
        saveApplication(e, project_id)
    }
}

/* Save invitation into database */

function saveApplication(e, project_id) {
    const url = '/find/result/:code/:term/:section/:name'
    // The data we are going to send in our request
    let data = {
        project_id: project_id
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
            if (res.status === 200) {
                // change the display
                if (e.classList.contains('unclicked')) {
                    e.innerHTML =
                        "<img class='greenIcon' src='/images/check_green.png'><span class='green'>Request Sent</span>"
                    e.classList.remove('unclicked')
                }
                e.classList.add('sent')

                window.alert('Success: sent an invitation')
            } else if (res.status === 406) {
                window.alert('You are already in this group!')
            } else {
                window.alert('Could not send invitation')
            }
        })
        .catch(error => {})
}