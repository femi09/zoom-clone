import express from "express";
const app = express();

app.set("view engine", "ejs")

app.get("/", (req, res) => {
    res.render("room")
})


const port = process.env.PORT || 3030;
app.listen(port, () => console.log(`listening at port ${port}`));
