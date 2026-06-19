import {
  DynamoDBClient,
  UpdateItemCommand
} from "@aws-sdk/client-dynamodb";

const client =
  new DynamoDBClient({
    region:"ap-south-1"
  });

export const handler =
async(event)=>{

  const quizId =
    event.pathParameters.id;

  const body =
    JSON.parse(
      event.body
    );

  await client.send(
    new UpdateItemCommand({

      TableName:"Quiz",

      Key:{
        quizId:{
          S:quizId
        }
      },

      UpdateExpression:
        `
        SET
        title = :t,
        deadline = :d,
        assignedStudents = :a,
        questions = :q
        `,

      ExpressionAttributeValues:{

        ":t":{
          S:body.title
        },

        ":d":{
          S:body.deadline
        },

        ":a":{
          S:JSON.stringify(
            body.assignedStudents
          )
        },

        ":q":{
          S:JSON.stringify(
            body.questions
          )
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
};