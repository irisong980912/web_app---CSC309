const log = console.log

function addCourse() {
	if (document.querySelector('#courseCode').value == '') {
		alert('Invalid course code.')
		return
	}

	const url = '/addCourse'
	let data = {
		course: document.querySelector('#courseCode').value
	}
	const request = new Request(url, {
		method: 'put',
		body: JSON.stringify(data),
		headers: {
			Accept: 'application/json, text/plain, */*',
			'Content-Type': 'application/json'
		}
	})
	fetch(request)
		.then(res => {
			if (res.status != 400) {
				addCourseDom(document.querySelector('#courseCode').value)
			} else {
				window.alert('You already have this course added.')
			}

			document.querySelector('#coursecode').value = ''
		})
		.catch(error => {})
}

function addSkill() {
	if (document.querySelector('#newSkill').value == '') {
		alert('Invalid skill.')
		return
	}

	const url = '/addSkill'
	let data = {
		skill: document.querySelector('#newSkill').value
	}
	const request = new Request(url, {
		method: 'put',
		body: JSON.stringify(data),
		headers: {
			Accept: 'application/json, text/plain, */*',
			'Content-Type': 'application/json'
		}
	})
	fetch(request)
		.then(res => {
			if (res.status == 400) {
				window.alert('You already have this skill.')
			} else {
				addNewSkillDom(document.querySelector('#newSkill').value)
			}
			document.querySelector('#newskill').value = ''
		})
		.catch(error => {})
}

function addCourseDom(course) {
	const row = document.createElement('li')

	const newProject = document.createElement('span')
	newProject.classList.add('projectName')

	row.appendChild(newProject)

	newProject.appendChild(document.createTextNode(course))
	pastProjectList = document.querySelector('#pastProjectList')

	const placeholder = pastProjectList.querySelector('h5')
	if (placeholder !== null) {
		pastProjectList.removeChild(placeholder)
	}

	pastProjectList.querySelector('ul').appendChild(row)
}

function addNewSkillDom(newSkill) {
	const chip = document.createElement('span')
	chip.classList.add('skillChip')
	chip.innerHTML = newSkill

	const skillList = document.querySelector('#skillList')
	const placeholder = skillList.querySelector('h5')
	if (placeholder !== null) {
		skillList.removeChild(placeholder)
	}
	skillList.appendChild(chip)
}