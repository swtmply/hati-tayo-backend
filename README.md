# Hati-Tayo Backend

Hati-Tayo Backend is the server-side application that powers the Hati-Tayo mobile app, designed to simplify bill splitting among groups. This backend handles user authentication, group management, transactions, and more.

### Features

- **User Authentication**: Secure user authentication using Clerk.
- **Group Management**: Create and manage groups for different occasions or purposes.
- **Hatian Management**: Create a hatian for groups that have transactions together.
- **Transaction Management**: Create and manage transactions for each hatian.

### Getting Started

**Prerequisites**

- [Node.js](https://nodejs.org/en)
- [Bun](https://bun.sh/)
- [Next.js](https://nextjs.org/)

**Installation**

1. Clone the repository:

```bash
  git clone https://github.com/swtmply/hati-tayo-backend.git
  cd hati-tayo-backend
```

2. Install dependencies:

```bash
  bun install
  # or
  npm install
```

3. Set up environment variables: Copy `.env.example` to `.env.local` and fill in the required values.

**Running the App**

1. Start the development server:

```bash
  bun start
  # or
  npm run dev
```

2. The server will be running at `http://localhost:3000`.

**Scripts**

- `dev`: Start the development server.
- `build`: Build the application for production.
- `start`: Start the production server.
- `lint`: Run ESLint to check for code quality issues.
- `db:generate`: Generate database schema using Drizzle Kit.
- `db:migrate`: Run database migrations using Drizzle Kit.
- `db:studio`: Open Drizzle Kit studio for database management.

### Contributing

Contributions are welcome! Please follow these steps:

- Fork the repository.
- Create a new branch (`git checkout -b feature/your-feature`).
- Commit your changes (`git commit -am 'Add new feature'`).
- Push to the branch (`git push origin feature/your-feature`).
- Create a new Pull Request.

### License

This project is licensed under the MIT License.
