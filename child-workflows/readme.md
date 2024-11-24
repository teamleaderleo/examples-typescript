# Restack Child workflow Example

A sample repository, demonstrating how to use child workflows with Restack AI.

For a full Typescript documentation refer to <https://docs.restack.io/libraries/typescript/reference>

## Requirements

- **Node 20+**, **pnpm** (or other package manager)

## Install dependencies and start services

```bash
pnpm i
pnpm dev
```

This will start Node.js app with two Restack Services. Your code will be running and syncing with Restack engine to execute workflows or functions.

## Start Restack Studio

To start the Restack Studio, you can use Docker.

```bash
docker run -d --pull always --name restack -p 5233:5233 -p 6233:6233 -p 7233:7233 ghcr.io/restackio/restack:main
```

## Schedule the parent workflow

```bash
pnpm schedule-workflow
```

## Deploy on Restack Cloud

1. Create an account on conole.restack.io
2. Create an engine to connect to in cloud
3. Create an API token in workspace > settings 
4. Copy all environment variables to your `.env` in local. 

```
RESTACK_ENGINE_ID=
RESTACK_ENGINE_ADDRESS=
RESTACK_ENGINE_API_KEY=

RESTACK_CLOUD_TOKEN=

```
5. Now run the following command at the root of the folder `childworkflows`

``` bash
pnpm restack-up
```
4. You will be prompted to login to restack and create a new API Token for your workspace
5. Add the token to your environment

To deploy the application on Restack, you can use the provided `restackUp.ts` script. This script utilizes the Restack Cloud SDK to define and deploy your application stack. It sets up the necessary environment variables and configures the application for deployment.

To get started, ensure you have the required Restack Cloud credentials and environment variables set up. Then, run the script to initiate the deployment process.

For more detailed information on deploying your repository to Restack, refer to the [Restack Cloud deployment documentation](https://docs.restack.io/restack-cloud/deployrepo).
