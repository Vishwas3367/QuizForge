import {
  DynamoDBClient,
  ScanCommand
} from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({
  region: "ap-south-1"
});

export const handler = async (event) => {

  try {

    const email =
      event.queryStringParameters?.email;

    const data =
      await client.send(
        new ScanCommand({
          TableName: "Quiz"
        })
      );

    let quizzes =
      (data.Items || []).map(
        item => ({

          quizId:
            item.quizId?.S,

          title:
            item.title?.S,

          deadline:
            item.deadline?.S || "",

          assignedStudents:
            JSON.parse(
              item.assignedStudents?.S ||
              "[]"
            )
        })
      );

    if (email) {

      quizzes =
  quizzes.filter(quiz => {

    const assigned =
      quiz.assignedStudents.includes(email);

    const active =
      !quiz.deadline ||
      new Date(quiz.deadline) > new Date();

    return assigned && active;
  });
    }

    return {
      statusCode: 200,

      headers: {
        "Access-Control-Allow-Origin":
          "*"
      },

      body: JSON.stringify({
        quizzes
      })
    };

  } catch (err) {

    return {
      statusCode: 500,

      headers: {
        "Access-Control-Allow-Origin":
          "*"
      },

      body: JSON.stringify({
        error: err.message
      })
    };
  }
};