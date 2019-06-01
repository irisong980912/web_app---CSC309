const log = console.log
// Get the signup form
const signup = document.querySelector('#signup')

// Add the event listener
signup.addEventListener('submit', join)

// Signup
function join(e) {
	e.preventDefault()
	const email = signup.elements['email'].value
	const pwd = signup.elements['psw'].value
	const rpt = signup.elements['psw-repeat'].value
	const name = signup.elements['name'].value
	const year = signup.elements['year'].value

	if (!email.includes('@')) {
		window.alert('Please enter correct email address.')
		return
	}

	if (rpt != pwd) {
		window.alert('Please enter the same password.')
		return
	}
	if (pwd.length < 8) {
		window.alert('Minimum length of password is 8.')
		return
	}

	if (isNaN(year)) {
		window.alert('Year has to be 1,2,3 etc.')
		return
	}
	const body = {
		email: email,
		password: pwd,
		name: name,
		year: year
	}

	fetch('/users/signup', {
		method: 'POST',
		headers: {
			'Content-type': 'application/json'
		},
		body: JSON.stringify(body)
	}).then(res => {
		if (res.status == 400) {
			window.alert('Email already exists, please use another one.')
		} else {
			if (
				window.confirm(
					'Congratulations, you are successfully signed up.\nPlease log in.'
				)
			) {
				location.href = '/login'
			} else {
				signup.reset()
			}
		}
	})
}