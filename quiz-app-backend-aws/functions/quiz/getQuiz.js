import {
  DynamoDBClient,
  GetItemCommand
} from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({
  region: "ap-south-1"
});

export const handler = async (event) => {

  try {

    const quizId =
      event.pathParameters?.id;

    if (!quizId) {
      return response(400, {
        error: "Quiz ID required"
      });
    }

    const result =
      await client.send(
        new GetItemCommand({
          TableName: "Quiz",
          Key: {
            quizId: {
              S: quizId
            }
          }
        })
      );

    if (!result.Item) {
      return response(404, {
        error: "Quiz not found"
      });
    }

   return response(200, {
  quizId:
    result.Item.quizId.S,

  title:
    result.Item.title?.S || "",

  questions:
    JSON.parse(
      result.Item.questions.S
    ),

  createdBy:
    result.Item.createdBy?.S || "",

  deadline:
    result.Item.deadline?.S || "",

  shareCode:
    result.Item.shareCode?.S || "",

  fileUrl:
    result.Item.fileUrl?.S || ""
});
  } catch (err) {

    console.error(err);

    return response(500, {
      error: err.message
    });
  }
};

function response(
  statusCode,
  body
) {

  return {
    statusCode,

    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Methods": "*",
      "Content-Type": "application/json"
    },

    body: JSON.stringify(body)
  };
}