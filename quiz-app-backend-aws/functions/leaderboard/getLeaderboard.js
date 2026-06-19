import {
  DynamoDBClient,
  ScanCommand
} from "@aws-sdk/client-dynamodb";

const client =
  new DynamoDBClient({
    region: "ap-south-1"
  });

export const handler =
async (event) => {

  try {

    const quizId =
      event.queryStringParameters
        ?.quizId;

    if (!quizId) {

      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin":
            "*"
        },
        body: JSON.stringify({
          error:
            "quizId required"
        })
      };
    }

    const data =
      await client.send(
        new ScanCommand({
          TableName: "Results"
        })
      );

    const leaderboard =
      (data.Items || [])

      .filter(
        item =>
          item.quizId?.S ===
          quizId
      )

      .map(item => ({

        student:
          item.studentEmail?.S ||
          "Unknown",

        score:
          Number(
            item.score?.N || 0
          ),

        totalQuestions:
          Number(
            item.totalQuestions?.N || 0
          )

      }))

      .sort(
        (a,b) =>
          b.score - a.score
      )

      .map(
        (item,index) => ({

          rank:
            index + 1,

          ...item
        })
      );

    return {

      statusCode: 200,

      headers: {
        "Access-Control-Allow-Origin":
          "*"
      },

      body: JSON.stringify({
        leaderboard
      })
    };

  } catch (err) {

    console.error(err);

    return {

      statusCode: 500,

      headers: {
        "Access-Control-Allow-Origin":
          "*"
      },

      body: JSON.stringify({
        error:
          err.message
      })
    };
  }
};