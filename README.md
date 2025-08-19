# 🚀 Backend API Boilerplate

Welcome to the **Backend API** built with **Node.js**, **Express.js**, and **PostgreSQL** using **Prisma ORM**!  
This project provides a robust and scalable foundation for developing RESTful APIs.

---

## 🧰 Tech Stack

- **Node.js** ![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)
- **Express.js** ![Express.js](https://img.shields.io/badge/Express.js-000000?logo=express&logoColor=white)
- **PostgreSQL** ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?logo=postgresql&logoColor=white)
- **Prisma ORM** ![Prisma](https://img.shields.io/badge/Prisma-2D3748?logo=prisma&logoColor=white)

---

## ⚡️ Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/your-repo-name.git
   cd your-repo-name
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment variables:**
   - Copy `.env.example` to `.env` and fill in your database credentials.

4. **Set up the database:**
   ```bash
   npx prisma migrate dev
   ```

5. **Start the server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

---

## 📁 Project Structure

```
├── src/
│   ├── controllers/    # API controllers
│   ├── routes/         # Express routes
│   ├── prisma/         # Prisma schema and migration
│   ├── middlewares/    # Express middlewares
│   └── app.js          # Express app entry
├── .env                # Environment variables
├── package.json
└── README.md
```

---

## 📝 Scripts

- `npm run dev` – Start server with hot reload
- `npm run build` – Build for production
- `npm run prisma` – Run Prisma CLI

---

## 💾 Database & Prisma

- Make sure PostgreSQL is running.
- Configure your `.env` file:
  ```
  DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
  ```
- Use Prisma CLI for data modeling and migrations:
  ```bash
  npx prisma migrate dev
  npx prisma studio # Visual database browser
  ```

---

## 🛡️ Environment Variables

Create an `.env` file based on `.env.example`:

```
PORT=3000
DATABASE_URL=...
JWT_SECRET=your_jwt_secret
```

---

## 👨‍💻 Contribution

1. Fork this repo
2. Create your feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add awesome feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## 🤝 License

MIT License  
Feel free to use, modify, and distribute!

---

## 🎉 Happy Coding!

![Cool Rocket](https://img.icons8.com/color/96/000000/rocket--v2.png)
