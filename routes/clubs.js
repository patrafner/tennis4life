var express = require("express");
var router  = express.Router();
var Club = require("../models/club");
var middleware = require("../middleware");
var NodeGeocoder = require('node-geocoder');
 
var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
 
var geocoder = NodeGeocoder(options);

//INDEX - show all campgrounds
router.get("/", function(req, res){
    // Get all clubs from DB
    Club.find({}, function(err, allClubs){
       if(err){
           console.log(err);
       } else {
          res.render("clubs/index",{clubs:allClubs, page: "clubs"});
       }
    });
});


// //CREATE - add new campground to DB with google API
// router.post("/", middleware.isLoggedIn, function(req, res){
//   // get data from form and add to campgrounds array
//   var name = req.body.name;
//   var image = req.body.image;
//   var cost = req.body.cost;
//   var desc = req.body.description;
//   var author = {
//       id: req.user._id,
//       username: req.user.username
//   }
//   geocoder.geocode(req.body.location, function (err, data) {
//     if (err || !data.length) {
//       req.flash('error', 'Invalid address');
//       return res.redirect('back');
//     }
//     var lat = data[0].latitude;
//     var lng = data[0].longitude;
//     var location = data[0].formattedAddress;
//     var newClub = {name: name, image: image, cost: cost, description: desc, author:author, location: location, lat: lat, lng: lng};
//     // Create a new campground and save to DB
//     Club.create(newClub, function(err, newlyCreated){
//         if(err){
//             console.log(err);
//         } else {
//             //redirect back to campgrounds page
//             console.log(newlyCreated);
//             res.redirect("/clubs");
//         }
//     });
//   });
// });

//CREATE - add new club to DB
router.post("/", middleware.isLoggedIn, function(req, res){
    // get data from form and add to clubs array
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var location = req.body.location;
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    var newClub = {name: name, image: image, description: desc, author: author, location: location}
    // Create a new club and save to DB
    Club.create(newClub, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to clubs page
            res.redirect("/clubs");
        }
    });
});



//NEW - show form to create new club
router.get("/new", middleware.isLoggedIn, function(req, res){
   res.render("clubs/new"); 
});

// SHOW - shows more info about one club
router.get("/:id", function(req, res){
    //find the club with provided ID
    Club.findById(req.params.id).populate("comments").exec(function(err, foundClub){
        if(err || !foundClub){
            req.flash("error", "Club not found!");
            res.redirect("back");
        } else {
            console.log(foundClub)
            //render show template with that club
            res.render("clubs/show", {club: foundClub});
        }
    });
});

// EDIT CLUB ROUTE
router.get("/:id/edit", middleware.checkClubOwnership, function(req, res){
    Club.findById(req.params.id, function(err, foundClub){
        res.render("clubs/edit", {club: foundClub});
    });
});



// // UPDATE CLUB ROUTE google API
// router.put("/:id", middleware.checkClubOwnership, function(req, res){
//   geocoder.geocode(req.body.location, function (err, data) {
//     if (err || !data.length) {
//       req.flash('error', 'Invalid address');
//       return res.redirect('back');
//     }
//     req.body.club.lat = data[0].latitude;
//     req.body.club.lng = data[0].longitude;
//     req.body.club.location = data[0].formattedAddress;

//     Club.findByIdAndUpdate(req.params.id, req.body.club, function(err, club){
//         if(err){
//             req.flash("error", err.message);
//             res.redirect("back");
//         } else {
//             req.flash("success","Successfully Updated!");
//             res.redirect("/clubs/" + club._id);
//         }
//     });
//   });
// });

// UPDATE CLUB ROUTE
router.put("/:id",middleware.checkClubOwnership, function(req, res){
    // find and update the correct club
    Club.findByIdAndUpdate(req.params.id, req.body.club, function(err, updatedClub){
       if(err){
           res.redirect("/clubs");
       } else {
           //redirect somewhere(show page)
           res.redirect("/clubs/" + req.params.id);
       }
    });
});

// DESTROY CLUB ROUTE
router.delete("/:id",middleware.checkClubOwnership, function(req, res){
   Club.findByIdAndRemove(req.params.id, function(err){
      if(err){
          res.redirect("/clubs");
      } else {
          res.redirect("/clubs");
      }
   });
});

module.exports = router;