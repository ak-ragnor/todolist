//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB",{useNewUrlParser:true});

const itemschema = {
  name : String
};

const Item = mongoose.model("Item", itemschema);

const item1 = new Item({
  name : "Welcome"
});

const item2 = new Item({
  name : "Hit the + button to add a new item"
});

const item3 = new Item({
  name : "<-- Hit this to delete"
});

const defaultItem = [item1,item2,item3];

const listschema ={
  name : String,
  items : [itemschema]
}

const List = mongoose.model('List', listschema);

// Item.insertMany(defaultItem, function(err){
//   if(err){
//     console.log(err);
//   }else{
//     console.log("success - defaultitem inserted");
//   }

// });

app.get("/", function(req, res) {

  Item.find({} , function(err,foundItems){
    if(foundItems.length === 0 ){
      Item.insertMany(defaultItem, function(err){
      if(err){
         console.log(err);
      }else{
         console.log("success - defaultitem inserted");
      }
      });
      render("/");
    }else{
      res.render("list", {listTitle: "today", newListItems: foundItems});
    }
    
  });

});

app.post("/delete",function(req,res){
  const checkId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "today"){
    Item.findByIdAndRemove(checkId,function(err){
      if(!err){
        console.log("sucess- deleted");
        res.redirect("/");
      }
      });
  }else{
    List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkId}}},function(err,foundList){
      if(!err){
       res.redirect("/" + listName);
       console.log("sucess - deleted from lit");
      }
    });
  }
  
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name : itemName
  });

  if(listName === "today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
  
});

app.get("/:customListName", function(req,res){
   const customListName = _.capitalize(req.params.customListName);

   List.findOne({name: customListName}, function(err, foundList){
    if(!err){
      if(!foundList){

        const list = new List({
          name : customListName,
          items : defaultItem
        });

        list.save();
        res.redirect("/" + customListName);

      }else{
        res.render("list", {listTitle: foundList.name , newListItems: foundList.items});
      }
    }
   });
});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
