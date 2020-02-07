const socketio           = require('socket.io');
const mongoose           = require('mongoose');
const issueTrackerModel  = mongoose.model('issueTracker');
//const eventScheduler  = require('scheduled-event-emitter');
//const emitter = new eventScheduler();

const moment          = require('moment');

const tokenLib    = require('./tokenLib');
const apiResponse = require('./responseGenLib');
const logger      = require('./logger');
const checkLib    = require('./checkLib');    
const events      = require('events');
const shortId     = require('shortid'); 
const myEvents    = new events.EventEmitter();

let setServer = (server)=>{  
  let newEventData;
  let io        = socketio.listen(server);
  let myIo      = io.of('');

   myIo.on('connection',socket=>{

    socket.rooms = "resfeber"
    // console.log('socket Initialised');
    socket.emit('verifyUser','');

    socket.on('setUser',authToken => {
        // console.log('SetUser Called')
        tokenLib.verifyWithoutSecret(authToken,(err,tokenData)=>{
            if(err){
              socket.emit('token-error',{status:403,message:'Token not valid/expired'});
            }else{
              let currentUser = tokenData.data;
             // console.log(currentUser.username);
              socket.username   = currentUser.userId;
             // socket.emit(currentUser.userId,"You are online");
            //  console.log("set usr online");
            }
        })

    }) //Verifying token and Setting user online

    socket.on('new-issue',(issueData)=>{
      
      issueData.issueId = shortId.generate();
      let newIssue = new issueTrackerModel(issueData);
      newIssue.save((err,result)=>{
        if(err){
          console.log(err);
        }else if(checkLib.isEmpty(result)){
          console.log('issueData not saved');
        }else{

          console.log(result);
      let response = apiResponse.generate(false,'New issueTacker Created',200,issueData);
          issueData.updatedDataType = "New";
          emitNotification(issueData,"New");
      

      //  for(let a of issueData.attendees){
      //   myIo.emit(a.name,response);
      
      //   }

        }

    }) //Emitting notification to all attendees
    });


    socket.on('update-issueData',(data)=>{
      let updatedData ;
      let updatedDataType = data.updatedDataType;
      let commentsData = {
        id        : shortId.generate(),
        comment   : data.updatedData,
        commentBy : data.updatedBy,
        date      : data.updatedDate
      };
      let options = data;
      let attendees_name = [];
      if(updatedDataType == "comments"){
        issueTrackerModel.updateOne({issueId:data.issueId},{$push:{"comments":commentsData}},{new:true})
        .exec((err,result)=>{
          if(err){
            console.log("some error occured"+err);
          }else if(checkLib.isEmpty(result)){
            console.log("Data not updated")
          }else{
            emitNotification(data,'edit');
          }
        })
      }
      else if(updatedDataType == "watcher"){
        issueTrackerModel.updateOne({issueId:data.issueId},{$push:{"watcher":data.updatedBy}},{new:true})
        .exec((err,result)=>{
          if(err){
            console.log("some error occured"+err);
          }else if(checkLib.isEmpty(result)){
            console.log("Data not updated")
          }else{
            emitNotification(data,'edit');
          }
        })
      }
      else {
        issueTrackerModel.updateOne({issueId:data.issueId},{$set:{[updatedDataType]:data.updatedData}},{new:true})
        .exec((err,result)=>{
          if(err){
            console.log(err);
          }else if(checkLib.isEmpty(result)){
            console.log("Data not updated")
          }else{
            emitNotification(data,'edit');
          }
        })
      }


      
    //    issueTrackerModel.updateOne({issueId:data.issueId},options,{multi:true},{new:true})
    //     .exec((err,result)=>{
    //     if(err){
    //       console.log(err);
    //     }else if(checkLib.isEmpty(result)){
    //       console.log('Event not saved');
    //     }else{
    //       let response = apiResponse.generate(false,'Event Data Updated',200,eventData);
    
    //       for(let a of eventData.attendees){
              
    //           myIo.emit(a.name,response);
    //           attendees_name.push(a.name);
    //        }
          
    //          emitReminder(eventData.eventId);  

    //           eventData.type = 'Meeting Details Updated';
    //           mailTemplate.createMail(eventData);
    //    } //If else statement

    // }); //Emitting notification to all attendees
    }); //Updating event

    socket.on('delete-event',(eventData)=>{
      // console.log(eventData);
       eventModel.remove({eventId:eventData.eventId})
        .exec((err,result)=>{
        if(err){
          console.log(err);
        }else if(checkLib.isEmpty(result)){
          console.log('Event not deleted');
        }else{
          
          let response = apiResponse.generate(false,'Event Deleted',200,eventData);
          for(let a of eventData.attendees){
          myIo.emit(a.name,response);
        }
          emitReminder(eventData.eventId);
        } //If else statement

    }); //Emitting notification to all attendees
    }); //Updating event

    socket.on('delete-comment',(data)=>{
      issueTrackerModel.updateOne({issueId:data.issueId},{ $pull: { comments: { id: data.id } } })
      .exec((err,result)=>{
        if(err){
          console.log(err);
        }else if(checkLib.isEmpty(result)){
          console.log('comment not deleted');
        }else{
          let response = apiResponse.generate(false,'Comment Deleted',200,data.id);
          emitNotification(data,'edit');
        }
      })
    }) //Delete comment ends here..
    // socket.room = 'resefeber';
    // socket.

   
   }); //Main Socket Connecton 
   
   let emitNotification = (data,type) =>{

    console.log("Update Id "+data.issueId)
   let notifyArrayList   = []; 
   let allEvents;
    issueTrackerModel.find({issueId:data.issueId})
    .exec((err,result)=>{
      if(err){
        console.log(err);
      }
     else if(checkLib.isEmpty(result)){
      console.log("No Data found");
     }else{

        notifyArrayList.push(result[0].assignee);
        notifyArrayList.push(result[0].reportedBy);
        if(result[0].watcher.length > 0){
          notifyArrayList.concat(result[0].watcher);
        }
        // if(result.watcher.length > 0){
        //   notifyArrayList.concat(result.watcher);
        // }
        console.log("Length"+result[0].watcher.length);
          let issueData = {
            type              : type,
            notificationText  :`Data created/updated by ${data.updatedBy}`,
            data              : data
          }
     
     notifyArrayList.forEach((user)=>{
      console.log("Notify User"+ user);
      myIo.emit(user,issueData);
     })     
     
     if(result[0].watcher.length > 0){
      result[0].watcher.forEach((user)=>{
        console.log("Watcher User"+ user);
        myIo.emit(user,issueData);
      })
    }
     //console.log(result);      
     
    //let startDt = new Date(events.start - 60000) ;    
   // emitterId = emitter.scheduleEmit('triggerReminder',startDt,eventData);
    }  
   });
   
  // / emitter.on('triggerReminder',(payload)=>{
  //   for(let a of payload.attendees){
  //    myIo.emit(a.name,payload);
  //  }
  // });

  } //Timer events 
    

} //End of setServer


 module.exports = {
   setServer : setServer
  }