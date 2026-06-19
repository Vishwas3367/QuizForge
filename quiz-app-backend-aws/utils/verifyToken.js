import { CognitoJwtVerifier }
from "aws-jwt-verify";

const verifier =
  CognitoJwtVerifier.create({

    userPoolId:
      "ap-south-1_TNiaR3eYC",

    tokenUse:
      "access",

    clientId:
      "1alrg1hpncn1ik8ifba9cpkei4"
  });

export async function verifyToken(
  token
) {

  if (!token) {

    throw new Error(
      "Missing token"
    );
  }

  return await verifier.verify(
    token
  );
}