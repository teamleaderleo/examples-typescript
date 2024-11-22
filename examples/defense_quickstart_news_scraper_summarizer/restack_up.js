import { RestackCloud } from "@restackio/cloud";

const main = async () => {
  const restackCloudClient = new RestackCloud(process.env.RESTACK_CLOUD_TOKEN);

  const restackEngineEnvs = [
    {
      name: "RESTACK_ENGINE_ENV_ID",
      value: process.env.RESTACK_ENGINE_ENV_ID,
    },
    {
      name: "RESTACK_ENGINE_ENV_ADDRESS",
      value: process.env.RESTACK_ENGINE_ENV_ADDRESS,
    },
    {
      name: "RESTACK_ENGINE_ENV_API_KEY",
      value: process.env.RESTACK_ENGINE_ENV_API_KEY,
    },
  ];

  const engine = {
    'name': 'restack_engine',
    'image': 'ghcr.io/restackio/restack:main',
    'portMapping': [
        {
            'port': 5233,
            'path': '/',
            'name': 'engine-frontend',
        },
        {
            'port': 6233,
            'path': '/api',
            'name': 'engine-api',
        }
    ],
  };

  const frontendNextJs = {
    name: "nextjs",
    dockerFilePath: "examples/defense_quickstart_news_scraper_summarizer/frontend/Dockerfile",
    dockerBuildContext: "examples/defense_quickstart_news_scraper_summarizer/frontend",
    environmentVariables: [
      ...restackEngineEnvs,
      {
        name: "NEXT_PUBLIC_API_HOSTNAME",
        link: [backendNodeJs],
      },
    ],
    'portMapping': [
      {
          'port': 80,
          'path': '/',
          'name': 'frontend',
      }
  ],
  };

  const backendNodeJs = {
    name: "backend",
    dockerFilePath: "examples/defense_quickstart_news_scraper_summarizer/backend/Dockerfile",
    dockerBuildContext: "examples/defense_quickstart_news_scraper_summarizer/backend",
    environmentVariables: [
      ...restackEngineEnvs,
      {
        name: "OPENBABYLON_API_URL",
        value: process.env.OPENBABYLON_API_URL,
      },
    ],
    'portMapping': [
        {
            'port': 3000,
            'path': '/',
            'name': 'backend',
        }
    ],
  };

  await restackCloudClient.stack({
    name: "ts-defense_quickstart_news_scraper_summarizer",
    previewEnabled: false,
    applications: [frontendNextJs, backendNodeJs, engine],
  });

  await restackCloudClient.up();
};

main();