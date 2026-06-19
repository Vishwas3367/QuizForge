import {
  DynamoDBClient,
  ScanCommand
} from "@aws-sdk/client-dynamodb";

const client =
  new DynamoDBClient({
    region:"ap-south-1"
  });

export const handler =
async(event)=>{

  try{

    const quizId =
      event.pathParameters?.id;

    const result =
      await client.send(
        new ScanCommand({
          TableName:"Results"
        })
      );

    const results =
      (result.Items || [])
      .filter(
        item =>
          item.quizId?.S ===
          quizId
      )
      .map(item=>({

        studentName:
          item.studentName?.S ||
          "Unknown",

        studentEmail:
          item.studentEmail?.S ||
          "",

        score:
          Number(
            item.score?.N || 0
          ),

        totalQuestions:
          Number(
            item.totalQuestions?.N || 0
          ),

        submittedAt:
          item.submittedAt?.S || ""
      }));

    return {

      statusCode:200,

      headers:{
        "Access-Control-Allow-Origin":"*"
      },

      body:JSON.stringify({
        results
      })
    };

  }catch(err){

    return {

      statusCode:500,

      headers:{
        "Access-Control-Allow-Origin":"*"
      },

      body:JSON.stringify({
        error:err.message
      })
    };
  }
};