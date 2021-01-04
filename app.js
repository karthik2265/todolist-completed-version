const express = require('express');
const bodyParser = require('body-parser');
const date = require(__dirname + "/date.js");
// console.log(date.getDate());
const app = express();
const mongoose = require("mongoose");
const _ = require("lodash");



app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public")); -

mongoose.connect("mongodb+srv://admin-karthik:nine5zero2@cluster0.gapsm.mongodb.net/todolistDB?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "welcome to your todo list."
});

const item2 = new Item({
  name: "hit the + button to add a new item."
});

const item3 = new Item({
  name: "<-- hit this to delete an item."
});

const defaultItems = [item1, item2, item3]

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List", listSchema)


// to empty the items collections uncomment this code
// Item.deleteMany({}, function(err){
// if (err) {
// console.log(err)
// }
// else {
// console.log("succesfully deleted all items")
// }
// })


app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems) {

    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err)
        } else {
          console.log("successfully saved default items to DB.");
        }
      });
      res.redirect("/")
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: foundItems
      });

    }

  });
  // let day = date.getDate();
});

app.get("/:customListName", function(req, res) {
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({
    name: customListName
  }, function(err, foundList) {
    if (!err) {
      if (!foundList) {
        // create new list
        const list = new List({
          name: customListName,
          items: defaultItems
        })
        list.save();
        res.redirect("/" + customListName)
      } else {
        // show an existing list
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items
        })
      }
    }

  })

});

app.post("/", function(req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  })

  if (listName == "Today") {
    item.save()
    res.redirect("/")
  } else {
    List.findOne({
      name: listName
    }, function(err, foundList) {
      foundList.items.push(item)
      foundList.save();
      res.redirect("/" + listName)
    })
  }



});

app.post("/delete", function(req, res) {

  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName=="Today") {
    Item.findByIdAndRemove(checkedItemId, function(err){
      if (err){
        console.log(err)
      } else {
        console.log("successfuly deleted the item")
      }
    });
    res.redirect("/")
  } else {
    List.findOneAndUpdate({name: listName}, {$pull:{items: {_id : checkedItemId}}}, function(err, foundList){
      if (!err) {
        res.redirect("/"+listName)
      }
    });
  }


});



app.get("/work", function(req, res) {
  res.render("list", {
    listTitle: "work list",
    newListItems: workItems
  });
});

app.post("/work", function(req, res) {
  let item = req.body.newItem;
  workItems.push(item);
  res.redirect("/work");
});

app.get("/about", function(req, res) {
  res.render("about")
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000
}

app.listen(port, function() {
  console.log("server has started")
});
