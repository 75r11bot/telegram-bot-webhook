const axios = require("axios");
const FormData = require("form-data");
const crypto = require("crypto");
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const qs = require("qs");

exports.encryptWithPublicKey = (publicKey, plaintext) => {
  // Ensure publicKey starts with '-----BEGIN PUBLIC KEY-----'
  if (!publicKey.startsWith("-----BEGIN PUBLIC KEY-----")) {
    throw new Error(
      "Invalid public key format: missing '-----BEGIN PUBLIC KEY-----'"
    );
  }

  const bufferData = Buffer.from(plaintext, "utf-8");
  const encryptedData = crypto.publicEncrypt(
    {
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_PADDING,
    },
    bufferData
  );
  return encryptedData.toString("base64");
};

exports.loginUser = async (userData, apiEndpoint, headers) => {
  try {
    const formData = new FormData();
    formData.append("verId", userData.verId);
    formData.append("userName", userData.userName);
    formData.append(
      "password",
      encryptWithPublicKey(userData.publicKey, userData.password)
    );
    formData.append("siteId", userData.siteId);
    formData.append("siteCode", userData.siteCode);
    formData.append("platformType", userData.platformType);
    formData.append("verifyCode", userData.verifyCode);

    // Add other form data properties

    const response = await axios.post(
      `${apiEndpoint}/v/user/newLoginv2`,
      formData,
      { headers }
    );
    console.log("Response Login:", response.data);
    return response.data.token;
  } catch (error) {
    console.error("Error logging in:", error);
    throw error; // Rethrow the error for handling in the calling code
  }
};

exports.getPublicKey = async (apiEndpoint, headers) => {
  try {
    const params = {
      siteId: "1451470260579512322",
      siteCode: "ybaxcf-4",
      platformType: "1",
    };

    const queryString = qs.stringify(params);
    const response = await axios.get(
      `${apiEndpoint}/v/user/getPublicKey?${queryString}`,
      {
        headers,
        timeout: 10000, // 10 seconds timeout
      }
    );
    console.log("Response Body:", response.data);
    return response.data.response;
  } catch (error) {
    console.error("Error getting publicKey from API:", error);
    throw error; // Re-throw the error to handle it in the caller function
  }
};

exports.sendNextRequest = async (dataArray, token, apiEndpoint, headers) => {
  for (let i = 0; i < dataArray.length; i++) {
    const formData = {
      platformType: "1",
      isCancelDiscount: "F",
      siteId: "1451470260579512322",
      siteCode: "ybaxcf-4",
      cardNo: dataArray[i],
    };

    headers.Token = token;

    try {
      const response = await axios.post(
        `${apiEndpoint}/cash/v/pay/generatePayCardV2`,
        formData,
        { headers }
      );
      console.log("Response Body:", response.data);
      if (response.data.code === 9999) {
        console.log("Response code is 9999. Retrying request...");
        await sleep(100);
        i--; // Retry the request
      }
    } catch (error) {
      console.error("Error sending request to API:", error);
      // Handle errors
    }
  }
};
