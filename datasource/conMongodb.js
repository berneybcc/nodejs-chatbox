var mongoose = require('mongoose');
const url = 'mongodb://localhost:27017/chatbox';

mongoose.connect(url,function(error){
  if(error){
    console.log("Error al realizar la conexion chatbox");
  }else{
    console.log("database connection success");
  }
});