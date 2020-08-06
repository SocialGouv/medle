import env from "@kosko/env"

import { create } from "@socialgouv/kosko-charts/components/app"

const manifests = create("app", {
  env,
  config: { containerPort: 3030 },
  deployment: {
    container: {
      resources: {
        requests: {
          cpu: "50m",
          memory: "128Mi",
        },
        limits: {
          cpu: "200m",
          memory: "256Mo",
        },
      },
    },
  },
})

export default manifests
