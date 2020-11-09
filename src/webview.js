document.addEventListener('click', event => {
	const element = event.target;
	if (element.className === 'plugin-test-link') {
		webviewApi.postMessage({
			name: 'scrollToHash',
			hash: element.dataset.slug,
		});
	}
})