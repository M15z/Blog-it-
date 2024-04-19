import express from "express";
import bodyParser from "body-parser";
import { nextTick, title } from "process";
import multer from "multer";
import path from "path";
import axios from "axios";


const app = express();
const port = 3000;
const API_URL = "https://api.unsplash.com";
const clientId = "nvBPekP7MteZROtgLewRzQvy7zPsqZwQkd_1GsS8ZPg";


app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));
app.use('/uploads',express.static("uploads"));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    }
  });
  
  const upload = multer({ storage: storage });




let count =0;
let blogList = [];
let index =0;
let randomSmallURL = "";
app.get("/", (req, res) =>{  
    res.render("index.ejs", {blogList});
});


app.get("/create", (req, res) => {
    res.render("create.ejs");
});
app.post("/create", async (req, res) => {
    try {
        const response = await axios.get(API_URL + "/search/photos", {
            params: {
                client_id: clientId,
                query: req.body.searchWord,
            }
        });
        const photos = response.data.results;
        const randomIndex = Math.floor(Math.random() * photos.length);
        randomSmallURL = photos[randomIndex].urls.small;
        res.render("create.ejs", {images: randomSmallURL});
    } catch (error) {
        console.error("Error occurred while fetching data:", error);
    }
});


app.post("/", upload.single('image'), (req, res) => {
    console.log(randomSmallURL);
    let imeges = randomSmallURL;
    // var imeges = req.file.filename;
    if(imeges.includes("https://images.unsplash.com")){
        imeges = randomSmallURL;
    }else{
        imeges = req.file.filename;
    }
    let time = `${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`;
    const { title, blog } = req.body;
    let count = blogList.length;
    
    let userInput = { time: time, title: title, blog: blog, image: imeges, id: count };
    
    blogList.push(userInput);
    console.log(blogList);
    res.redirect("/");
});

 
app.get("/edit",(req,res) => {
    index = parseInt(req.body.choice);
    res.render("edit.ejs", {blogList});
});
app.get("/edit/0",(req,res) => {
    res.render("edit0.ejs", {blogList});
});
app.post("/edit",(req,res) => {
    index = parseInt(req.body.choice);
    res.render("edit.ejs", {blogList , index});
});


app.post("/edit/0",(req,res) => {
    let time = `${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`;
    console.log(index);
    
    for (let object of blogList) {
        if (object.id === index) {
            if(req.body.blog == ""){
            }else{
                object.blog = req.body.blog;
            }
            if(req.body.title == ""){
            }else{
                object.title = req.body.title;
            }
           
            object.time = time;
        }
    }   
    console.log(req.body.blog);
    res.redirect("/");
});

app.post("/delete",(req,res) => {
     index = parseInt(req.body.ind);
    for (let object of blogList) {
        if (object.id === index) {
            blogList.splice(index, 1);
        }
    }  
    for (let object of blogList) {
        object.id = blogList.indexOf(object);
    } 
    res.redirect("/");
});

 
app.listen(port, () =>{
    console.log(`listening on ${port} `);
});
