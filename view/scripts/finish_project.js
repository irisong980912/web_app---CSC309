const log = console.log

/* Select all DOM form elements*/
const min_rating_display_label = document.getElementsByClassName('min_rating_v')
const min_rating_input = document.getElementsByClassName('min_rating_input')

/* Event listeners for rating input and change the score display for the teammates */
for (let i = 0; i < min_rating_display_label.length; i++) {
	min_rating_input[i].addEventListener('input',
		function (e) {
			e.preventDefault();
			min_rating_display_label[i].firstChild.replaceWith(
				document.createTextNode(e.target.value)
			);
		});
}

/* select all information needed */
const emails = document.getElementsByClassName('grey');
const contents = document.getElementsByClassName('message');
const flags = document.getElementsByClassName('check');

/* save comment to database */
async function save_comment(e) {
	e.preventDefault()
	//retrieve the project id from the local storage
	const project_id = localStorage['project_id'];

	let promises = [];
	const url = '/finish_project/' + project_id;

	// for each teammate, save one corresponding comment
	for (let i = 0; i < emails.length; i++) {

		// set the flag to 1 if the user choose to comment anynomously
		let cur_flag = 0;
		if (flags[i].checked) {
			cur_flag = 1;
		}

		const email = emails[i].innerHTML;
		const content = contents[i].value;
		const rating = min_rating_input[i].value;

		await promises.push(sendRequest(url, project_id, email, content, rating, cur_flag));

	}

	await Promise.all(promises).then(() => {
		//When all promises are donde, this code is executed;
	});

	// remove the item from local storage
	localStorage.removeItem('project_id');

	const temp = window.alert("Congradulations on your finished project!")
	if (temp || !temp) {
		location.href = '/projects';
	}
}

function sendRequest(url, project_id, email, content, rating, cur_flag) {
	let data = {

		project_id: project_id,
		receiver_email: email,
		content: content,
		rating: rating,
		flag: cur_flag
	}

	const request = new Request(url, {
		method: 'put',
		body: JSON.stringify(data),
		headers: {
			'Accept': 'application/json, text/plain, */*',
			'Content-Type': 'application/json'
		}
	});

	return new Promise((resolve, reject) => {
		fetch(request).then((res) => {
			resolve(res);
			// does not respond since not all comments are saved at this time
		}).catch((error) => {
			reject(error);
		})
	});
}

const sleep = (milliseconds) => {
	return new Promise(resolve => setTimeout(resolve, milliseconds))
}