const express           = require('express'); //Including Express
const router            = express.Router();
const appConfig         = require('../../config/appConfig'); //Including appConfig file
const eventController    = require('../controllers/issueTracker'); //Including Controller file

let setRouter = (app) =>{

   let baseUrl = `${appConfig.apiVersion}/issueTracker`; //Declaring baseUrl 

     app.post(`${baseUrl}/getIssuedata`,eventController.getIssueData);

        /**
	 * @api {get} /api/v1/events/getAllEvents Get All Event Data
	 * @apiVersion 0.0.1
	 * @apiGroup read
	 *
	 *
	 *  @apiSuccessExample {json} Success-Response:
	 *  {
	    "error": false,
	    "message": "Issue data found",
	    "status": 200,
	    "data": [
					{
						issueId: "string",
						title: "string",
						Description: "string",
						status: "string",
						assignee: string,
						watcher: array,
						comments: "array",
						reportedBy: "string",
					}
	    		]
	    	}
		}
	}
	  @apiErrorExample {json} Error-Response:
	 *
	 * {
	    "error": true,
	    "message": "Failed To fetch issue data",
	    "status": 500,
	    "data": null
	   }
	 */


	app.get(`${baseUrl}/getAllIssuedata`,eventController.getAllIssueData);

	/**
 * @api {get} /api/v1/issueTracker/getAllIssuedata Get All getAllIssuedata 
 * @apiVersion 0.0.1
 * @apiGroup read
 *
 *
 *  @apiSuccessExample {json} Success-Response:
 *  {
	"error": false,
	"message": "Issue data found",
	"status": 200,
	"data": [
				{
					issueId: "string",
					title: "string",
					Description: "string",
					status: "string",
					assignee: string,
					watcher: array,
					comments: "array",
					reportedBy: "string",
				}
			]
		}
	}
}
  @apiErrorExample {json} Error-Response:
 *
 * {
	"error": true,
	"message": "Failed To fetch issue data",
	"status": 500,
	"data": null
   }
 */


};


module.exports = {
    setRouter : setRouter
}