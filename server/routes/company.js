const router = require("express").Router();
const mongoose = require("mongoose");
const User = require("../models/User.model");
const Company = require("../models/Company.model")
const Session = require("../models/Session.model");

const isLoggedIn = require("../middleware/isLoggedIn");

router.post("/create", isLoggedIn, async (req, res) => {
  const accessToken = req.headers.authorization
  const {name, foundationDate, fiscalCode, email} = req.body
  try {
    const session = await Session.findById(accessToken).populate("user");
    const user = session.user
  
    if (!email) {
      return res
        .status(400)
        .json({ errorMessage: "Please provide the email." });
    }
    if (!name) {
      return res.status(400).json({errorMessage: "Please provide a name for your company"})
    }
    Company.findOne({email }).then((found) => {
      if (found) {
        return res.status(400).json({ errorMessage: "This company has already an account." })
      } 
    })
      if (name && foundationDate && fiscalCode && email) {
        const newCompany = await Company.create({
          name: name,
          foundationDate: foundationDate,
          fiscalCode: fiscalCode,
          email: email,
          user: user._id,
        })
        return res.status(200).json(newCompany);
      } else {
        return res.status(400).json({ errorMessage: "Please fill all the information required" })
      } 
  } catch (err) {
        if (error instanceof mongoose.Error.ValidationError) {
          return res.status(400).json({ errorMessage: error.message })
        }
        if (error.code === 11000) {
          return res.status(400).json({
            errorMessage:
            "Email need to be unique. The company you chose has already an user owner, please contact your boss.",
          });
        }
        return res.status(500).json({ errorMessage: error.message })
  }
})
 

module.exports = router