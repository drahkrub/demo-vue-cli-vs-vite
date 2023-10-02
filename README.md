# demo-vue-cli-vs-vite

This is a **very** simple Javascript-Project which utilizes

- [Express.js](https://expressjs.com/) to serve **two** simplified [Vue.js](https://vuejs.org/) demo projects build with
- [Vue CLI](https://cli.vuejs.org/) (which is backed by [Webpack](https://webpack.js.org/)) and
- [Vite](https://vitejs.dev/).

I've setup this project in a way such that it mimics the way I usually setup [Spring Boot](https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/) with [Vue.js](https://vuejs.org/) as frontend, see [demo-spring-vite-vue3](https://github.com/drahkrub/demo-spring-vite-vue3).

Everything works fine

- in production mode with vue-cli and vite
- in development mode with vue-cli

Only the **development mode with vite reveals problems** I failed to solve - that's why I set up this demo project. ;-)

## Run everything in "production mode"

See `package.json`, all three sub projects are handled at once, global installation of `yarn` is assumed.

1. Install all dependencies: `yarn install_dependencies`
2. Build all with: `yarn build`
3. Start express backend with: `yarn serve`

### Browse the demo

Open http://localhost:8080/ in your preferred browser.

You will see a static HTML-Page (located in `dist/index.html`, copied from `src/index.html`) providing two links to jump into the demo frontends build with vite and vue-cli respectively. Everything works as expected, both [Vue Routers](https://router.vuejs.org) use the [recommended HTML5 Mode (history mode)](https://router.vuejs.org/guide/essentials/history-mode.html#html5-mode), you can switch between `/v/` and `/v/about/` (resp. `/w/` and `/w/about/`) whereby the about page loads and displays some JSON fetched from the express backend.

### How does it work?

The build processes of vite and vue-cli place their generated assets in `dist/vite-project` and `dist/vue-cli-project` respectively.

Express is configured (see `src/index.js`, copied to `dist/index.js` by the build process) as follows:

```javascript
const express = require("express");
const path = require("path");

const app = express();

// Serve static files (in dist/)
app.use("/", express.static(__dirname));

// Redirect /v/anything and /w/anything to ...
app.get("/v/*", (req, res) => {
  res.sendFile(path.join(__dirname, "vite-project/index.html"));
});
app.get("/w/*", (req, res) => {
  res.sendFile(path.join(__dirname, "vue-cli-project/index.html"));
});

// faking some REST-API
app.get("/api", (req, res) => {
  res.json({ message: "some JSON" });
});

const port = 8080;

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
```

This way each static asset is reachable under `http://localhost:8080/vite-project/[...]` and `http://localhost:8080/vue-cli-project/[...]`.

And by forwarding each URL matching `/v/*` and `/w/*` to `/vite-project/index.html` and `/vue-cli-project/index.html` respectively, the vue router in question can take over the handling of the given URL.

So the integration is based on different base URLs for the Vue Router and for the build processes:

| Option                 | `vite.config.js`    | `vue.config.js`        |
| ---------------------- | ------------------- | ---------------------- |
| `outDir` / `outputDir` | `dist/vite-project` | `dist/vue-cli-project` |
| `base`/ `publicPath`   | `/vite-project/`    | `/vue-cli-project/`    |
| `VUE_ROUTER_BASE`      | `/v/`               | `/w/`                  |

## Running in development mode

While the express server is running (started with `yarn serve`) open another shell and

### vue-cli (no problems at all)

- change directory with: `cd src/vue-cli-project`
- start a dev server (based on [webpack-dev-server](https://github.com/webpack/webpack-dev-server)) with: `yarn serve`

Your default browser should open as soon as the dev server has been started. Everything works like in production mode including [live reload (HMR)](https://webpack.js.org/configuration/dev-server/#devserverhot).

### vite (finally the problematic part)

- change directory with: `cd src/vite-project`
- start a dev server with: `yarn dev`

Your default browser should open as soon as the dev server has been started - and here the problems arise:

1. The URL opened is `.../v/ite-project/`?! Strange, but one can get over it. Just click on the home link to go to `/v/`...
2. If you are on `/v/` (or somewhere else) and do a **browser reload** the following message appears:

   > "The server is configured with a public base URL of /vite-project/ - did you mean to visit /vite-project/v/ instead?"

   Unfortunately, there is no way to answer this question (with "NO!") and I don't know how to configure it away.

3. Loading the example JSON from `/api` does not work on the about page (`/v/about`). The reason is that the proxy option in `vite.config.js` is unconfigured. I can get it to work explicitly for `/api` but what if you have to handle hundreds of different backend URLs? All generic ways I've tried destroy live reload (HMR)!

**Should it not be possible under vite**

- to use different values for `base` in `vite.config.js` and for configuring the [Vue Router](https://router.vuejs.org/api/#Functions-createWebHistory)?
- to proxy all URLs except the ones starting with the Vue Router base URL without (at least) destroying the live reload feature of the dev server?

(any PRs are welcome)

Some links:

- https://github.com/vitejs/vite/discussions/13299
- https://stackoverflow.com/questions/76309242/switching-from-vue-cli-to-vite-with-spring-boot-as-backend-dev-server-not-worki
- https://stackoverflow.com/questions/75753422/vite-dev-servers-hmr-not-working-with-spring-boot
