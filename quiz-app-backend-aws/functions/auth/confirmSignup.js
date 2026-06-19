import {
  CognitoIdentityProviderClient,
  ConfirmSignUpCommand
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

    const {
      email,
      code
    } = JSON.parse(
      event.body || "{}"
    );

    await cognito.send(
      new ConfirmSignUpCommand({

        ClientId:
        CLIENT_ID,

        Username:
        email,

        ConfirmationCode:
        code
      })
    );

    return response(200,{
      success:true
    });

  }catch(err){

    return response(400,{
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