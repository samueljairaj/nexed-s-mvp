# Contributing

We welcome contributions to this project! Please follow these guidelines to ensure a smooth development process.

## Development Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/your-repo-name.git
    cd vite_react_shadcn_ts
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Start the development server:**
    ```bash
    npm run dev
    ```
    This will start the Vite development server, typically available at `http://localhost:5173`. (Note: The previous subtask mentioned port 8080, if that was set project-wide, this comment might need an update, but for now, I'll use the common Vite default 5173 as in the template).

## Running Linters

We use ESLint for code linting. To check your code for linting errors, run:
```bash
npm run lint
```

## Running Tests

We use Vitest for running unit and component tests.

*   **Run all tests in the console:**
    ```bash
    npm test
    ```

*   **Run all tests with a UI (opens in browser):**
    ```bash
    npm run test:ui
    ```

Make sure all tests pass before submitting a pull request.

## Code Style

Please adhere to the existing code style and ensure ESLint passes without errors.
