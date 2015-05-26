var app = {};
var messages;
var rooms = {};
var friends = {};
var preferences = {
  filtering: false,
  currentRoom: null
};


app.init = function(){};

app.clearMessages = function() {
  $('#chats').empty();
};

app.fetch = function() {
    $.ajax({
      url: 'https://api.parse.com/1/classes/chatterbox',
      type: 'GET',
      contentType: 'application/json; charset=UTF-8',
      success: function(data) {
        messages = data.results;
        // console.log(messages);
        app.showNewMessages();
      }
    });
};

app.send = function() {
    // debugger;
    var message = {
      'username': $('#username-input').val(),
      'text': $('#message-input').val(),
      'roomname': $('#room-input').val()
    };
    if(message.roomname === '') {
      message.roomname = preferences.currentRoom;
    } else {
      preferences.currentRoom = message.roomname;
    }
    if(message.username === '') {
      $('#current-name').text('Anonymous User');
      message.username = 'anonymous';
    } else {
      $('#current-name').text('User: ' + message.username);
    }
    $('#username-input').val('');
    $('#message-input').val('');
    $('#room-input').val('');
    $.ajax({
      // always use this url
      url: 'https://api.parse.com/1/classes/chatterbox',
      type: 'POST',
      data: JSON.stringify(message),
      contentType: 'application/json',
      success: function (data) {
        console.log('chatterbox: Message sent');
        messages.unshift(message);
        app.showNewMessages();
      },
      error: function (data) {
        // see: https://developer.mozilla.org/en-US/docs/Web/API/console.error
        console.error('chatterbox: Failed to send message');
      }
    });
};

app.showNewMessages = function() {
  //clear chats
  app.clearMessages();
  //add new messages
  _.each(messages, function(message) {
    app.addRoom(message.roomname);
    if (preferences.filtering) {
      if (message.roomname === preferences.currentRoom) {
        var $message = app.addMessage(message);
        $('#current-room').text('Viewing ' + preferences.currentRoom);
      }
    } else {
      var $message = app.addMessage(message);
    }
  });
};

app.addMessage = function(message) {
  var $message = $('<div class="chat"></div>');
  $message.append('<div class="time-stamp">' + moment(message.createdAt).fromNow() + '</div>');//.text(moment(message.createdAt).fromNow());
  $message.append('<div class="username">' + _.escape(message.username) + '</div>');//.text(message.username).html();
  $message.append('<div class="room">' + _.escape(message.roomname) + '</div>');//.text(message.roomname).html();
  $message.append('<div class="message-text">' + _.escape(message.text) + '</div>');//.text(message.text).html();
  if(friends[message.username]) {
    $message.addClass('friend');
  }
  $('#chats').append($message);
  return $message;
};

app.addRoom = function(room) {
  if(!rooms.hasOwnProperty(room)) {
    rooms[room] = true;
    $('#chat-rooms').append('<div class="room">' + _.escape(room) + '</div>');
  }
};

app.addFriend = function() {
  var name = $(this).text();
  $(this).closest('.chat').addClass('friend');
  if (!friends.hasOwnProperty(name)) {
    friends[name] = true;
  } else {
    delete friends[name];
  }
  $('#friend-list').empty().text('Friends');
  _.each(friends, function(friend, key) {
    $('#friend-list').append('<div class="friend">' + _.escape(key) + '</div>');
  })
  app.showNewMessages();
};

$(document).ready(function() {

  app.fetch();
  setInterval(app.fetch, 5000);

  // var showNewMessages =

  $('#add-message').on('click', app.send);

  $('#filter').on('click', function() {
    preferences.filtering = true;
    $('#current-room').text('Viewing ' + preferences.currentRoom);
    app.showNewMessages();
  });

  $('#show-all').on('click', function() {
    preferences.filtering = false;
    $('#current-room').text('Viewing All Messages');
    app.showNewMessages();
  });

  $('body').on('click', '.username', app.addFriend);
});

