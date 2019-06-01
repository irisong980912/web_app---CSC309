// Get elements
const log = console.log
const inbox = document.querySelector('#content')
const invitation_list = document.querySelector('#invitation-list')

// Change params of form's action according to which button is pressed.
function submitForm(id, action, sender, receiver) {
	const form = document.getElementById(id)
	if (action == 'accept') {
		form.action = '/acceptRequest/' + id + '/' + sender
		if (!confirm('Do you confirm to accept this request?')) {
			return
		}
	} else {
		form.action = '/declineRequest/' + id + '/' + sender
		if (!confirm('Do you confirm to decline this request?')) {
			return
		}
	}

	form.submit()
}

// Add all applications to the dom.
function addToDOM(application) {
	fetch(
		'/projectInvitation/' +
		application.project_id +
		'/' +
		application.sender +
		'/' +
		application.receiver
	).then(res =>
		res.json().then(data => {
			invitation_list.innerHTML =
				invitation_list.innerHTML +
		`
        <br> 
        <form id="${data._id}" class="message rounded bg-light p-3 shadow-sm" action="/profile/${data.sender_id}" method="get">
            <button class="btn btn-secondary" type="submit">Profile</button>
            <span class="m-5">${data.name} wants to join your ${data.course_code} team!</span>
            <a id="accept" class="btn btn-primary m-2 text-white" onclick="submitForm('${data._id}','accept', '${data.sender_id}', '${data.receiver_id}')">Accept</a>
            <a id='decline' class="btn btn-danger m-2 text-white" onclick="submitForm('${data._id}','decline', '${data.sender_id}', '${data.receiver_id}')">Decline</a>
        </form>
        `
		})
	)
}

fetch('/allRequests').then(res => {
	res.json().then(data => {
		data.forEach(addToDOM)
		if (data.length == 0) {
			invitation_list.innerHTML =
				"<p class='h3 text-primary'>No invitations yet.</p>"
		}
	})
})