document.addEventListener('DOMContentLoaded', () => {
	const rpi = new EventSource('livechat.php?action=stream');
	
	rpi.onmessage = (event) => {
		console.log('SSE :', event.data);
	};
	
	rpi.onerror = () => {
		console.warn('SSE disconnected, attempting reconnection...');
	};

	//Handshake
	fetch('livechat.php?action=hello', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ type: 'hello' }),
	})
	.then((response) => response.json())
	.then((data) => console.log('handshake reply:', data))
	.catch((error) => console.error('handshake failed:', error));

	// DEV : TEST MSG
	setTimeout(() => {
		fetch('livechat.php?action=send', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				type: 'message',
				body: 'hello world',
			}),
		})
		.then((response) => response.json())
		.then((data) => console.log('send reply:', data))
		.catch((error) => console.error('send failed:', error));
	}, 10000);
});
