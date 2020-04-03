var express = require("express");
var router  = express.Router({mergeParams: true});
var Club = require("../models/club");
var Comment = require("../models/comment");
var middleware = require("../middleware");

//Comments New
router.get("/new", middleware.isLoggedIn, function(req, res){
    // find club by id
    Club.findById(req.params.id, function(err, club){
        if(err){
            console.log(err);
        } else {
             res.render("comments/new", {club: club});
        }
    })
});

//Comments create
router.post("/", middleware.isLoggedIn,function(req, res){
   //lookup club using ID
   Club.findById(req.params.id, function(err, club){
       if(err){
           console.log(err);
           res.redirect("/clubs");
       } else {
        Comment.create(req.body.comment, function(err, comment){
           if(err){
               req.flash("error", "Something went wrong");
               console.log(err);
           } else {
                //add username and id to comment
               comment.author.id = req.user._id;
               comment.author.username = req.user.username;
               //save comment
               comment.save();
               club.comments.push(comment);
               club.save();
               console.log(comment);
               req.flash("success", "Successfully added comment");
               res.redirect('/clubs/' + club._id);
           }
        });
       }
   });
});

// COMMENT EDIT ROUTE
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
   Club.findById(req.params.id, function(err, foundClub) {
       if(err || !foundClub) {
           req.flash("error", "Club not found!");
           return res.redirect("back");
       }
      Comment.findById(req.params.comment_id, function(err, foundComment){
        if(err){
          res.redirect("back");
        } else {
            res.render("comments/edit", {club_id: req.params.id, comment: foundComment});
        }
    });
   });
});

// COMMENT UPDATE
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
   Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
      if(err){
          res.redirect("back");
      } else {
          res.redirect("/clubs/" + req.params.id );
      }
   });
});

// COMMENT DESTROY ROUTE
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    //findByIdAndRemove
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
       if(err){
           res.redirect("back");
       } else {
           req.flash("success", "Comment deleted");
           res.redirect("/clubs/" + req.params.id);
       }
    });
});

module.exports = router;