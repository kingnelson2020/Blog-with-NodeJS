require("dotenv").config();

const express = require("express");
const expressLayout = require("express-ejs-layouts");
const methodOverride = require("method-override"); //to use http verbs such as PUT or DELETE
const cookieParser = require("cookie-parser"); //grab cookies,save cookies...for storing session when we login
const MongoStore = require("connect-mongo");

//db require
const connectDB = require("./server/config/db");
const { isActiveRoute } = require("./server/helpers/routehelpers");
const session = require("express-session");

//create express app
const app = express();
const PORT = 5000 || process.env.PORT;

//connect to database
connectDB();

/* MIDDLE WARES */
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
//cookieparser
app.use(cookieParser());
app.use(methodOverride("_method"));

app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
    }),
  })
);

//public folder
app.use(express.static("public"));

//templating engine
app.use(expressLayout);
app.set("layout", "./layouts/main");
app.set("view engine", "ejs");
app.locals.isActiveRoute = isActiveRoute;

/* ROUTES */
/*
 ** GET
 */
app.use("/", require("./server/routes/main"));
app.use("/", require("./server/routes/admin"));

/*
 ** SEARCH
 */

//app listening
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
