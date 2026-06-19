import {
  SNSClient,
  PublishCommand
} from "@aws-sdk/client-sns";
import {
  SESClient,
  SendEmailCommand
} from "@aws-sdk/client-ses";
import {
  DynamoDBClient,
  PutItemCommand
} from "@aws-sdk/client-dynamodb";
const sns =
  new SNSClient({
    region:"ap-south-1"
  });
const ses =
  new SESClient({
    region:"ap-south-1"
  });

import { v4 as uuidv4 } from "uuid";
// import jwt from "jsonwebtoken";

const client = new DynamoDBClient({
  region: "ap-south-1"
});

// const JWT_SECRET =
//   process.env.JWT_SECRET ||
//   "quiz-platform-secret-key";

export const handler = async (event) => {

  try {

    // =========================
    // VERIFY TOKEN
    // =========================

    // const authHeader =
    //   event.headers?.Authorization ||
    //   event.headers?.authorization;

    // if (!authHeader) {

    //   return response(401, {
    //     error:
    //       "Authorization token missing"
    //   });
    // }

    // const token =
    //   authHeader.replace(
    //     "Bearer ",
    //     ""
    //   );

    // let user;

    // try {

    //   user = jwt.verify(
    //     token,
    //     JWT_SECRET
    //   );

    // } catch {

    //   return response(401, {
    //     error:
    //       "Invalid token"
    //   });
    // }

    // // =========================
    // // TEACHER ONLY
    // // =========================

    // if (
    //   user.role !== "teacher"
    // ) {

    //   return response(403, {
    //     error:
    //       "Only teachers can create quizzes"
    //   });
    // }

   const authHeader =
  event.headers?.Authorization ||
  event.headers?.authorization;

if (!authHeader) {

  return response(401,{
    error:
      "Authorization token missing"
  });
}

const token =
  authHeader.replace(
    "Bearer ",
    ""
  );

// TEMP: decode Cognito JWT payload
const payload =
  JSON.parse(
    Buffer.from(
      token.split(".")[1],
      "base64"
    ).toString()
  );

const user = {

  email:
    payload.email ||
    payload.username,

  role:
    "teacher"
};

    // =========================
    // REQUEST BODY
    // =========================

    const body =
      JSON.parse(
        event.body || "{}"
      );
    console.log(
        "Create Quiz Request:",
        body
      );

    const {
       title,
       questions,
      assignedStudents = [],
      deadline = "",
      fileUrl = ""
    } = body;

    if (
      !title ||
      !questions ||
      !Array.isArray(
        questions
      )
    ) {

      return response(400, {
        error:
          "Title and valid questions are required"
      });
    }

    // =========================
    // GENERATE IDs
    // =========================

    const quizId =
      uuidv4();

    const shareCode =
      Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();

    const quizLink =
  `https://d3d8yx06d4jf36.cloudfront.net/quiz.html?id=${quizId}`;

    // =========================
    // SAVE QUIZ
    // =========================

    await client.send(
      new PutItemCommand({
        TableName: "Quiz",

        Item: {

          quizId: {
            S: quizId
          },

          title: {
            S: title
          },

          questions: {
            S: JSON.stringify(
              questions
            )
          },

          assignedStudents: {
            S: JSON.stringify(
              assignedStudents
            )
          },

          deadline: {
            S: deadline
          },

          shareCode: {
            S: shareCode
          },
          fileUrl: {
            S: fileUrl
          },

          createdBy: {
            S: user.email
          },

          createdAt: {
            S: new Date()
              .toISOString()
          }
        }
      })
    );
    for (const email of assignedStudents) {

  try {

const htmlBody = `
<div style="
max-width:600px;
margin:auto;
padding:20px;
font-family:Arial,sans-serif;
background:#ffffff;
border-radius:12px;
">

<h1 style="color:#6c4cff;">
🎓 QuizForge
</h1>

<h2>
New Quiz Assigned
</h2>

<p>Hello Student,</p>

<p>
A new quiz has been assigned to you.
</p>

<hr>

<p>
<b>📚 Quiz:</b> ${title}
</p>

<p>
<b>📅 Deadline:</b>
${deadline || "No deadline"}
</p>

<p>
<b>🔑 Share Code:</b>
${shareCode}
</p>

<br>

<a
href="${quizLink}"
style="
background:#6c4cff;
color:white;
padding:12px 24px;
text-decoration:none;
border-radius:8px;
display:inline-block;
font-weight:bold;
"
>
Attempt Quiz
</a>

<br><br>

<p>
Or open directly:
</p>

<p>
${quizLink}
</p>

<hr>

<p style="color:#777;">
QuizForge Learning Platform
</p>

</div>
`;

await ses.send(
  new SendEmailCommand({

    Source:
      process.env.SENDER_EMAIL,

    Destination: {
      ToAddresses: [email]
    },

    Message: {

      Subject: {
        Data: `New Quiz: ${title}`
      },

      Body: {

        Html: {

          Data: htmlBody

        }

      }

    }

  })
);

  } catch(err) {

    console.error(
      "Email failed:",
      email,
      err
    );
  }
}

    await sns.send(
  new PublishCommand({

    TopicArn:
      process.env.SNS_TOPIC_ARN,

    Subject:
      "New Quiz Created",

    Message:
`
A new quiz has been assigned.

Title:
${title}

Deadline:
${deadline}

Share Code:
${shareCode}
`
  })
);

    // =========================
    // SUCCESS
    // =========================

    console.log(
     "Quiz Created Successfully:",
     quizId
    );
    return response(200, {

      success: true,

      message:
        "Quiz created successfully",

      quizId,

      shareCode,

      quizLink
    });

  } catch (err) {

    console.error(
      "Create Quiz Error:",
      err
    );

    return response(500, {

      error:
        "Server error",

      details:
        err.message
    });
  }
};


// =========================
// RESPONSE HELPER
// =========================

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