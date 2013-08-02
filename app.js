
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , fs = require('fs')
  , thumb = require('node-thumbnail').thumb
  , Thumbbot = require('thumbbot')
  , easyimg = require('easyimage')
  , Thumbnail = require('thumbnail')
  , path = require('path');

var app = express();
var ArticleProvider = require('./articleprovider-mongodb').ArticleProvider;

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser({uploadDir:'./uploads'}));
app.use(express.methodOverride());
app.use(app.router);
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

var articleProvider= new ArticleProvider('localhost', 27017);

app.get('/', function(req, res){
    articleProvider.findAll( function(error,docs){
            res.render('index.jade', {title: 'Blog', articles:docs});
      })});

app.get('/blog/new', function(req, res) {
    res.render('blog_new.jade', { //locals: {
        title: 'New Post'
   // }
    });
});

app.get('/playground', function(req, res) {
  res.render('playground.jade', {});
 /*  var thumbnail = new Thumbnail('./public/images', './public/images/thumbs');
  thumbnail.ensureThumbnail('c4b3b255089cd7825d85a6044e5ce7f9.jpg', 100, 100, function (err, filename) {
    if(err) throw err;
    console.log(filename);
  // "filename" is the name of the thumb in '/path/to/thumbnails'*/
//});
 /*  var srcimg = 'testImage.jpg';
    thumb({
  source: './',
  destination: './',
  concurrency: 4
}, function() {
  console.log('All done!');
});*/
/*easyimg.info(srcimg, function(err, stdout, stderr) {
if (err) throw err;
console.log(stdout);
});*/
    /* bot = new Thumbbot('./treemap.png', 'treemapthumb.png');
     bot.set({width: 200, height: 150});
     bot.set({
  method: 'resize'
});
  bot.snap(function(err) { console.log("reached this Point!!"); if (err) throw err;});*/
   res.render('playground.jade', {});
});


app.get('/:id', function(req, res) {
    articleProvider.findById(req.params.id, function(error, article) {
      //res.render(article);
      console.log("rendering article: " + article.title);
      // res.render('gallery.jade',
        res.render('playground.jade',
      {
            title: article.title,
            article: article
        });
    });
   // res.render('playground.jade', {});
});





app.post('/blog/new', function(req, res){
    articleProvider.save({
        title: req.param('title'),
        body: req.param('body')
    }, function( error, docs) {
        res.redirect('/')
    });
});


app.post('/file-upload/:id', function(req, res, next) {
    var len = req.files.file.length;
    //console.log(req);
    var tmpPaths = new Array();
    var targetPaths = new Array();
    for(var i = 0; i < len; i++) {
      uploadFile(req.files.file[i].path, req.files.file[i].name, req.params.id);
      console.log(req.files.file[i].path);
      
  }

    res.redirect('/' + req.params.id);
});

app.post('/', function(req, res){
    articleProvider.save({
        title: req.param('title'),
        body: req.param('body')
    }, function( error, docs) {
        res.redirect('/')
    });
});

function uploadFile(path, name, id){
    var shortPath = path.split('/');
       console.log("1: "+ shortPath[1] + " 2" + shortPath[2] + " all" + shortPath); 
      // console.log("full name "+ name + " shorter name " + req.files.file[i].name.split('.').pop());          
       var tmp_path = path;
       var imgName = "" + shortPath[1] + "." + name.split('.').pop();
       var imgPath = "images/" + imgName;
      var target_path = "./public/" + imgPath;
        console.log("temp path; "+ tmp_path + " target path " + target_path + " image path" + imgPath);
/* var thumbnail = new Thumbnail('uploads', './public/images/thumbs');
  thumbnail.ensureThumbnail(imgName, 100, 100, function (err, filename) {
    if(err) throw err;
      var thumbName = "images/thumbs" +filename;
     /*  articleProvider.addImage(req.params.id, {
            path: imgPath,
            thumbPath: thumbName,
            created_at: new Date()
            } , function( error, docs) {
         
       });
    console.log(filename);
  });*/
      //ADD error checking for file type
    
    /* var tmp_path = req.files.thumbnail.path;
      console.log(req.files.thumbnail.path);
    // set where the file should actually exists - in this case it is in the "images" directory
    var target_path = './public/images/' + req.files.thumbnail.name;
   /* var shortPath = req.files.path.split('/');    
    console.log("1: "+ shortPath[1] + " 2" + shortPath[2] + " all" + shortPath)  */
    // move the file from the temporary location to the intended location

    //copy file from temporary directory to new location
     fs.rename(tmp_path, target_path, function(err) {
        console.log("NEW PATH COPIED TO " + target_path);
        console.log("temp path; "+ tmp_path + " target path " + target_path + " image path" + imgPath);
        //specify thumbnail path

        //Handling for other types of files
        var thumbnail = new Thumbnail('./public/images', './public/images/thumbs');
        thumbnail.ensureThumbnail(imgName, 200, 200, function (err, filename) {
          if(err) throw err;
          var thumbName = "images/thumbs/" +filename;
          //add path info to database
          articleProvider.addImage(id, {
            path: imgPath,
            thumbPath: thumbName,
            created_at: new Date()
            } , function( error, docs) {});
              console.log(filename);
        });
        //delete temporary file
        fs.unlink(tmp_path, function() {
           // if (err) throw err;
            console.log("temp path; "+ tmp_path + " target path " + target_path + " image path" + imgPath);
         // console.log(req); 607 222 2520
            console.log("GOAL REACHED");
         
        });
        
         
  // "filename" is the name of the thumb in '/path/to/thumbnails'
});
        // delete the temporary file, so that the explicitly set temporary upload dir does not get filled with unwanted files
       
   // });
}

app.get('/users', user.list);

app.get('/blog/:id', function(req, res) {
    articleProvider.findById(req.params.id, function(error, article) {
    	//res.render(article);
      console.log("rendering article: " + article.title);
       res.render('blog_show.jade',
      {
            title: article.title,
            article: article
        });
    });
});



app.post('/blog/addComment', function(req, res) {
  console.log(req);
    articleProvider.addCommentToArticle(req.param('_id'), {
        person: req.param('person'),
        comment: req.param('comment'),
        created_at: new Date()
       } , function( error, docs) {
           res.redirect('/blog/' + req.param('_id'))
       });
});

app.listen(3000);
/*
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});*/
