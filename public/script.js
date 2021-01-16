const socket = io("/"); //calling the socket IO server
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
myVideo.muted = true;
const peers = {};

// initializing the peerjs library
const peer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: "443",
});

let myVideoStream;

// using the navigator api to get reference to our webcam to display our stream.
// We append the stream to our video element

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    // answering the call and allow stream to show in the other user's browser
    // by binding the an event on the peer object when the user is there
    peer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on("user-connected", (userId) => {
      console.log("User Connected " + userId);
      connectToNewUser(userId, stream);
    });
  });

socket.on("user-disconnected", (userId) => {
  if (peers[userId]) peers[userId].close();
});

// when the peer js has an open connection. We emit an event passing the current roomId
// and the current id of the user
peer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id);
});

const connectToNewUser = (userId, stream) => {
  // using the peerjs call method to call the other user with the userId
  // and also passing our own stream
  const call = peer.call(userId, stream);
  // we are creating another video element and when the call is successful
  // we are again adding the stream to our video element
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
  // removing the video when the call is stopped
  call.on("close", () => {
    video.remove();
  });
  peers[userId] = call;
};

// appending the stream to our video element
const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
};

let text = $("input");

$("html").keydown((e) => {
  if (e.which == 13 && text.val().length !== 0) {
    console.log(text.val());
    socket.emit("message", text.val());
    text.val("");
  }
});

socket.on("createMessage", (message) => {
  $("ul").append(`<li class="message"><b>user</b><br/>${message}</li>`);
  scrollToBottom = () => {
    let d = $(".main__chat_window");
    d.scrollTop(d.prop("scrollHeight"));
  };
});

// Mute Video
const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnMuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
};

const setMuteButton = () => {
  const html = `<i class="fas fa-microphone"></i>
      <span>Mute</span>
      `;
  document.querySelector(".main__mute_button").innerHTML = html;
};

const setUnMuteButton = () => {
  const html = `<i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
    `;
  document.querySelector(".main__mute_button").innerHTML = html;
};

// Stop Video
const playStop = () => {
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo();
  } else {
    setStopVideo();
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
};

const setStopVideo = () => {
  const html = `<i class="fas fa-video"></i>
    <span>Stop Video</span>
    `;
  document.querySelector(".main__video_button").innerHTML = html;
};

const setPlayVideo = () => {
  const html = `<i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
    `;
  document.querySelector(".main__video_button").innerHTML = html;
};
