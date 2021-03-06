import express from "express";
import { v4 as uuidv4 } from "uuid";
import peer from "peer";
import http from "http";
import { Server } from "socket.io";

const app = express();

const server = new http.Server(app);
const io = new Server(server);

const { ExpressPeerServer } = peer;

const peerServer = ExpressPeerServer(server, {
  debug: true,
});

app.set("view engine", "ejs");
app.use(express.static("public"));

app.use("/peerjs", peerServer);
app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

app.get("/", (req, res) => {
  res.redirect(`/${uuidv4()}`); //the route automatically generate a uuid and and redirects to it
});

io.on("connection", (socket) => {
  //an event for when the user  joins the room. We broadcast to all user except 
  // the user that's sending the information. We emit an event and pass the id of the connected user
  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).broadcast.emit("user-connected", userId);

    //an event for when the user is disconnected. We broadcast to all user except 
    // the user that's disconnected. We emit an event and pass the id of the disconnected user
    socket.on("disconnect", () => {
        socket.to(roomId).broadcast.emit("user-disconnected", userId);
      });
      
    socket.on("message", (message) => {
      io.to(roomId).emit("createMessage", message);
    });

    
  });
});

const port = process.env.PORT || 3030;
server.listen(port, () => console.log(`listening at port ${port}`));
