import { RestackCloud } from "@restackio/cloud";
import "dotenv/config";

const main = async () => {
  const restackCloudClient = new RestackCloud(process.env.RESTACK_CLOUD_TOKEN);

  const serverName = "server";

  const restackEngineEnvs = [
    {
      name: "RESTACK_ENGINE_ID",
      value: process.env.RESTACK_ENGINE_ID,
    },
    {
      name: "RESTACK_ENGINE_ADDRESS",
      value: process.env.RESTACK_ENGINE_ADDRESS,
    },
    {
      name: "RESTACK_ENGINE_API_KEY",
      value: process.env.RESTACK_ENGINE_API_KEY,
    },
  ];

  const serverApp = {
    name: serverName,
    dockerFilePath: "voice/Dockerfile.server",
    dockerBuildContext: "voice",
    environmentVariables: [
      {
        name: "SERVER_HOST",
        linkTo: serverName,
      },
      ...restackEngineEnvs,
    ],
    portMapping: [
      {
        port: 4000,
        path: "/",
        name: "server",
      },
    ],
    healthCheckPath: "/"
  };

  const servicesApp = {
    name: "services",
    dockerFilePath: "voice/Dockerfile.services",
    dockerBuildContext: "voice",
    environmentVariables: [
      {
        name: "OPENAI_API_KEY",
        value: process.env.OPENAI_API_KEY,
      },
      {
        name: "DEEPGRAM_API_KEY",
        value: process.env.DEEPGRAM_API_KEY,
      },
      {
        name: "TWILIO_ACCOUNT_SID",
        value: process.env.TWILIO_ACCOUNT_SID,
      },
      {
        name: "TWILIO_AUTH_TOKEN",
        value: process.env.TWILIO_AUTH_TOKEN,
      },
      {
        name: "FROM_NUMBER",
        value: process.env.OPENAI_API_KEY,
      },
      {
        name: "APP_NUMBER",
        value: process.env.DEEPGRAM_API_KEY,
      },
      {
        name: "YOUR_NUMBER",
        value: process.env.TWILIO_ACCOUNT_SID,
      },
      {
        name: "TWILIO_AUTH_TOKEN",
        value: process.env.TWILIO_AUTH_TOKEN,
      },
      ...restackEngineEnvs,
    ],
  };

  const engine = {
    name: 'restack_engine',
    image: 'ghcr.io/restackio/restack:main',
    portMapping: [
      {
        port: 5233,
        path: '/',
        name: 'engine-frontend',
      },
      {
        port: 6233,
        path: '/api',
        name: 'engine-api',
      },
    ],
    environmentVariables: [...restackEngineEnvs],
    healthCheckPath: "/",
  };

  await restackCloudClient.stack({
    name: "development environment",
    previewEnabled: false,
    applications: [serverApp, servicesApp, engine],
  });

  await restackCloudClient.up();
};

main();
