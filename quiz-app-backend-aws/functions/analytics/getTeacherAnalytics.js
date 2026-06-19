import {
  DynamoDBClient,
  ScanCommand
} from "@aws-sdk/client-dynamodb";

import {
  verifyToken
} from "../../utils/verifyToken.js";

const client =
  new DynamoDBClient({
    region:"ap-south-1"
  });

export const handler =
async (event)=>{

  try{

    const authHeader =
      event.headers?.Authorization ||
      event.headers?.authorization;

    if(!authHeader){

      return {
        statusCode:401,
        body:JSON.stringify({
          error:"Unauthorized"
        })
      };
    }

    const token =
      authHeader.replace(
        "Bearer ",
        ""
      );

    const user =
      await verifyToken(
        token
      );

    const teacherId =
      user.sub;

    const quizData =
      await client.send(
        new ScanCommand({
          TableName:"Quiz"
        })
      );

    const resultData =
      await client.send(
        new ScanCommand({
          TableName:"Results"
        })
      );

    const quizzes =
      (quizData.Items || [])
      .filter(
        q =>
          q.createdBy?.S ===
          teacherId
      );

    const teacherQuizIds =
      quizzes.map(
        q => q.quizId?.S
      );

    const results =
      (resultData.Items || [])
      .filter(
        r =>
          teacherQuizIds.includes(
            r.quizId?.S
          )
      );

    let totalScore = 0;
    let totalQuestions = 0;

    results.forEach(r=>{

      totalScore +=
        Number(
          r.score?.N || 0
        );

      totalQuestions +=
        Number(
          r.totalQuestions?.N || 0
        );
    });

    const average =
      totalQuestions > 0
      ? Math.round(
          (totalScore /
          totalQuestions)*100
        )
      : 0;

    return {

      statusCode:200,

      headers:{
        "Access-Control-Allow-Origin":"*"
      },

      body:JSON.stringify({

        totalQuizzes:
          quizzes.length,

        totalAttempts:
          results.length,

        averageScore:
          average,

        quizzes:
          quizzes.map(q=>{

            const assigned =
              JSON.parse(
                q.assignedStudents?.S || "[]"
              );

            const attempts =
              results.filter(
                r =>
                  r.quizId?.S ===
                  q.quizId?.S
              );

            let quizScore = 0;
            let quizQuestions = 0;

            attempts.forEach(a=>{

              quizScore +=
                Number(
                  a.score?.N || 0
                );

              quizQuestions +=
                Number(
                  a.totalQuestions?.N || 0
                );
            });

            const avg =
              quizQuestions > 0
              ? Math.round(
                  (quizScore /
                  quizQuestions) * 100
                )
              : 0;

            const uniqueStudents =
            [
              ...new Set(
                attempts.map(
                  a =>
                    a.studentEmail?.S
                )
              )
            ];

            return {

              quizId:
                q.quizId?.S,

              title:
                q.title?.S,

              assigned:
                assigned.length,

              attempted:
                uniqueStudents.length,

              pending:
                Math.max(
                  0,
                  assigned.length -
                  uniqueStudents.length
                ),

              averageScore:
                avg,

              attemptedStudents:
                attempts.map(
                  a =>
                    a.studentEmail?.S
                ),

              pendingStudents:
                assigned.filter(
                  email =>
                    !attempts.some(
                      a =>
                        a.studentEmail?.S === email
                    )
                )
            };
          })
      })
    };

  }catch(err){

    return {

      statusCode:500,

      headers:{
        "Access-Control-Allow-Origin":"*"
      },

      body:JSON.stringify({
        error:err.message
      })
    };
  }
};