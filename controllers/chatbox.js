var QuestionsModel = require('../models/questions');

function obtainQuestion(req, res){ 
    QuestionsModel.find(function(err,question){
        question.forEach((data)=>{
            console.log(data.id);
        })
        res.send(question);
    })
}

function obtainOneQuestion(id){
    return new Promise((resutl) => {QuestionsModel.findOne({_id: id}, function(error, question) {
        var msg= {
            error:false,
        };
        if(error){
            msg.error = true;
            msg.data="No existe registro";
        }else{
            msg.data=question;
        }
        resutl(msg);
    })});
}

async function obtainRelationQuestion(req,res){
    var ids = req.params.ids;
    var valueRelation = [];
    if (typeof ids !== "undefined") {
        console.log(ids);
        var infoSearch = await obtainOneQuestion(ids);
        if(!infoSearch.error){
            console.log(infoSearch);
            var data = infoSearch.data;
            var idInfo = data.id;
            var relationInfo = data.relation;
            relationInfo.push(idInfo);
            valueRelation = relationInfo;
        }
        console.log(valueRelation);
    }
    QuestionsModel.find({relation:valueRelation},function(error,data){
        var msg = {
            error:false,
            data:data
        }
        if(error || data.length === 0){
            console.log(error);
            msg.error = true;
            msg.data = "No existe Registro para el id enviado";
        }
        res.send(msg);
    });
}

function saveQuestion(req,res){
    var questionsQuery= new QuestionsModel({num:1,description:"CAJA",relation:[]});
    questionsQuery.save();
    return res.send("Dato insertado");
}

module.exports={
    obtainQuestion,
    saveQuestion,
    obtainOneQuestion,
    obtainRelationQuestion
};
  