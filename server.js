import express from "express";
import { v4 as uuidv4} from "uuid"
const app = express();

app.set("view engine", "ejs")
app.use(express.static("public"))

app.get("/:room", (req, res) => {
    res.render("room", {roomId: req.params.room})
})

app.get("/", (req, res) => {
    res.redirect(`/${uuidv4()}`); //the route automatically generate a uuid and and redirects to it
})


const port = process.env.PORT || 3030;
app.listen(port, () => console.log(`listening at port ${port}`));
