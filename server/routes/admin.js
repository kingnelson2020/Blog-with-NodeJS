const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const User = require("../models/User");
const bcrypt = require("bcrypt"); //decrypt password to store in db
const jwt = require("jsonwebtoken");

const adminLayout = "../views/layouts/admin"; //pass inside render(without this render pages for get methods will display correctly)
const jwtSecret = process.env.JWT_SECRET;
/*
 ** Middleware function
 **Check login
 */
const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

/*
 ** GET
 **Admin login page
 */

router.get("/admin", async (req, res) => {
  try {
    //title and description
    const locals = {
      title: "Admin",
      description: "Blog created with Node, Express & MongoDB",
    };

    res.render("admin/login", { locals, layout: adminLayout });
  } catch (error) {
    console.log(error);
  }
});

/*
 ** POST
 **Admin Check login
 */

router.post("/admin", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: "Inavlid Credentials" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    const token = jwt.sign({ userId: user._id }, jwtSecret);
    res.cookie("token", token, { httpOnly: true });

    res.redirect("/dashboard");

    res.redirect("/admin");
  } catch (error) {
    console.log(error);
  }
});

/*
 ** GEt
 **Admin dashboard
 */
//authMiddleware will not allow unauthorized user access
router.get("/dashboard", authMiddleware, async (req, res) => {
  try {
    //title and description
    const locals = {
      title: "Dashboard",
      description: "Blog created with Node, Express & MongoDB",
    };

    const data = await Post.find();

    res.render("admin/dashboard", {
      locals,
      data,
      layout: adminLayout,
    });
  } catch (error) {
    console.log(error);
  }
});

/*
 ** GET
 **Admin create new post
 */
router.get("/add-post", authMiddleware, async (req, res) => {
  try {
    //title and description
    const locals = {
      title: "Add Post",
      description: "Blog created with Node, Express & MongoDB",
    };

    const data = await Post.find();

    res.render("admin/add-post", {
      locals,
      layout: adminLayout,
    });
  } catch (error) {
    console.log(error);
  }
});

/*
 ** POST
 **Admin create new post
 */
router.post("/add-post", authMiddleware, async (req, res) => {
  try {
    try {
      const newPost = new Post({
        title: req.body.title,
        body: req.body.body,
      });

      await Post.create(newPost);
      res.redirect("/dashboard");
    } catch (error) {
      console.log(error);
    }
  } catch (error) {
    console.log(error);
  }
});

/*
 ** GET
 **Admin Edit post
 */

router.get("/edit-post/:id", authMiddleware, async (req, res) => {
  try {
    //title and description
    const locals = {
      title: "Edit Post",
      description: "Blog created with Node, Express & MongoDB",
    };

    const data = await Post.findOne({ _id: req.params.id });

    res.render("admin/edit-post", {
      locals,
      data,
      layout: adminLayout,
    });
  } catch (error) {
    console.log(error);
  }
});

/*
 ** PUT
 **Admin Edit post
 */
router.put("/edit-post/:id", authMiddleware, async (req, res) => {
  try {
    try {
      await Post.findByIdAndUpdate(req.params.id, {
        title: req.body.title,
        body: req.body.body,
        updatedAt: Date.now(),
      });
      res.redirect(`/edit-post/${req.params.id}`);
    } catch (error) {}
  } catch (error) {
    console.log(error);
  }
});

/*
 ** DELETE
 **Admin Edit post
 */
router.delete("/delete-post/:id", authMiddleware, async (req, res) => {
  try {
    await Post.deleteOne({ _id: req.params.id });
    res.redirect("/dashboard");
  } catch (error) {
    console.log(error);
  }
});
/*
 ** 
 **LOGOUT
 */
router.get('/logout', (req,res)=>{
    res.clearCookie('token');
    //res.json({message: 'Logout successful'});
    res.redirect('/');
})





/*
 ** POST
 **Admin register
 */

router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    //hash password
    const hashPassword = await bcrypt.hash(password, 10);

    try {
      const user = await User.create({ username, password: hashPassword });
      res.status(201).json({ message: "User Created", user });
    } catch (error) {
      if (error.code === 11000) {
        res.status(409).json({ message: "User already in use" });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
