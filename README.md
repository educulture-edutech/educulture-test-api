Base URL: https://educulture.co.in/api

## User Model

```
{
	_id : "string",
	"firstName" : "string",
	"lastName" : "string",
	"email" : "string",
	"password" : "string",
	"mobile" : "string",
  "goalSelected" : "boolean",
	"role" : "number",
	"gender" : "string",
  "isAccountRegistered" : "boolean"
  "isAccountVerified" : "boolean",
}
```

## **1. Check Mobile Number**

Returns the status of the mobile number and email address so as developer can propogate to

1. login screen (everythhing is true)
2. registration screen (isAccountRegistered is false)
3. verify OTP screen (isAccountVerified is false)

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
    	"isAccountRegistered" : boolean,
    	"isAccountVerified" : boolean,
      "isGoalSelected" : boolean
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

    save this response in localStorage.

  ```
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZmE2Y2Q0MmNiN2EzZjNkZDA3Yzk2YzkiLCJpYXQiOjE2MDYwNTcwNTd9.TJ9CX65E_wOm_Ii7t6GADWDn0PZCq0IoBJKktG-uXps",
    "user": {
        "_id": "5fa6cd42cb7a3f3dd07c96c9",
        "firstName": "mayur",
        "lastName": "aitavadekar",
        "email": "mayuraitavadekar2690@gmail.com",
        "mobile": "9423004286",
        "isGoalSelected": false,
        "role": 0,
        "gender": "male",
        "isAccountRegistered": true,
        "isAccountVerified" : false
    }
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

  `otp=[string]`
  `mobile=[string]`

- **Data Params**

  `none`

- **Success Response:**

  - **Code:** 200 <br />
    **Content:**

  ```
  {"message":"OTP verified success","type":"success"}
  ```

- **Error Response:**

  **Code:** 400 <br />

  ```
  {
    error: "error in updating isAccountVerified flag"
  }
  ```

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

## **5. Login**

user will enter the mobile number and password to get the token and userdata from backend.

- **URL**

  `/account/login`

- **Method:**

  `POST`

- **URL Params**

  **Required:**

  none

- **Data Params**

  `mobile=[string]`
  `password=[string]`

  example:

  ```
  {
      "mobile" : "9423004286",
      "password" : "Pass@123"
  }
  ```

- **Success Response:**

  - **Code:** 200 <br />
    **Content:**

  ```
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZmE2Y2Q0MmNiN2EzZjNkZDA3Yzk2YzkiLCJpYXQiOjE2MDYwNTcwNTd9.TJ9CX65E_wOm_Ii7t6GADWDn0PZCq0IoBJKktG-uXps",
    "user": {
        "_id": "5fa6cd42cb7a3f3dd07c96c9",
        "firstName": "mayur",
        "lastName": "aitavadekar",
        "email": "mayuraitavadekar2690@gmail.com",
        "mobile": "9423004286",
        "isGoalSelected": true,
        "role": 0,
        "gender": "male",
        "isAccountRegistered": true,
        "isAccountVerified" : false
    }
  }
  ```

- **Error Response:**

  **Code:** 404 <br />

  ```
  {
      "error": "password does not match with mobile number."
  }

  ```

- **Sample Call:**

  ```
    fetch(`${BASEURL}/account/login`, {
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

## **6. Update Goal**

Get the goal Id selected by user and update in the document
1001 - MPSC
1002 - 11th standard
1003 - 12th standard

- **URL**

  `/user/update-goal/${userId}`

- **Method:**

  `PUT`

- **URL Params**

  **Required:**

  none

- **Data Params**

  `goalId=[string]`

  example:

  ```
  {
    goalId: "1001"
  }
  ```

- **Success Response:**

  - **Code:** 200 <br />
    **Content:**

    ```
    { message: "success" }
    ```

- **Error Response:**

  - **Code:** 404 NOT FOUND <br />
    **Content:** `{ error: "user not found." }`

- **Sample Call:**

  ```
    fetch(`${BASEURL}/user/update-goal/${userId}`, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`
      "Content-Type": "application/json",
    },

    body: JSON.stringify(data)
  })
    .then((response) => {
      return response.json();
    })
    .catch((err) => console.log("error in hitting getCourseByName by route"));
  ```

---
