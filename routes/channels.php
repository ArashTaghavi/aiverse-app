<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('chat-with-document.users.{ownerId}', function ($user, $ownerId) {
    return (int) $user->id === (int) $ownerId;
});
