import {
  DynamoDBClient,
  PutItemCommand,
  ScanCommand
} from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";
// import jwt from "jsonwebtoken";

const client = new DynamoDBClient({
  region: "ap-south-1"
});

// const JWT_SECRET =
//   process.env.JWT_SECRET ||
//   "quiz-platform-secret-key";
import { CognitoJwtVerifier }
  from "aws-jwt-verify";

const verifier =
  CognitoJwtVerifier.create({

    userPoolId:
      process.env.USER_POOL_ID,

    tokenUse:
      "access",

    clientId:
      process.env.CLIENT_ID
  });

export const handler = async (event) => {
  try {

    // =========================
    // VERIFY TOKEN
    // =========================

    const authHeader =
  event.headers?.Authorization ||
  event.headers?.authorization;

let email = null;

if (
  authHeader &&
  authHeader !== "Bearer null"
) {

  try {

    const token =
      authHeader.replace(
        "Bearer ",
        ""
      );

    const user =
      await verifier.verify(
        token
      );

    email =
      user.email ||
      user.username ||
      user["cognito:username"] ||
      user.sub;

      

  } catch(err){

    console.error(
      "Token verification failed"
    );
  }
}
// }{
//       return response(403, {
//         error:
//           "Only students can submit quizzes"
//       });
//     }

    // =========================
    // REQUEST BODY
    // =========================

    const body =
      JSON.parse(
        event.body || "{}"
      );
    console.log(
        "Quiz Submission:",
        body
       );

    const {

  quizId,

  quizTitle,

  studentName,

  studentEmail,

  answers,

  score,

  totalQuestions

} = body;

    if (
      !quizId ||
      !answers
    ) {
      return response(400, {
        error:
          "quizId and answers are required"
      });
    }
    const existingResults =
  await client.send(
    new ScanCommand({
      TableName: "Results"
    })
  );

console.log(
  "Checking quiz:",
  quizId,
  "email:",
  email
);

console.log("Current Email:", email);

console.log(
  "Results:",
  JSON.stringify(
    existingResults.Items,
    null,
    2
  )
);

const checkEmail =
  studentEmail || email;

const alreadySubmitted =
  (existingResults.Items || [])
  .find(
    item =>
      item.quizId?.S === quizId &&
      item.studentEmail?.S === checkEmail
  );

if (alreadySubmitted) {

  return response(400, {
    error:
      "You already completed this quiz"
  });
}

    // =========================
    // SAVE RESULT
    // =========================


    const resultId =
      uuidv4();

    await client.send(
      new PutItemCommand({
        TableName: "Results",

        Item: {

          resultId: {
            S: resultId
          },

          quizId: {
            S: quizId
          },
          quizTitle: {
  S: quizTitle || "Quiz"
},
studentName: {
  S: studentName || ""
},

studentEmail: {
  S:
    studentEmail ||
    email ||
    ""
},

          answers: {
            S: JSON.stringify(
              answers
            )
          },

          score: {
            N: String(
              score || 0
            )
          },

          totalQuestions: {
            N: String(
              totalQuestions || 0
            )
          },

          submittedAt: {
            S: new Date()
              .toISOString()
          }
        }
      })
    );
    console.log(
     "Quiz Submitted:",
     resultId
    );
    return response(200, {

      success: true,

      message:
        "Quiz submitted successfully",

      resultId,

      score,

      totalQuestions
    });

  } catch (err) {

    console.error(
      "Submit Quiz Error:",
      err
    );

    return response(500, {
      error: "Server error",
      details: err.message
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
      "Access-Control-Allow-Origin":
        "*",

      "Access-Control-Allow-Headers":
        "*",

      "Access-Control-Allow-Methods":
        "*",

      "Content-Type":
        "application/json"
    },

    body:
      JSON.stringify(body)
  };
}