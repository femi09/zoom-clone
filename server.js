import express from "express";
const app = express();

app.get("/", (req, res) => {
    res.status(200).send("Hello World")
})


const port = process.env.PORT || 3030;
app.listen(port, () => console.log(`listening at port ${port}`));
