import { RestackCloud } from "@restackio/cloud";
import "dotenv/config";

const main = async () => {
  const restackCloudClient = new RestackCloud(process.env.RESTACK_CLOUD_TOKEN);

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

  const servicesApp = {
    name: "services",
    dockerFilePath: "posthog/Dockerfile",
    dockerBuildContext: "posthog",
    environmentVariables: [
      ...restackEngineEnvs,
      {
        name: "POSTHOG_API_KEY",
        value: process.env.POSTHOG_API_KEY,
      },
      {
        name: "POSTHOG_PROJECT_ID",
        value: process.env.POSTHOG_PROJECT_ID,
      },
      {
        name: "POSTHOG_HOST",
        value: process.env.POSTHOG_HOST,
      },
      {
        name: "OPENAI_API_KEY",
        value: process.env.OPENAI_API_KEY,
      },
      {
        name: "LINEAR_API_KEY",
        value: process.env.LINEAR_API_KEY,
      },
      {
        name: "LINEAR_TEAM_ID",
        value: process.env.LINEAR_TEAM_ID,
      },
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
  };

  await restackCloudClient.stack({
    name: "posthog-example",
    previewEnabled: false,
    applications: [servicesApp, engine],
  });

  await restackCloudClient.up();
};

main();
