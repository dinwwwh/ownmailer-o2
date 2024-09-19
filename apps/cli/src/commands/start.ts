import { Command, InvalidOptionArgumentError } from '@commander-js/extra-typings'
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { consola } from 'consola'
import { Hono } from 'hono'
import fs from 'node:fs/promises'
import path from 'node:path'

import { generateOpenApiSpec } from '@orpc/openapi'
import { fetchRequestHandler } from '@orpc/server/adapters/fetch'
import { createRouterHandler } from '@orpc/server/handlers/router'
import { routerContract } from '@ownmailer/email-contract'
import { appRouter } from '@ownmailer/email-service'

const emailAppRouterHandler = createRouterHandler(appRouter)

export const start = new Command()
  .name('start')
  .description('Start running the application server')
  .option(
    '--port <port>',
    'Port to listen on',
    (v) => {
      const port = Number.parseInt(v, 10)
      if (Number.isNaN(port) || port < 0 || port > 65535) {
        throw new InvalidOptionArgumentError('Port must be a number between 0 and 65535')
      }
      return port
    },
    2206
  )
  .option('--host <host>', 'Host to listen on', '0.0.0.0')
  .option('--dir <directory>', 'Path to persistent data directory', ':memory:')
  .option('--api-key <api-key>', 'API key to use for authentication', 'secret')
  .action(async ({ port, host, dir, apiKey }) => {
    const persistenceDir = dir === ':memory:' ? ':memory:' : path.resolve(import.meta.dirname, dir)
    if (persistenceDir !== ':memory:') {
      await fs.mkdir(persistenceDir, { recursive: true })
    }

    consola.info(`API key: ${apiKey}`)
    consola.info(`Persistence directory: ${persistenceDir}`)

    const app = new Hono()
      .all('/api/*', async (c) => {
        const url = new URL(c.req.url)
        let response: Response | undefined

        if (/^\/api\/?$/.test(url.pathname)) {
          return new Response(
            `
            <!doctype html>
              <html>
                <head>
                  <title>Scalar API Reference</title>
                  <meta charset="utf-8" />
                  <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1" />
                </head>
                <body>
                  <!-- Need a Custom Header? Check out this example https://codepen.io/scalarorg/pen/VwOXqam -->
                  <script
                    id="api-reference"
                    data-url="/api/spec.json"></script>
                  <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
                </body>
              </html>
            `,
            {
              headers: {
                'Content-Type': 'text/html',
              },
              status: 200,
            }
          )
        }

        if (/^\/api\/spec\.json\/?$/.test(url.pathname)) {
          return new Response(
            JSON.stringify(
              generateOpenApiSpec(routerContract, {
                info: {
                  title: __APP_NAME__,
                  version: __APP_VERSION__,
                },
                servers: [
                  {
                    url: new URL('/api', url).toString(),
                  },
                ],
                security: [{ bearerAuth: [] }],
              })
            ),
            {
              headers: {
                'Content-Type': 'application/json',
              },
              status: 200,
            }
          )
        }

        response ??= await fetchRequestHandler({
          handler: emailAppRouterHandler,
          request: c.req.raw,
          prefix: '/api',
          context: {},
        })

        response ??= new Response('Not Found', { status: 404 })

        return response
      })
      .use('*', serveStatic({ root: 'dist/static/web' }))
      .all('*', serveStatic({ path: 'dist/static/web/index.html' }))

    const server = serve({
      fetch: app.fetch,
      hostname: host,
      port,
    })

    server.addListener('error', (err) => {
      consola.error(err)
    })

    server.listen(port, host, () => {
      consola.info(`Server running: http://${host}:${port}`)
    })
  })
