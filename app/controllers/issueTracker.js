const mongoose       = require('mongoose');//Including Express
const apiResponse    = require('../libs/responseGenLib'); // Response generation library
const checkLib       = require('../libs/checkLib'); // Data validation library
const shortId        = require('shortid'); //unique id generator
const passwordLib    = require('../libs/passwordLib') // Password handling library . hashpassword ,compare password etc..
const logger         = require('../libs/logger') //Logging library
const socketLib      = require('../libs/socketLib');   

const issueTrackerModel = mongoose.model('issueTracker');

let createNewEvent = (req,res)=>{

    let newEvent = new eventModel({

            eventId     : shortId.generate(),
            start       : req.body.start,
            end         : req.body.end,
            title       : req.body.title,
            attendees   : req.body.attendees,
            location    : req.body.location,
            description : req.body.description,
            createdBy   : req.body.createdBy,
            allDay      : false,
            resizable   : { 
                            beforeStart : true,
                            afterEnd    : true
                          },
            draggable   : true


    });// New event Model ends

    newEvent.save((err,result)=>{
        if(err){
            // console.log(err);
            logger.error("Data base error","eventsCon:createNewEvent",10);
            let response = apiResponse.generate(true,'Event creation error,',500,null);
            res.send(response);
        }else {
            logger.info("Event Created","eventsCon:createNewEvent",1);
            let newEventObj = result.toObject();
            let response = apiResponse.generate(false,'Event created',200,newEventObj);
            // console.log(response);
            socketLib.newEventNotify(newEventObj);
            res.send(response);
        }


    })



} //Create new event method ends 


let getIssueData = (req,res) =>{
    console.log(req.body.issueId);
    issueTrackerModel.find({issueId:req.body.issueId})
    .exec((err,result)=>{
        if(err){
            //console.log(err);
            logger.error("Fetch data error","eventsConissueTracker:getIssueData",10);
            let response = apiResponse.generate(true,'Issue Data  fetching error,',500,null);
            res.send(response);
        }else{
            logger.info("Issue Data Feteched","eventsConissueTracker:getIssueData",1);
            console.log(result);
            let response = apiResponse.generate(false,'Issue data found',200,result);
            //console.log(response);
            res.send(response);
        }
    })


} //Get All New Issue ends here 



let getAllIssueData = (req,res) =>{
    issueTrackerModel.find()
    .exec((err,result)=>{
        if(err){
            //console.log(err);
            logger.error("Fetch data error","issueTracker:getAllIssueData",10);
            let response = apiResponse.generate(true,'Issue Data  fetching error,',500,null);
            res.send(response);
        }else{
            logger.info("Issue Data Feteched","issueTracker:getAllIssueData",1);
            console.log(result);
            let response = apiResponse.generate(false,'Issue data found',200,result);
            //console.log(response);
            res.send(response);
        }
    })


} //Get All New Issue ends here 


module.exports ={

    createNewEvent      :createNewEvent,
    getIssueData        :getIssueData,
    getAllIssueData     :getAllIssueData    

}