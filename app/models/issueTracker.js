const mongoose = require('mongoose'); // Includig Mongoose Package
const timeLib  = require('../libs/timeLib');

Schema = mongoose.Schema;

let issueTrackerSchema = new Schema ( {

        issueId  : {

             type        : String,
             default     : "",
             index       : true,
             unique      : true

        },

        title : {

             type        : String,
             default     : "",

        },
        description      : {

             type        : String,
             default     : "",

       },
        status :{
          
             type        : String,
             default     : "Pending"
       },
        assignee         : {
             type        : String,
             default     :""
        },
        watcher          : [],
        reportedDate     : {

             type        : Date,

        },
        comments         : [],     
        reportedBy :{

             type        :String
          },
       updationDetails : []

});


mongoose.model('issueTracker',issueTrackerSchema);

