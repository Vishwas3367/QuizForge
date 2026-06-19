import {
  DynamoDBClient,
  ScanCommand
} from "@aws-sdk/client-dynamodb";

import {
  unmarshall
} from "@aws-sdk/util-dynamodb";

const client =
new DynamoDBClient({
  region:"ap-south-1"
});

export const handler =
async(event)=>{

  try{

    const email =
      event.queryStringParameters
      ?.email;

    const data =
    await client.send(
      new ScanCommand({
        TableName:
        "StudyMaterials"
      })
    );

    const materials =
(data.Items || [])
.map(item =>
  unmarshall(item)
)
.filter(material => {

  const students =
    material.assignedStudents
      ? Array.from(
          material.assignedStudents
        )
      : [];

  return students.includes(
    email
  );
});

    return response(
      200,
      {
        materials
      }
    );

  }catch(err){

    return response(
      500,
      {
        error:
        err.message
      }
    );
  }
};

function response(
  statusCode,
  body
){

  return {

    statusCode,

    headers:{
      "Access-Control-Allow-Origin":"*",
      "Access-Control-Allow-Headers":"*",
      "Access-Control-Allow-Methods":"*",
      "Content-Type":"application/json"
    },

    body:
    JSON.stringify(body)
  };
}