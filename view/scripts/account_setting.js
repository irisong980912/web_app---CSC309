const log = console.log

function change_info() {
	const new_name = document.querySelector('#new_name').value
	const new_psd = document.querySelector('#new_password').value
	const new_intro = document.querySelector('#new_intro').value
	const new_icon = document.querySelector('#new_icon').value

	const url = '/change_info'
	let data = {
		new_name: new_name,
		new_intro: new_intro,
		new_icon: new_icon,
		new_psd: new_psd
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
			window.location.href = '/dashboard'
		})
		.catch(error => console.log(error))
}