const AWS = require("aws-sdk");
const { DynamoDBClient, ScanCommand, PutItemCommand, GetItemCommand } = require("@aws-sdk/client-dynamodb");
const { unmarshall } = require("@aws-sdk/util-dynamodb");

const dynamodb = new AWS.DynamoDB.DocumentClient();
const client = new DynamoDBClient({ region: "us-east-1" });

// DynamoDB Table Names
const QUIZ_TABLE = "Quizzes";
const RESPONSE_TABLE = "Responses";
const STUDENT_TABLE = "Students";
const USER_TABLE = "Users";

// ✅ Common response helper
function sendResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PUT,DELETE",
    },
    body: JSON.stringify(body),
  };
}

/* ===========================================================
   LOGIN HANDLERS
=========================================================== */
module.exports.loginTeacher = async (event) => {
  const { email, password } = JSON.parse(event.body || "{}");
  if (email === "teacher@example.com" && password === "12345") {
    return sendResponse(200, { message: "Login successful", token: "teacher-token" });
  }
  return sendResponse(401, { message: "Invalid credentials" });
};

module.exports.loginStudent = async (event) => {
  const { email, password } = JSON.parse(event.body || "{}");
  if (email === "student@example.com" && password === "12345") {
    return sendResponse(200, { message: "Login successful", token: "student-token" });
  }
  return sendResponse(401, { message: "Invalid credentials" });
};

/* ===========================================================
   QUIZ HANDLERS
=========================================================== */

// ✅ Create Quiz
module.exports.create = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { title, questions, assignedTo } = body;

    if (!title || !questions || !Array.isArray(questions)) {
      return sendResponse(400, { error: "Invalid input data" });
    }

    const quizId = Date.now().toString();

    const params = {
      TableName: QUIZ_TABLE,
      Item: {
        quizId,
        title,
        questions,
        assignedTo: assignedTo || [],
        createdAt: new Date().toISOString(),
      },
    };

    await dynamodb.put(params).promise();
    return sendResponse(200, { message: "Quiz created successfully", quizId });
  } catch (err) {
    console.error("Error in createQuiz:", err);
    return sendResponse(500, { error: "Failed to create quiz", details: err.message });
  }
};

// ✅ Get All Quizzes
module.exports.getQuizzes = async () => {
  try {
    const result = await dynamodb.scan({ TableName: QUIZ_TABLE }).promise();
    return sendResponse(200, { quizzes: result.Items || [] });
  } catch (err) {
    console.error("Error in getQuizzes:", err);
    return sendResponse(500, { error: "Failed to fetch quizzes" });
  }
};

// ✅ Get Quiz Questions (for Student)
module.exports.getQuestions = async () => {
  try {
    const questions = [
      { question: "2 + 2 = ?", options: ["3", "4", "5"], answer: "4" },
      { question: "Capital of France?", options: ["Berlin", "Paris", "Rome"], answer: "Paris" },
    ];
    return sendResponse(200, questions);
  } catch (err) {
    console.error("Error in getQuestions:", err);
    return sendResponse(500, { error: "Failed to get questions" });
  }
};

// ✅ Get Single Quiz (used in quiz.html)
module.exports.getQuizById = async (event) => {
  try {
    const { id } = event.pathParameters;
    const result = await dynamodb
      .get({ TableName: QUIZ_TABLE, Key: { quizId: id } })
      .promise();

    if (!result.Item) return sendResponse(404, { error: "Quiz not found" });

    return sendResponse(200, result.Item);
  } catch (err) {
    console.error("Error in getQuizById:", err);
    return sendResponse(500, { error: "Failed to fetch quiz" });
  }
};

// ✅ Submit Quiz (Student)
module.exports.submitQuiz = async (event) => {
  try {
    const { id } = event.pathParameters;
    const data = JSON.parse(event.body);

    let score = 0;
    for (let i = 0; i < data.answers.length; i++) {
      if (data.answers[i] === data.correct[i]) score++;
    }

    const responseId = Date.now().toString();
    const params = {
      TableName: RESPONSE_TABLE,
      Item: {
        responseId,
        quizId: id,
        studentId: data.studentId,
        answers: data.answers,
        score,
      },
    };

    await dynamodb.put(params).promise();
    return sendResponse(200, { score });
  } catch (err) {
    console.error("Error in submitQuiz:", err);
    return sendResponse(500, { error: "Failed to submit quiz" });
  }
};

// ✅ Get Responses for a Quiz
module.exports.getResponses = async (event) => {
  try {
    const { id } = event.pathParameters;
    const params = {
      TableName: RESPONSE_TABLE,
      FilterExpression: "quizId = :q",
      ExpressionAttributeValues: { ":q": id },
    };

    const result = await dynamodb.scan(params).promise();
    return sendResponse(200, result.Items || []);
  } catch (err) {
    console.error("Error in getResponses:", err);
    return sendResponse(500, { error: "Failed to fetch responses" });
  }
};

/* ===========================================================
   STUDENT MANAGEMENT HANDLERS
=========================================================== */

// ✅ Add Student
module.exports.addStudent = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { email } = body;

    if (!email) return sendResponse(400, { error: "Student email required" });

    const params = {
      TableName: STUDENT_TABLE,
      Item: {
        email,
        addedAt: new Date().toISOString(),
      },
    };

    await dynamodb.put(params).promise();
    return sendResponse(200, { message: "Student added successfully" });
  } catch (err) {
    console.error("Error in addStudent:", err);
    return sendResponse(500, { error: "Failed to add student" });
  }
};

// ✅ Get Students
module.exports.getStudents = async () => {
  try {
    const result = await dynamodb.scan({ TableName: STUDENT_TABLE }).promise();
    return sendResponse(200, { students: result.Items || [] });
  } catch (err) {
    console.error("Error in getStudents:", err);
    return sendResponse(500, { error: "Failed to fetch students" });
  }
};

/* ===========================================================
   TEACHER PROFILE HANDLER
=========================================================== */

module.exports.updateProfile = async (event) => {

  try {

    const body =
      JSON.parse(event.body);

    const {
      email,
      name,
      password
    } = body;

    if (!email) {

      return sendResponse(
        400,
        {
          error: "Email required"
        }
      );
    }

    const user =
      await dynamodb.get({
        TableName: USER_TABLE,
        Key: {
          email
        }
      }).promise();

    if (!user.Item) {

      return sendResponse(
        404,
        {
          error: "User not found"
        }
      );
    }

    const updatedUser = {

      ...user.Item,

      name:
        name ||
        user.Item.name,

      password:
        password ||
        user.Item.password,

      updatedAt:
        new Date()
        .toISOString()
    };

    await dynamodb.put({
      TableName: USER_TABLE,
      Item: updatedUser
    }).promise();

    return sendResponse(
      200,
      {
        success: true,
        message:
          "Profile updated"
      }
    );

  } catch (err) {

    return sendResponse(
      500,
      {
        error:
          err.message
      }
    );
  }
};
/* ===========================================================
   ASSIGN QUIZ HANDLER
=========================================================== */
module.exports.assignQuiz = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { quizId, email } = body;

    if (!quizId || !email) {
      return sendResponse(400, { error: "quizId and student email are required" });
    }

    // ✅ Get the quiz from Quizzes table
    const quizData = await dynamodb
      .get({ TableName: QUIZ_TABLE, Key: { quizId } })
      .promise();

    if (!quizData.Item) {
      return sendResponse(404, { error: "Quiz not found" });
    }

    // ✅ Update quiz with assigned student
    const updatedAssigned = quizData.Item.assignedTo || [];
    if (!updatedAssigned.includes(email)) {
      updatedAssigned.push(email);
    }

    await dynamodb
      .put({
        TableName: QUIZ_TABLE,
        Item: {
          ...quizData.Item,
          assignedTo: updatedAssigned,
        },
      })
      .promise();

    // ✅ Optionally update student with assigned quiz
    const student = await dynamodb
      .get({ TableName: STUDENT_TABLE, Key: { email } })
      .promise();

    const assignedQuizzes = student.Item?.assignedQuizzes || [];
    if (!assignedQuizzes.includes(quizId)) {
      assignedQuizzes.push(quizId);
    }

    await dynamodb
      .put({
        TableName: STUDENT_TABLE,
        Item: {
          ...student.Item,
          email,
          assignedQuizzes,
          updatedAt: new Date().toISOString(),
        },
      })
      .promise();

    return sendResponse(200, {
      message: "Quiz assigned successfully",
      quizId,
      email,
    });
  } catch (err) {
    console.error("Error in assignQuiz:", err);
    return sendResponse(500, { error: "Failed to assign quiz", details: err.message });
  }
};

