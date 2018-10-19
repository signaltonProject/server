var mysql = require('mysql');
var express= require('express');
var bodyParser=require("body-parser");


var app=express();
var encoder=bodyParser.urlencoded({extended:false});

var con = mysql.createConnection({ //database bağlantısı sağlıyor
  host: "localhost",
  user: "root",
  password: "12345",
  database: "ctech"
});

app.post('/login',encoder,function(req,res){  //login ekranı  //test tammam 
  con.connect(function(err) {                 //user_name ve password geliyor doğruysa user_id yanlışsa false dönüyor
    if (err) console.log(err.code);
    console.log("Connected!");
    var sql = "select user_name,password,user_id from users where user_name=? and password=?";
    var values= [req.body.user_name,req.body.password]; 

    con.query(sql,values, function (err, result,fields) {
     if (err) console.log(err.code);
     else{
      if(result.length>0){
        if(result[0].password==req.body.password){
          res.send((result[0].user_id).toString());
        }
      }
      else res.send(null);
      }
    }); 
  })
})

app.post('/signup',encoder,function(req,res){ //sisteme kullanıcı adı şifre kaydediyor  //test tamam
  con.connect(function(err){
    if(err) console.log(err.code);
    console.log("Connected!");
    var test= "select user_name from users where user_name=?"; //aynı isimde kullanıcı var mı diye kontrol ediyor
    var testvalues=[req.body.user_name];

    con.query(test,testvalues,function(err,result,fields){
      if(err) console.log(err.code);
      if(result.length>0){
        if(result[0].user_name==req.body.user_name){
        res.send(null);}
        }
        else{
          var sql="insert into users (user_name,password) values (?,?);"; //kullanıcının adını ve şifresini kaydediyor
          var values= [req.body.user_name,req.body.password];
          con.query(sql,values,function(err,result2,fields){
            if(err) console.log(err.code);
            else var sql2="select user_id from users where user_name=?"
            var values2=[req.body.user_name];
            con.query(sql2,values2,function(err,result3,fields){
              if(err) console.log(err.code);
              else res.send(result3);
            })
        })
      }
    })
    
    })
})

app.post('/insert',encoder,function(req,res){ //location ekleme işlemi //databasede integerları double yap
  con.connect(function(err) {
    if (err) console.log(err.code);
    console.log("Connected!");
    var sql="insert into locations (user_id,longitude,latitude) select user_id, ?,? from users where user_name=?";
    var values=[req.body.longitude,req.body.latitude,req.body.user_name];
    con.query(sql,values,function(err,result){
      if(err){
        console.log(err.code);
        res.send(false);
      }
      else res.send(true);
    })
    });
  }); 

app.post('/search',encoder,function(req,res){ //kişi adı arama //tamam
  con.connect(function(err) {                     //adını arayarak kişiler bulunabilir
    if (err) console.log(err.code);
    console.log("Connected!");
    var sql = "select user_name,count(user_name) as count from users,locations where users.user_id=locations.user_id and user_name like ? group by user_name";
    var values= [ req.body.user_name + '%'];
    
    con.query(sql,[values], function (err, result) {
      if (err) {
        console.log(err.code);//herhangi bir hatadan false gönderiyor
        res.send(false);
      }
      else res.send(result); //isim listesi gönderildi
    });
  }); 
})

app.post('/profil',encoder,function(req,res){ // profil sayfası ongoing
  con.connect(function(err){ //id 
    if(err) console.log(err.code);
    console.log("Connected!");
    var sql="select latitude,longitude from locations where location_id in (select max(location_id) from locations,users where users.user_id=locations.user_id and user_name=?);" //sql içine ne yazılacak karar verilmedi
    values=[req.body.user_name];
    con.query(sql,[values],function(err,result){
      if(err){
        console.log(err.code);
        res.send(false);
      }
      else res.send(result);//ne döndürülecek karar verilmedi
    })
  })
})

app.get('/mainpage',encoder,function(req,res){ // anasayfa ongoing //yapılacak
  con.connect(function(err){ //tüm userlar count(location)
    if(err) console.log(err.code);
    console.log("Connected!");
    var sql="select user_name,count(user_name) as count from users,locations where users.user_id=locations.user_id group by user_name"
     con.query(sql,function(err,result){
       if(err){console.log(err.code);
        res.send(null);
       }else res.send(result);
     })
  })
})


app.listen(1337);
console.log("aktif");