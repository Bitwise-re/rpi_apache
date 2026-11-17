document.addEventListener('DOMContentLoaded', () => {
	const chatLive = document.getElementById('chat-live');

	// new chat line
	function appendChat(text) {
		const p = document.createElement('p');
		p.textContent = text;
		chatLive.append(p);

	    const BOTTOM_TOLERANCE = 40; // px, absorbs line-height / sub-pixel rounding
        // If scrolled up, leave scrollTop untouched: older messages keep their
		// position and new ones accumulate below without disturbing the view.
		if(chatLive.scrollHeight - chatLive.scrollTop - chatLive.clientHeight <= BOTTOM_TOLERANCE)
        {
			chatLive.scrollTop = chatLive.scrollHeight; // follow the newest message
		}
	}

	const rpi = new EventSource('livechat.php?action=stream');
	
	rpi.onmessage = (event) => {
		console.log('SSE :', event.data);
        var data = JSON.parse(event.data);
        if (data.type !== "chat") { return; } //only act on chatm
        appendChat(data.text);
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

    //resets the chat input when msg sent
    document.querySelector('.minecraft-chat form')
    .addEventListener('submit', function () {
        setTimeout(() => { //set timeout to fire after the form is sent
            this.reset();
        }, 0);
    });
});
