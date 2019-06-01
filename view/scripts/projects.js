const log = console.log

function quit_project(project_id) {
    if (!confirm('Are you sure you want to quit the team?')) {
        return
    }
    const id = project_id.slice(1, project_id.len)
    const url = '/quit_project/' + id
    let data = {}
    const request = new Request(url, {
        method: 'delete',
        body: JSON.stringify(data),
        headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        }
    })
    fetch(request)
        .then(res => {
            quit_project_dom(project_id)
        })
        .catch(error => {})
}

function quit_project_dom(project_id) {
    const content = document.querySelector('#content')
    const project_to_remove = document.querySelector('#' + project_id)
    content.removeChild(project_to_remove)
    if (document.querySelector('#content').children.length === 0) {
        let placeholder = document.createElement('h5')
        placeholder.style = 'color:DarkGray;margin:auto;text-align:center'
        placeholder.innerHTML =
            "It looks like you don't have any projects right now."
        content.appendChild(placeholder)
    }
}

// need to save the project id into the local
function finish_project(id) {
    const project = document
        .querySelector('#' + id)
        .querySelector('#teammateContainer' + id)
        .querySelector('ul')
    if (project.children.length === 1) {
        alert(
            'You cannot finish a project with only one member. Please quit the project instead.'
        )
    } else {
        const project_id = id.slice(1, id.len)

        // save project id local storage to be retreived by finish_project page
        localStorage.setItem('project_id', project_id)
        window.location.href = '/finish_project/' + project_id
    }
}