import {
  DynamoDBClient,
  ScanCommand
} from "@aws-sdk/client-dynamodb";

import {
  verifyToken
} from "../../utils/verifyToken.js";

const client =
  new DynamoDBClient({
    region: "ap-south-1"
  });

export const handler =
async (event) => {

  try {

   const authHeader =
  event.headers.authorization ||
  event.headers.Authorization;

if (!authHeader) {
  return {
    statusCode: 400,
    headers: {
      "Access-Control-Allow-Origin": "*"
    },
    body: JSON.stringify({
      error: "Authorization header missing"
    })
  };
}

const token =
  authHeader.replace(
    "Bearer ",
    ""
  );
  console.log("TOKEN:", token);
  const user =
  await verifyToken(token);

console.log("USER:", user);

    const studentEmail =
  event.queryStringParameters
    ?.email;

    if (!studentEmail) {

      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
          error: "User not found"
        })
      };
    }

    const data =
      await client.send(
        new ScanCommand({
          TableName: "Results"
        })
      );

    const results =
      (data.Items || [])
      .filter(
        item =>
          item.studentEmail?.S ===
          studentEmail
      )
      .map(item => ({

        quizId:
  item.quizId?.S,

quizTitle:
  item.quizTitle?.S,

        score:
          Number(
            item.score?.N || 0
          ),

        totalQuestions:
          Number(
            item.totalQuestions?.N || 0
          ),

        submittedAt:
          item.submittedAt?.S
      }));

    console.log(
      "FILTERING FOR:",
      studentEmail
    );

    console.log(
      "RESULTS FOUND:",
      results.length
    );

    return {

      statusCode: 200,

      headers: {
        "Access-Control-Allow-Origin": "*"
      },

      body: JSON.stringify({
        results
      })
    };

  } catch (err) {

    console.error(err);

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