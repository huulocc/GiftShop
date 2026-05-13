# GiftShop

GiftShop is a full-stack e-commerce web application for selling gifts online.  
The project includes a React frontend and a Node.js/Express backend connected to PostgreSQL.

## Features

- User registration and login
- Product listing and product detail page
- Product search
- Product comparison
- Shopping cart
- Checkout and order creation
- Payment result handling
- User profile
- Manager dashboard
- Category and product management APIs
- Order and payment APIs

## Tech Stack

### Frontend

- React 18
- React Router DOM
- Axios
- React Bootstrap
- Semantic UI React
- SCSS / CSS
- FontAwesome / React Icons

### Backend

- Node.js
- Express.js
- PostgreSQL
- Supabase PostgreSQL Pooler
- Express Session
- bcryptjs
- dotenv
- multer / multer-s3
- AWS S3 SDK

## Project Structure

```bash
GiftShop/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── about/
│   │   │   ├── auth/
│   │   │   ├── cart/
│   │   │   ├── compare/
│   │   │   ├── contact/
│   │   │   ├── footer/
│   │   │   ├── header/
│   │   │   ├── home/
│   │   │   ├── manager/
│   │   │   ├── order/
│   │   │   ├── payment/
│   │   │   ├── products/
│   │   │   ├── profile/
│   │   │   └── search/
│   │   ├── contexts/
│   │   ├── services/
│   │   └── styles/
│   └── package.json
│
├── server/                 # Express backend
│   ├── db/
│   │   └── db.sql
│   ├── src/
│   │   ├── commands/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── data/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── payment/
│   │   ├── repositories/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── app.js
│   │   └── server.js
│   └── package.json
└── package-lock.json
