import {
  DynamoDBClient,
  PutItemCommand
} from "@aws-sdk/client-dynamodb";

const client =
new DynamoDBClient({
  region: "ap-south-1"
});

export const handler =
async (event) => {

  try {

    const {
      materialId,
      title,
      fileUrl,
      assignedStudents,
      teacherEmail
    } = JSON.parse(
      event.body || "{}"
    );

    await client.send(
      new PutItemCommand({
        TableName:
          "StudyMaterials",

        Item: {
          materialId: {
            S: materialId
          },

          title: {
            S: title
          },

          fileUrl: {
            S: fileUrl
          },

          assignedStudents: {
            SS:
              assignedStudents
          },

          teacherEmail: {
            S:
              teacherEmail
          },

          uploadedAt: {
            S:
              new Date()
              .toISOString()
          }
        }
      })
    );

    return {
      statusCode: 200,

      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "*"
      },

      body: JSON.stringify({
        success: true
      })
    };

  } catch (err) {

    return {
      statusCode: 500,

      headers: {
        "Access-Control-Allow-Origin": "*"
      },

      body: JSON.stringify({
        error:
          err.message
      })
    };
  }
};