# Agent with React Flow

A sample repository to have low code editor with React Flow of Agents built with Restack.

### Apps

- `frontend`: another [Next.js](https://nextjs.org/) app
- `backend`: a [Restack](https://restack.io/) app

## Requirements

- **Node 20+**
- **pnpm** (recommended)

## Start Restack

To start Restack, use the following Docker command:

```bash
docker run -d --pull always --name restack -p 5233:5233 -p 6233:6233 -p 7233:7233 -p 9233:9233 ghcr.io/restackio/restack:main
```

## Install dependencies and start services

```bash
pnpm i
pnpm run dev
```

Leveraging turborepo, this will start both frontend and backend.
Your code will be running and syncing with Restack to execute agents.

## Run agents

### from frontend

![Run agents from frontend](./agent-reactflow.png)