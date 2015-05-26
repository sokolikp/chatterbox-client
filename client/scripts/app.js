// var app = {};
var messages;
var friends = {};
var preferences = {
  filtering: false,
  currentRoom: null
};

$(document).ready(function() {

  $.ajax({
      url: 'https://api.parse.com/1/classes/chatterbox',
      type: 'GET',
      contentType: 'application/json; charset=UTF-8',
      success: function(data) {
        messages = data.results;
        // console.log(messages);
        showNewMessages();
      }
    });

  setInterval(function() {
    $.ajax({
      url: 'https://api.parse.com/1/classes/chatterbox',
      type: 'GET',
      contentType: 'application/json; charset=UTF-8',
      success: function(data) {
        messages = data.results;
        showNewMessages();
      }
    });
  }, 5000);

  var showNewMessages = function() {
    //clear feed
    $('#feed').empty();
    //add new messages
    _.each(messages, function(message) {
      if (preferences.filtering) {
        if (message.roomname === preferences.currentRoom) {
          var $message = $('<div class="chat"></div>');
          $message.append('<div class="timeStamp">' + moment(message.createdAt).fromNow() + '</div>');//.text(moment(message.createdAt).fromNow());
          $message.append('<div class="username">' + _.escape(message.username) + '</div>');//.text(message.username).html();
          $message.append('<div class="room">' + _.escape(message.roomname) + '</div>');//.text(message.roomname).html();
          $message.append('<div class="messageText">' + _.escape(message.text) + '</div>');//.text(message.text).html();
          if(friends[message.username]) {
            $message.addClass('friend');
          }
          $('#feed').append($message);
        }
      } else {
        var $message = $('<div class="chat"></div>');
        $message.append('<div class="timeStamp">' + moment(message.createdAt).fromNow() + '</div>');
        $message.append('<div class="username">' + _.escape(message.username) + '</div>');//.text(message.username).html();
        $message.append('<div class="room">' + _.escape(message.roomname) + '</div>');//.text(message.roomname).html();
        $message.append('<div class="messageText">' + _.escape(message.text) + '</div>');//.text(message.text).html();
        if(friends[message.username]) {
          $message.addClass('friend');
        }
        $('#feed').append($message);
      }
    });
  };

  $('#addMessage').on('click', function() {
    var message = {
      'username': $('#userNameInput').val(),
      'text': $('#messageInput').val(),
      'roomname': $('#roomInput').val()
    };
    if(message.roomname === '') {
      message.roomname = preferences.currentRoom;
    } else {
      preferences.currentRoom = message.roomname;
    }
    if(message.username === '') {
      $('#currentName').text('Anonymous User');
      message.username = 'anonymous';
    } else {
      $('#currentName').text('User: ' + message.username);
    }
    $('#userNameInput').val('');
    $('#messageInput').val('');
    $('#roomInput').val('');
    $.ajax({
      // always use this url
      url: 'https://api.parse.com/1/classes/chatterbox',
      type: 'POST',
      data: JSON.stringify(message),
      contentType: 'application/json',
      success: function (data) {
        console.log('chatterbox: Message sent');
        messages.unshift(message);
        showNewMessages();
      },
      error: function (data) {
        // see: https://developer.mozilla.org/en-US/docs/Web/API/console.error
        console.error('chatterbox: Failed to send message');
      }
    });
  });

  $('#filter').on('click', function() {
    preferences.filtering = true;
    $('#currentRoom').text('Viewing ' + preferences.currentRoom);
    showNewMessages();
  });

  $('#showAll').on('click', function() {
    preferences.filtering = false;
    $('#currentRoom').text('Viewing All Messages');
    showNewMessages();
  });

  $('body').on('click', '.username', function() {
    console.log('hi');
    var name = $(this).text();
    console.log('clicked ', name);
    $(this).closest('.chat').addClass('friend');
    friends[name] = true;
    showNewMessages();
  });

});

