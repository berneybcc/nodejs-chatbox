const { restart } = require('nodemon');
var QuestionsModel = require('../models/questions');

async function adminQuestion(req,res){
    var data = await obtainQuestion([]);
    if(!data.error){
        data = data.data;
        console.log("Consulta Sub Questions");
        // var subData= await createArrayQuestion(data);
    }
    // console.log(subData);
    // res.send(subData);
    res.render('adminQuestions',{info:data});
}

function testButton(){
    console.log("butom");
}

async function createArrayQuestion(data){
    var returnDatos=[];
    for(var i=0;i<data.length;i++){
        var uid= data[i].id;
        var datosObject={};
        datosObject[uid]=[];
        datosObject.id=uid;
        datosObject.description = data[i].description;
        var infoOne = await obtainQuestion([uid]);
        if(!infoOne.error){
            var oneLevel= infoOne.data;            
            for(var a=0;a<oneLevel.length;a++){
                var uidOne= oneLevel[a].id;
                var datosOneObject={};
                datosOneObject[uidOne]=[];
                datosOneObject.id=uidOne;
                datosOneObject.description = oneLevel[a].description;
                datosObject[uid].push(datosOneObject);
                var infoTwo = await obtainQuestion([uid,uidOne]);
                if(!infoTwo.error){
                    datosObject[uid][a][uidOne].push(infoTwo.data);
                }
            }
        }
        // var info = await obtainQuestionLikeRelation(uid);
        // if(!info.error){
        //     var subData = info.data;
        //     for(var a=0;a<subData.length;a++){
        //         var uidSub=subData[a].id;
        //         var datosSub={};
        //         datosSub.id=uidSub;
        //         datosSub.description=subData[a].description;
        //         var relation =subData[a].relation;
        //         uid_end= relation[relation.length-1];
        //         if(typeof datosObject[uid_end]!== 'undefined'){
        //             datosObject[uid_end].push(datosSub);
        //         }
        //         else{
        //             if(datosObject[uid].length > 0){
        //                 for(var c=0;c<datosObject[uid].length;c++){
        //                     if(relation.indexOf(datosObject[uid][c].id)>=0){
        //                         if(typeof datosObject[uid][c][datosObject[uid][c].id] === 'undefined'){
        //                             datosObject[uid][c][datosObject[uid][c].id]=[];
        //                         }                                
        //                         datosObject[uid][c][datosObject[uid][c].id].push(datosSub);
        //                     };
        //                 }
        //             }
        //         }                
        //     }
        // }
        returnDatos.push(datosObject);
    }
    return returnDatos;
}

function obtainQuestionLikeRelation(id){
    return new Promise((resutl) => {QuestionsModel.find({relation:{ $regex: '.*' + id + '.*' }},function(error,data){
        var msg = {
            error:false,
            data:data
        }
        if(error || data.length === 0){
            msg.error = true;
            msg.data = "No existe Registro para el id enviado";
            // console.log(msg);
        }
        resutl(msg);
    })});
}

function obtainQuestion(valueRelation){
    return new Promise((resutl) => {QuestionsModel.find({relation:valueRelation},function(error,data){
        var msg = {
            error:false,
            data:data
        }
        if(error || data.length === 0){
            console.log(error);
            msg.error = true;
            msg.data = "No existe Registro para el id enviado";
        }
        resutl(msg);
    })});
}

function obtainOneQuestion(id){
    return new Promise((resutl) => {QuestionsModel.findOne({_id: id}, function(error, question) {
        var msg= {
            error:false,
        };
        if(error || !question){
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
    console.log(ids);
    if (typeof ids !== "undefined") {
        var dataRelation = await obtainRelation(ids);
        valueRelation = (!dataRelation.error)?dataRelation.data:[];
    }
    console.log("Valor Array: "+valueRelation);
    var info =await obtainQuestion(valueRelation);
    console.log(info);
    res.send(info);
}

async function saveQuestion(req,res){
    console.log('Ingresa Save');
    var returnInfo={
        error:false,
        data:"Datos registrado"
    };
    var data = req.body;
    var valueDescription = data.inputDescripcion;
    var valueRelation = [];
    if(typeof data.checkQuestions !== "undefined"){
        console.log(data.checkQuestions);
        var dataRelation =await obtainRelation(data.checkQuestions);
        if(!dataRelation.error){
            console.log("DataRelation: "+dataRelation);
            valueRelation = (!dataRelation.error)?dataRelation.data:[];
            console.log(valueRelation);
        }else{
            returnInfo.error = true;
            returnInfo.data = "No existe la Pregunta asociada";
            return res.send(returnInfo);
        }
    }
    if(!valueDescription){
        returnInfo.error = true;
        returnInfo.data = "Se requiere una Descripcion";
        return res.send(returnInfo);
    }

    var questionsQuery= new QuestionsModel({description:valueDescription,relation:valueRelation});
    await questionsQuery.save();
    return res.send(returnInfo);
}

async function obtainRelation(ids){
    var dataReturn ={error:true};
    var infoSearch = await obtainOneQuestion(ids);
    if(!infoSearch.error){
        console.log(infoSearch);
        var data = infoSearch.data;
        var idInfo = data.id;
        console.log("Id: "+idInfo);
        var relationInfo = data.relation;
        relationInfo.push(idInfo);
        dataReturn.error = false;
        dataReturn.data = relationInfo;
    }
    return dataReturn;
} 

module.exports={
    saveQuestion,
    obtainOneQuestion,
    obtainRelationQuestion,
    adminQuestion
};
  