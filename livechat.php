<?php

/*
 * ##########################
 *
 *            code
 *      indept of client
 *
 * ##########################
 */



//mcchat mod socket
const MCCHAT_SOCKET = '/run/mcchat/mcchat.sock';

// formats the data to a json both the client and api accepts
function fjson($data) {
	return json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
}

// opens a socket
function mcchat_socket($timeout = 2.0) {
	$errno = 0;
	$errstr = '';
	$socket = @stream_socket_client('unix://' . MCCHAT_SOCKET, $errno, $errstr, $timeout);

	if ($socket === false) {
		http_response_code(503);
		header('Content-Type: application/json');
		echo fjson(['ok' => false, 'error' => "socket {$errstr} ({$errno})"]);
		exit;
	}

	stream_set_timeout($socket, (int) $timeout);
	stream_set_read_buffer($socket, 0);

	return $socket;
}

// to avoid forgetting to flush
function mcchat_send_frame($socket, $frame) {
	fwrite($socket, fjson($frame) . "\n");
	fflush($socket);
}




/*
 * ############################
 *
 *       FILE ENTRY POINT
 *
 * ############################
 */


$action = $_GET['action'] ?? $_POST['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

//Handshake
if ($action === 'hello') {
	if ($method !== 'POST') {
		http_response_code(405);
		exit;
	}

	$socket = mcchat_socket();

	mcchat_send_frame($socket, [
		'type' => 'hello',
		'client' => 'web',
	]);

	stream_set_timeout($socket, 2);
	$line = fgets($socket);
	$reply = $line === false ? null : json_decode(trim($line), true);
	fclose($socket);

	header('Content-Type: application/json');
	echo fjson(['ok' => true, 'reply' => $reply]);
	exit;
}

//send message (web -> minecraft)
if ($action === 'send') {
	if ($method !== 'POST') {
		http_response_code(405);
		exit;
    }

    $body = $_POST['chatmsg'];

	if ($body === '') {
		exit;
	}

	$socket = mcchat_socket();

	mcchat_send_frame($socket, [
		'type' => 'message',
		'body' => $body,
	]);

	fclose($socket);
	exit;
}

//listener (SSE)
if ($action === 'stream') {
	if ($method !== 'GET') {
		http_response_code(405);
		exit;
	}

	@set_time_limit(0);
	@ini_set('zlib.output_compression', '0');

	if (function_exists('apache_setenv')) {
		@apache_setenv('no-gzip', '1');
	}

	while (ob_get_level() > 0) {
		@ob_end_flush();
	}

	header('Content-Type: text/event-stream; charset=utf-8');
	header('Cache-Control: no-cache, no-store, must-revalidate');
	header('Pragma: no-cache');
	header('Connection: keep-alive');
	header('X-Accel-Buffering: no');

	echo "retry: 3000\n\n";
	@flush();

	$errno = 0;
	$errstr = '';
	$socket = @stream_socket_client('unix://' . MCCHAT_SOCKET, $errno, $errstr, 2.0);

	if ($socket === false) {
		echo "event: error\n";
		echo 'data: ' . fjson(['error' => "socket {$errstr} ({$errno})"]) . "\n\n";
		@flush();
		exit;
	}

	stream_set_timeout($socket, 30);

	mcchat_send_frame($socket, [
		'type' => 'hello',
		'client' => 'php-sse',
	]);
	
	//main listen loop (for new messages in chat)
	while (!feof($socket)) {
		$line = fgets($socket);

		if ($line === false) {
			$meta = stream_get_meta_data($socket);

			if (!empty($meta['timed_out'])) {
				echo ": keep-alive\n\n";
				@flush();
				continue;
			}

			break;
		}

		$frame = json_decode(trim($line), true);

		if (!is_array($frame)) {
			continue;
		}

		if (($frame['type'] ?? '') === 'chat') {
			echo 'data: ' . fjson($frame) . "\n\n";
			@flush();
		}
	}

	fclose($socket);
	exit;
}

http_response_code(404);
