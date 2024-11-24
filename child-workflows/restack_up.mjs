import { RestackCloud } from "@restackio/cloud";

// Deploy on Restack Cloud
const main = async () => {
  const restackCloudClient = new RestackCloud(process.env.RESTACK_CLOUD_TOKEN);

  const restackEngineEnvs = [
    {
      name: "RESTACK_ENGINE_ID",
      value: process.env.RESTACK_ENGINE_ID,
    },
    {
      name: "RESTACK_ENGINE_API_KEY",
      value: process.env.RESTACK_ENGINE_API_KEY,
    },
  ];

  const servicesApp = {
    name: "services",
    dockerFilePath: "child-workflows/Dockerfile",
    dockerBuildContext: "child-workflows",
    environmentVariables: [
      ...restackEngineEnvs,
      {
        name: "RESTACK_ENGINE_ADDRESS",
        value: `${process.env.RESTACK_ENGINE_ADDRESS}:403`,
      },
    ],
  };

  const engine = {
    name: "restack-engine",
    image: "ghcr.io/restackio/restack:main",
    portMapping: [
      {
        port: 5233,
        path: "/",
        name: "engine-frontend",
      },
      {
        port: 6233,
        path: "/api",
        name: "engine-api",
      }
    ],
    environmentVariables: [
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
    ],
  };

  await restackCloudClient.stack({
    name: "child-workflows",
    previewEnabled: false,
    applications: [servicesApp, engine],
  });

  await restackCloudClient.up();
};

main();