import axios from 'axios'
import bodyParser from 'body-parser'
import chalk from 'chalk'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import express from 'express'
import helmet from 'helmet'
import hpp from 'hpp'
import logger from 'morgan'
import path from 'path'
import favicon from 'serve-favicon'
import { createTerminus } from '@godaddy/terminus'

import apiRouter from '../api/routers'
import db from '../api/instances/sequelize'
import devServer from './dev'
import prometheusMetrics from './metrics'
import ssr from './ssr'

import { version } from '../../package.json'

const host = process.env.HOST
const port = Number(process.env.PORT)

const isDev = process.env.NODE_ENV === 'development'

const app = express()

// Use helmet to secure Express with various HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: false
  })
)
// Prevent HTTP parameter pollution
app.use(
  hpp({
    whitelist: [
      'ancestors',
      'tickers',
      'publicDate',
      'educationTags',
      'deleteEductionTags',
      'newsTags',
      'deleteNewsTags',
      'isin',
      'deleteInstruments'
    ]
  })
)
// Compress all requests
app.use(compression())

app.use(cookieParser())

app.use(bodyParser.json({ limit: '1mb' }))
app.use(bodyParser.urlencoded({ extended: true }))

app.use('/api', apiRouter)

app.get('/metrics', prometheusMetrics())

// Use for http request debug (show errors only)
app.use(logger('dev', { skip: (_req, res) => res.statusCode < 400 }))

app.use(favicon(path.resolve(process.cwd(), 'public/favicon.ico')))

if (!isDev) {
  app.use('/assets', express.static(path.resolve(process.cwd(), `public/releases/${version}/assets`)))
}

app.use(express.static(path.resolve(process.cwd(), 'public')))

if (isDev) {
  devServer(app, port, host)
}

// url to lowercase redirect
app.use((req, res, next) => {
  if (/[A-Z]/.test(req.url)) {
    res.redirect(301, req.url.toLowerCase())
  } else {
    next()
  }
})

// url trailing slashes redirect
app.get('\\S+/$', (req, res) => res.redirect(301, req.path.slice(0, -1) + req.url.slice(req.path.length)))

app.get('/robots.txt', async (_req, res) => {
  const { data } = await axios.get('/api/settings/robots')

  res.format({
    'text/plain': () => {
      res.send((data && data.text) ?? '')
    }
  })
})

app.get('/sitemap.xml', async (_req, res) => {
  const { data } = await axios.get('/api/settings/sitemap')

  res.format({
    'text/xml': () => {
      res.send((data && data.text) ?? '')
    }
  })
})

app.get('*', ssr)

if (host && port) {
  const server = app.listen(port, host, (err: string) => {
    if (err) console.error(chalk.red(`Error ${err}`))
  })

  const onSignal = () => {
    console.info('Server is starting cleanup')

    return Promise.all([db.cmsDb.sequelize.close(), db.apiDb.close(), db.ad2010WebDb.close()])
  }

  const onShutdown = () => {
    console.info('Cleanup finished, server is shutting down')

    return Promise.resolve()
  }

  const healthCheck = async () => {
    const checks = await Promise.all([
      db.cmsDb.sequelize
        .authenticate()
        .then(() => ({ 'CMS DB': { status: 'ok' } }))
        .catch(() => ({ 'CMS DB': { status: 'error' } })),
      db.apiDb
        .authenticate()
        .then(() => ({ 'ADF DB': { status: 'ok' } }))
        .catch(() => ({ 'ADF DB': { status: 'error' } })),
      db.ad2010WebDb
        .authenticate()
        .then(() => ({ 'ADWEB DB': { status: 'ok' } }))
        .catch(() => ({ 'ADWEB DB': { status: 'error' } }))
    ])

    return Promise.resolve({
      status: checks.find(x => x['CMS DB'])?.['CMS DB']?.status || 'error',
      info: checks
    })
  }

  createTerminus(server, {
    healthChecks: { '/healthcheck': healthCheck, verbatim: true },
    onSignal,
    onShutdown,
    timeout: Number(process.env.SHUTDOWN_TIMEOUT) ?? 1000
  })
} else {
  console.error(chalk.red('Error. No PORT or HOST environment variable has been specified'))
}
