# Remix Nest Boilerplate

## Monorepo Structure

This project is organized as a monorepo using [Turborepo](https://turborepo.org/). The monorepo contains multiple applications and libraries, which are managed in a single repository. This allows for better code sharing and easier management of dependencies.

## Architecture

The project is divided into two main parts:

1. **Remix Application**: This is the frontend application built using [Remix](https://remix.run/). It handles the client-side rendering and routing.
2. **NestJS Application**: This is the backend application built using [NestJS](https://nestjs.com/). It provides the API endpoints and handles server-side logic.

## Installation

To get started with the project, follow these steps:

1. **Clone the repository**:
    ```sh
    git clone https://github.com/mrglox/remix-nest-boilerplate.git
    cd remix-nest-boilerplate
    ```

2. **Install dependencies**:
    ```sh
    npm install
    ```

3. **Set up environment variables**:
    Create a `.env` file in the root directory and add the necessary environment variables. Refer to the `.env.example` file for the required variables.

## Quick Start

To start the project, follow these steps:

1. **Build the project**:
    ```sh
    npm run build
    ```

2. **Start the development server**:
    ```sh
    npm run dev
    ```

3. **Access the application**:
    Open your browser and navigate to `http://localhost:3000` to access the Remix application. The NestJS API will be running at `http://localhost:4000`.

## Additional Scripts

- **Lint the code**:
    ```sh
    npm run lint
    ```

- **Run tests**:
    ```sh
    npm run test
    ```

- **Format the code**:
    ```sh
    npm run format
    ```

// ...existing code...
