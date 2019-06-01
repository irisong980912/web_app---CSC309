// Load some const
const log = console.log
const search = document.querySelector('#search')
const email_display = document.querySelector('#email')
const password_display = document.querySelector('#password')
const name_display = document.querySelector('#name')
const year_display = document.querySelector('#year')
const rating_display = document.querySelector('#rating')
const updateCd = document.querySelector('#update')
const course_form = document.querySelector('#course-form')
const updateinfo = document.querySelector('#updateinfo')

// Add the event listeners
search.addEventListener('submit', searchFn)
updateCd.addEventListener('submit', updateFn)
course_form.addEventListener('submit', courseFn)
updateinfo.addEventListener('submit', updateInfo)

// Update stats everytime load the page
const total_user = document.querySelector('#total_user')
const total_comment = document.querySelector('#total_comment')
const total_project = document.querySelector('#total_project')
fetch('/usernum').then(res =>
	res.json().then(data => (total_user.textContent = data.l))
)
fetch('/commentnum').then(res =>
	res.json().then(data => (total_comment.textContent = data.l))
)
fetch('/projectnum').then(res =>
	res.json().then(data => (total_project.textContent = data.l))
)

// Search according to the email, then update the form.
function searchFn(e) {
	e.preventDefault()

	const email = search.elements['id'].value
	fetch('/credential/' + email).then(res => {
		if (res.status != 200) {
			window.alert('Please try again.')
			password_display.value = ''
			email_display.value = ''
		} else {
			res.json().then(data => {
				password_display.value = data.p
			})
		}
	})
	email_display.value = email

	fetch('/userinfo/' + email).then(res => {
		if (res.status == 200) {
			res.json().then(data => {
				name_display.value = data.name
				year_display.value = data.year
				rating_display.value = data.rating
			})
		} else {
			search.elements['id'].value = ''
		}
	})
}

// Update password of the user.
function updateFn() {
	const email = email_display.value
	const password = password_display.value
	if (email == '' || password == '') {
		window.alert('Search first please.')
		return
	}
	if (!window.confirm('Do you confirm to update the password?')) {
		return
	}

	fetch('/credential/' + email + '/' + password, {
			method: 'PATCH'
		})
		.then(res => {
			if (res.status != 200) {
				window.alert('Please try again.')
			}
		})
		.catch(err => {})

	window.alert('Credential updated.')
}

// Update the name, year, and rating of the user
function updateInfo() {
	const email = email_display.value
	const name = name_display.value
	const year = year_display.value
	const rating = rating_display.value
	if (name == '' || year == '' || rating == '') {
		window.alert('Try again.')
		return
	}
	if (!window.confirm('Do you confirm to update the info?')) {
		return
	}
	fetch('/user/' + email + '/' + name + '/' + year + '/' + rating, {
			method: 'PATCH'
		})
		.then(res => {
			if (res.status != 200) {
				window.alert('Please try again.')
			}
		})
		.catch(err => {})
	window.alert('Info updated.')
}

// Add course
function courseFn(e) {
	e.preventDefault()
	const course = document.querySelector('#course').value
	const term = document.querySelector('#term').value
	fetch('/course/' + course + '/' + term, {
			method: 'POST'
		})
		.then(res => {
			if (res.status != 200) {
				window.alert('Already in it.')
			} else {
				course.value = ''
				term.value = ''
			}
		})
		.catch(err => {})
}