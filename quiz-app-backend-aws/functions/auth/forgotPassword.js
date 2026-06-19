import {
  CognitoIdentityProviderClient,
  ForgotPasswordCommand
} from "@aws-sdk/client-cognito-identity-provider";

const cognito =
new CognitoIdentityProviderClient({
  region:"ap-south-1"
});

const CLIENT_ID =
"1alrg1hpncn1ik8ifba9cpkei4";

export const handler =
async(event)=>{

  try{

    const body =
      JSON.parse(
        event.body || "{}"
      );

    const {
      email
    } = body;

    if(!email){

      return response(400,{
        error:
          "Email is required"
      });
    }

    await cognito.send(

      new ForgotPasswordCommand({

        ClientId:
          CLIENT_ID,

        Username:
          email
      })
    );

    return response(200,{

      success:true,

      message:
        "Password reset code sent"
    });

  }catch(err){

    console.error(err);

    return response(500,{
      error:
        err.message
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