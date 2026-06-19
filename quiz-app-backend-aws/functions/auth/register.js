import {
  CognitoIdentityProviderClient,
  SignUpCommand
} from "@aws-sdk/client-cognito-identity-provider";

const cognito =
new CognitoIdentityProviderClient({
  region: "ap-south-1"
});

const CLIENT_ID =
"1alrg1hpncn1ik8ifba9cpkei4";

export const handler =
async (event) => {

  try {

    const body =
      JSON.parse(
        event.body || "{}"
      );

    const {
      name,
      email,
      phone,
      password,
      role
    } = body;

    if (
      !name ||
      !email ||
      !phone ||
      !password ||
      !role
    ) {

      return response(400,{
        error:
        "All fields are required"
      });
    }

    const result =
      await cognito.send(
        new SignUpCommand({

          ClientId:
            CLIENT_ID,

          Username:
            email,

          Password:
            password,

          UserAttributes: [

            {
              Name:"email",
              Value:email
            },

            {
              Name:"name",
              Value:name
            },

            {
              Name:"phone_number",
              Value:phone
            },

            {
              Name:"custom:role",
              Value:role
            }
          ]
        })
      );

    return response(200,{

      success:true,

      message:
      "Registration successful. Please verify your email.",

      userSub:
      result.UserSub
    });

  } catch(err) {

    console.error(err);

    return response(401,{
      error:
      err.message
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

      "Access-Control-Allow-Origin":"*",

      "Access-Control-Allow-Headers":"*",

      "Access-Control-Allow-Methods":"*",

      "Content-Type":"application/json"
    },

    body:
      JSON.stringify(body)
  };
}