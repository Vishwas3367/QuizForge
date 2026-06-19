import {
  S3Client,
  PutObjectCommand
} from "@aws-sdk/client-s3";

const s3 =
  new S3Client({
    region:"ap-south-1"
  });

export const handler =
async(event)=>{

  try{

    const body =
      JSON.parse(
        event.body || "{}"
      );

    const {
      fileName,
      fileContent,
      fileType
    } = body;

    if(
      !fileName ||
      !fileContent
    ){

      return response(400,{
        error:"Missing file"
      });
    }

    const buffer =
      Buffer.from(
        fileContent,
        "base64"
      );

    await s3.send(
      new PutObjectCommand({

        Bucket:
          "quiz-platform-files-vishwas",

        Key:fileName,

        Body:buffer,

        ContentType:fileType
      })
    );

    const fileUrl =
`https://quiz-platform-files-vishwas.s3.ap-south-1.amazonaws.com/${fileName}`;

    return response(200,{

      success:true,

      fileUrl
    });

  }catch(err){

    return response(500,{
      error:err.message
    });
  }
};

function response(
  statusCode,
  body
){

  return{

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