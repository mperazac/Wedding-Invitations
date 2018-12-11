<?php

//if posting only
if(isset($_POST['submit'])) {

		$to = 'mperazac@yahoo.com, jeslynflores@hotmail.com'; // Change this line to your email.
		
		$name = isset($_POST['name']) ? trim($_POST['name']) : '';
		$email = isset($_POST['email']) ? trim($_POST['email']) : '';
		$message = isset($_POST['comment']) ? trim($_POST['comment']) : '';
		$subject = 'Mensaje desde Mau y Jesy website';
		
		if($name && $email && filter_var($email, FILTER_VALIDATE_EMAIL)) {
			$headers  = 'MIME-Version: 1.0' . "\r\n";
			$headers .= 'Content-type: text/html; charset=iso-8859-1' . "\r\n";
			$headers .= "From: Mau & Jesy Website <no-replay@" . $_SERVER['SERVER_NAME'] . ">\r\n";
			
			//$message .= 'New Guestbook Form Submission<br />';
			$message .= ' <br /> Nombre: ' . $name;
			$message .= ' <br /> Email: ' . $email;
			
			@$send = mail($to, $subject, $message, $headers);
			
			if($send) {
				$return['type'] = 'success';
				$return['message'] = 'Mensaje enviado.';
			} else {
				$return['message'] = 'Error enviando mensaje.';
			}
		} else {
			$return['message'] = 'Error validando email.';
		}
	
	die(json_encode($return));
}else{
	debug_to_console("Submit is not set");
}



?>