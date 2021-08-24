var QuestionsModel = require('../models/questions');
var WebhookModel = require('../models/webhook');
var config = require('../config');
var request = require('request');


function webhookGet(req,res){
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === config.TOKEN_FACEBOOK) {
          console.log('WEBHOOK_VERIFIED');
          res.status(200).send(challenge);
        } else {
          res.sendStatus(403);      
        }
    }
}

function webhookPost(req,res){
    let body = req.body;
    console.log(    );
    if (body.object === 'page') {
        saveWebhook(body);
        body.entry.forEach(function(entry) {
            let webhook_event = entry.messaging;
            // console.log(webhook_event);
            webhook_event.forEach((mess)=>{
                // console.log(mess);
                var inforeipinet = receiveMessage(mess);
            })
            res.status(200).send("llego");
        });
    } else {
        res.sendStatus(404);
    }
}

function receiveMessage(event){
    console.log(event.sender.id);
    console.log(event.message.text);
    sendMessage(event.sender.id);
}

function sendMessage(id){
    callSendApi({
        recipient: {
            id: id
        },
        message: {
            text: "Hola, te saludo. Yo el Webhook"
        }
    });
}


async function saveWebhook(info){
    var webhookQuery= new WebhookModel({event:info,date:new Date});
    await webhookQuery.save();
}

async function callSendApi(message){
    request({
        uri:config.URI_FACEBOOK,
        qs:{ access_token : config.TOKEN_FACEBOOK},
        method:"POST",
        json:message
    },function(error,response,data){
        if(error){
            console.log("Error al enviar datos.");
        }else{
            console.log("Envia datos");
        }
    }
    )
}

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
    if(typeof data.checkQuestions !== "undefined" && data.checkQuestions){
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

async function updateQuestion(req,res){
    console.log('Ingresa Update');
    var returnInfo={
        error:false,
        data:"Registro Actualizado"
    };
    try {
        var data = req.body;
        var uid =data.uid;
        var valueDescription = data.inputDescripcion;
        var responseQuery = await QuestionsModel.updateOne({_id:uid},{description:valueDescription});
        if(responseQuery.nModified===0){
            returnInfo.error=true;
            returnInfo.data="No existe el id enviado";
        }
        return res.send(returnInfo);
    } catch (error) {
        returnInfo.error=true;
        returnInfo.data="Error al realizar la actualizacion";
        return res.send(returnInfo);
    }
}

async function deleteQuestion(req,res){
    console.log('Ingresa Delete');
    var returnInfo={
        error:false,
        data:"Registro Eliminado"
    };
    try {
        var data = req.body;
        var uid =data.uid;
        var valueDescription = data.inputDescripcion;
        var responseQuery = await QuestionsModel.deleteOne({_id:uid});
        console.log(responseQuery);
        if(responseQuery.nModified===0){
            returnInfo.error=true;
            returnInfo.data="No existe el id enviado";
        }
        return res.send(returnInfo);
    } catch (error) {
        returnInfo.error=true;
        returnInfo.data="Error al eliminar registro";
        return res.send(returnInfo);
    }
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
    adminQuestion,
    updateQuestion,
    deleteQuestion,
    webhookGet,
    webhookPost
};
  