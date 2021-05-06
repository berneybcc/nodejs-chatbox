var QuestionsModel = require('../models/questions');

function adminQuestion(req,res){
    res.render('adminQuestions');
}
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
        var dataRelation = this.obtainRelation(ids);
        valueRelation = (!dataRelation.error)?dataRelation.data:[];
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
    var data = req.body;
    console.log(data);
    var valueDescription = data.inputDescripcion;
    var valueRelation = [];
    if(typeof data.flexRadioDefault !== "undefined"){
        var dataRelation = this.obtainRelation(ids);
        valueRelation = (!dataRelation.error)?dataRelation.data:[];
    }
    var questionsQuery= new QuestionsModel({description:valueDescription,relation:valueRelation});
    questionsQuery.save();
    return res.send("Dato insertado");
}

async function obtainRelation(ids){
    var dataReturn ={error:true};
    var infoSearch = await obtainOneQuestion(ids);
    if(!infoSearch.error){
        console.log(infoSearch);
        var data = infoSearch.data;
        var idInfo = data.id;
        var relationInfo = data.relation;
        relationInfo.push(idInfo);
        dataReturn.error = false;
        dataReturn.data = relationInfo;
    }
    return dataReturn;
} 

module.exports={
    obtainQuestion,
    saveQuestion,
    obtainOneQuestion,
    obtainRelationQuestion,
    adminQuestion
};
  