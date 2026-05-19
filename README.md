
  # User greeting

  This is a code bundle for User greeting. The original project is available at https://www.figma.com/design/OckCa6RjEANvccA8Fmby4m/User-greeting.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## Graphy setup

  Graphy SDK uses the private package `@graphysdk/core`, so a normal unauthenticated install will return `404 Not Found` from npm until a valid token is configured.

  1. Create a local `.npmrc` in the repo root from `.npmrc.example`.
  2. Export a valid `NPM_TOKEN` for the Graphy registry access.
  3. Run `npm install @graphysdk/core`.
  4. Create a local `.env` from `.env.example` and set:
     - `VITE_GRAPHY_ENABLED=true`
     - `VITE_GRAPHY_WORKSPACE_ID=<value from Graphy>`
     - optionally adjust `VITE_GRAPHY_DEFAULT_GRAPH_TYPE`

  The project now exposes Graphy readiness inside the `Data Explorer` page so the remaining work after credentials are provided is the package install itself and any final chart implementation using the official SDK.
  
