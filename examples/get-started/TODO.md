1. change restack_up 
	ports: [
      {
        name: "page1",
        source: 8080,
        path: "/page1",
      },
      {
        name: "page1",
        source: 8081,
        path: "/page2",
      },
    ],
2. update python sdk
3. update ts sdk
4. add column to DB
5. update "git" helm chart: deployment.containers.ports, service, ingress
