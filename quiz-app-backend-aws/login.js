// import {
//   CognitoIdentityProviderClient,
//   InitiateAuthCommand
// } from "@aws-sdk/client-cognito-identity-provider";
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  AdminGetUserCommand
} from "@aws-sdk/client-cognito-identity-provider";

const USER_POOL_ID =
"ap-south-1_TNiaR3eYC";
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
  email,
  password,
  role
} = body;

    if (
      !email ||
      !password ||
      !role
    ) {

      return response(400, {
        error:
          "Email and password are required"
      });
    }

    const result =
      await cognito.send(

        new InitiateAuthCommand({

          AuthFlow:
            "USER_PASSWORD_AUTH",

          ClientId:
            CLIENT_ID,

          AuthParameters: {

            USERNAME:
              email,

            PASSWORD:
              password
          }
        })
      );
      const user =
await cognito.send(
  new AdminGetUserCommand({
    UserPoolId: USER_POOL_ID,
    Username: email
  })
);

const userRole =
user.UserAttributes.find(
  a => a.Name === "custom:role"
)?.Value;

if (userRole !== role) {

  return response(403,{
    error:
    `This account is registered as ${userRole}`
  });
}

    return response(200, {

      success: true,

      accessToken:
        result.AuthenticationResult.AccessToken,

      idToken:
        result.AuthenticationResult.IdToken,

      refreshToken:
        result.AuthenticationResult.RefreshToken
    });

  } catch (err) {

    console.error(err);

    return response(401, {
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

      "Access-Control-Allow-Origin": "*",

      "Access-Control-Allow-Headers": "*",

      "Access-Control-Allow-Methods": "*",

      "Content-Type": "application/json"
    },

    body:
      JSON.stringify(body)
  };
}