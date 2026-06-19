# 🚀 QuizForge

<p align="center">
  <b>A Cloud-Powered Quiz Management Platform Built on AWS Serverless Architecture</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/AWS-Cloud-orange" />
  <img src="https://img.shields.io/badge/Serverless-Framework-red" />
  <img src="https://img.shields.io/badge/JavaScript-ES6-yellow" />
  <img src="https://img.shields.io/badge/Node.js-Backend-green" />
  <img src="https://img.shields.io/badge/DynamoDB-NoSQL-blue" />
  <img src="https://img.shields.io/badge/Cognito-Authentication-purple" />
</p>

---

## 📖 Overview

QuizForge is a fully serverless cloud-based quiz management platform that enables teachers to create quizzes, distribute study materials, monitor student performance, and analyze results while allowing students to attempt quizzes and track their learning progress.

The platform is built using modern AWS services and follows a scalable serverless architecture.

---

## ✨ Features

### 👨‍🏫 Teacher Module

* Secure registration and login
* Create quizzes
* Edit quizzes
* Delete quizzes
* View student performance
* Upload study materials
* Analytics dashboard

### 👨‍🎓 Student Module

* Secure registration and login
* Email OTP verification
* Attempt quizzes
* View quiz history
* Track performance
* Access study materials
* View leaderboard

### 🔒 Authentication & Security

* AWS Cognito Authentication
* Role-Based Access Control
* Email Verification (OTP)
* JWT Token Authentication
* Protected APIs

---

## ☁️ AWS Services Used

| Service            | Purpose                          |
| ------------------ | -------------------------------- |
| AWS Lambda         | Backend business logic           |
| Amazon API Gateway | REST API management              |
| Amazon Cognito     | Authentication & User Management |
| Amazon DynamoDB    | NoSQL Database                   |
| Amazon S3          | Frontend Hosting & File Storage  |
| Amazon CloudFront  | Global Content Delivery          |
| Amazon SES         | OTP & Email Verification         |
| AWS IAM            | Permissions & Security           |
| Amazon CloudWatch  | Monitoring & Logs                |

---

## 🏗️ Architecture

```text
User
  ↓
CloudFront
  ↓
S3 Hosted Frontend
  ↓
API Gateway
  ↓
AWS Lambda
  ↓
DynamoDB

Authentication
     ↓
 Amazon Cognito

Email Verification
     ↓
 Amazon SES

Monitoring
     ↓
 CloudWatch
```

---

## 🛠️ Tech Stack

### Frontend

* HTML5
* CSS3
* JavaScript (ES6)

### Backend

* Node.js
* AWS Lambda
* Serverless Framework

### Database

* Amazon DynamoDB

### Authentication

* Amazon Cognito
* JWT Tokens

### Cloud Services

* Amazon S3
* CloudFront
* API Gateway
* SES
* IAM
* CloudWatch

---

## 📂 Project Structure

```text
QuizForge
│
├── quiz-app-front-end/
│   ├── auth.html
│   ├── auth.js
│   ├── teacher.html
│   ├── student.html
│   └── styles
│
├── quiz-app-backend-aws/
│   ├── functions/
│   │   ├── auth/
│   │   ├── quiz/
│   │   ├── student/
│   │   ├── analytics/
│   │   └── upload/
│   │
│   ├── services/
│   ├── utils/
│   └── serverless.yml
│
└── README.md
```

---

## 🚀 Deployment

### Frontend

* Hosted on Amazon S3
* Distributed using CloudFront

### Backend

* Deployed using Serverless Framework
* AWS Lambda Functions
* API Gateway Endpoints

---

## 🎯 Learning Outcomes

Through this project, I gained hands-on experience with:

* Serverless Architecture
* AWS Cloud Services
* Authentication & Authorization
* REST API Development
* NoSQL Database Design
* Cloud Deployment
* Monitoring & Logging
* Full Stack Application Development

---

## 👨‍💻 Developer

**Vishwas Kumar**

B.Tech CSE (IoT)
Vellore Institute of Technology (VIT), Vellore

GitHub: https://github.com/Vishwas3367

---

⭐ If you found this project interesting, please give it a star.
