import {
  DynamoDBClient,
  DeleteItemCommand
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

    await client.send(
      new DeleteItemCommand({
        TableName:"Quiz",
        Key:{
          quizId:{
            S:quizId
          }
        }
      })
    );

    return {
      statusCode:200,
      headers:{
        "Access-Control-Allow-Origin":"*"
      },
      body:JSON.stringify({
        success:true
      })
    };

  }catch(err){

    return{
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
