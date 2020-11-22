Base URL: https://educulture.co.in/api

## User Model

```
{
	_id : "string",
	"firstName" : "string",
	"lastName" : "string",
	"email" : "string",
	"isEmailRegistered" : boolean,
	"password" : string,
	"mobile" : string,
	"isMobileVerified" : boolean,
	"role" : number,
	"gender" : "string"
}
```

## **1. Check Mobile Number**

Returns the status of the mobile number and email address so as developer can propogate to

1. login screen (if both isMobileVerifid is true and isEmailRegistered is true)
2. registration screen (if both isMobileVerified is false and isEmailRegistered is false)
3. enter mobile number to verify OTP screen (if isEmailRegistered is true and isMobileVerified is false)

- **URL**

  `/account/check-number?mobile=`

- **Method:**

  `GET`

- **URL Params**

  **Required:**

  `mobile`

- **Data Params**

  none

- **Success Response:**

  - **Code:** 200 <br />
    **Content:**

    ```
    {
    	"mobile" : string,
    	"isMobileVerified" : boolean,
    	"isEmailRegistered" : boolean
    }
    ```

- **Error Response:**

  - **Code:** 400 BAD REQUEST <br />
    **Content:** `{ "error": "enter valid mobile number" }`

- **Sample Call:**

  ```
    fetch(`${BASEURL}/account/check-number?mobile=9423004286`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      return response.json();
    })
    .catch((err) => console.log("error in hitting getCourseByName by route"));
  ```

---

## **2. Register User**

Registers the user and after reister user will propogate to verify mobile number screen.

- **URL**

  `/account/register`

- **Method:**

  `POST`

- **URL Params**

  **Required:**

  none

- **Data Params**

`mobile=[string]`
`firstName=[string]`
`lastName=[string]`
`email=[string]`
`password=[string]`
`gender=[string]` (male/female)

example:

```
{
"mobile" : "9423004286",
"firstName" : "mayur",
"lastName" : "aitavadekar",
"email" : "mayuraitavadekar2690@gmail.com",
"password" : "Pass@123",
"gender" : "male"
}
```

- **Success Response:**

  - **Code:** 200 <br />
    **Content:**

  ```
  {
  firstName: string,
  lastName: string,
  email: string,
  isEmailRegistered: boolean,
  mobile: string,
  isMobileVerified: boolean,
  gender: string,
  role: number,
  }
  ```

- **Error Response:**

  - **Code:** 400 BAD REQUEST <br />
    **Content:** `{ error: "error in saving information in DB" }`

- **Sample Call:**

  ```
    fetch(`${BASEURL}/account/register`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      return response.json();
    })
    .catch((err) => console.log("error in hitting getCourseByName by route"));
  ```

---

## **3. Send OTP to user**

user will enter the mobile and get the OTP through message.

- **URL**

  `account/sendOTP?mobile=`

- **Method:**

  `GET`

- **URL Params**

  **Required:**

  `mobile`

- **Data Params**

  `none`

- **Success Response:**

  - **Code:** 200 <br />
    **Content:**

  ```
  {"message":"3968636f704b303135323339","type":"success"}
  ```

- **Error Response:**

  - [error reponses are here.](https://docs.msg91.com/collection/msg91-api-integration/5/sendotp/TZ648D1Y)

- **Sample Call:**

  ```
    fetch(`${BASEURL}account/sendOTP?mobile=9423004286`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      return response.json();
    })
    .catch((err) => console.log("error in hitting getCourseByName by route"));
  ```

---

## **4. Verify OTP**

user will enter the OTP he received and get the response of verified or not.

- **URL**

  `/account/verifyOTP?otp=&mobile=`

- **Method:**

  `GET`

- **URL Params**

  **Required:**

  `otp`
  `mobile`

- **Data Params**

  `none`

- **Success Response:**

  - **Code:** 200 <br />
    **Content:**

  ```
  {"message":"OTP verified success","type":"success"}
  ```

- **Error Response:**

  - [error reponses are here.](https://docs.msg91.com/collection/msg91-api-integration/5/verify-otp/TZZKO2LI)

- **Sample Call:**

  ```
    fetch(`${BASEURL}/account/verifyOTP?otp=8147&mobile=9423004286`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      return response.json();
    })
    .catch((err) => console.log("error in hitting getCourseByName by route"));
  ```
