function response(
  statusCode,
  body
) {
  return {
    statusCode,

    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers":
        "Content-Type,Authorization",
      "Access-Control-Allow-Methods":
        "OPTIONS,GET,POST,PUT,DELETE",
      "Content-Type":
        "application/json"
    },

    body: JSON.stringify(body)
  };
}

module.exports = response;