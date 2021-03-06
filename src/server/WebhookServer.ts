import express, { json, NextFunction, Request, Response } from 'express';
import basicAuth from 'express-basic-auth';
import { Server } from 'http';
import { ModVersion } from '../entities/ModVersion';
import { createModuleLogger } from '../logger';
import { Handlers } from '@sentry/node';
import {
  validateLauncherVersion, validateModVersion, validateLoaderVersion
} from './validation';
import { ValidationError } from 'yup';
import morgan from 'morgan';
import { LauncherVersion } from '../entities/LauncherVersion';
import { LoaderVersion } from '../entities/LoaderVersion';
import { getPort, getToken } from '../environment-configuration';

const logger = createModuleLogger('WebhookServer');

interface WebhookServerOptions {
  onModVersionRelease(version: ModVersion): Promise<void>;
  onLauncherVersionRelease(version: LauncherVersion): Promise<void>;
  onLoaderVersionRelease(Version: LoaderVersion): Promise<void>;
}

/**
 * A webhook server serves an http server with the webhook endpoints for this
 * application.
 */
export class WebhookServer {
  private server: Server;
  private options: WebhookServerOptions;

  /**
   * Constructs and starts a webhook http server.
   * @param loggerParent the parent of the logger to use.
   * @param options options for this WebhookServer.
   */
  public constructor(options: WebhookServerOptions) {
    this.options = options;

    const token = getToken();

    const app = express();

    // various middleware
    app.use(Handlers.requestHandler());
    app.use(morgan('tiny', {
      stream: {write: (string: string) => logger.http(string)}
    }))
    app.use(json());

    // token authorization
    if (token !== undefined) {
      app.use(basicAuth({
        users: {
          user: token,
        }
      }))
    } else {
      logger.warn('Token (TOKEN env variable) is not configured! API will be ' +
        'available without authorization. This is only allowed in development environments.');
    }

    // endpoints
    app.post('/webhooks/mod/version', (req: Request, res: Response, next: NextFunction) => this.postModVersion(req, res, next));
    app.post('/webhooks/launcher/version', (req: Request, res: Response, next: NextFunction) => this.postLauncherVersion(req, res, next));
    app.post('/webhooks/loader/version', (req: Request, res: Response, next: NextFunction) => this.postLoaderVersion(req, res, next));
    app.use(this.notFound);

    // error handlers
    app.use(Handlers.errorHandler());
    app.use(this.error);

    const port = getPort();
    this.server = app.listen(port, () => {
      logger.info(`Listening on port ${port}.`)
    });
  }

  /**
   * Handles POST requests to the `/webhooks/mod/version` endpoint.
   * @param req the http request.
   * @param res the http response.
   * @param next the function to call to forward this request to the next
   * handler.
   */
  private postModVersion(req: Request, res: Response, next: NextFunction): void {
    validateModVersion(req.body)
      .then(this.options.onModVersionRelease)
      .then(() => {
        res.status(200).json({success: true});
      })
      .catch(next);
  }

  /**
   * Handles POST requests to the `/webhooks/launcher/version` endpoint.
   * @param req the http request.
   * @param res the http response.
   * @param next the function to call to forward this request to the next
   * handler.
   */
  private postLauncherVersion(req: Request, res: Response, next: NextFunction): void {
    validateLauncherVersion(req.body)
      .then(this.options.onLauncherVersionRelease)
      .then(() => {
        res.status(200).json({success: true});
      })
      .catch(next);
  }

  /**
   * Handles POST requests to the `/webhooks/loader/version` endpoint.
   * @param req the http request.
   * @param res the http response.
   * @param next the function to call to forward this request to the next
   * handler.
   */
  private postLoaderVersion(req: Request, res: Response, next: NextFunction): void {
    validateLoaderVersion(req.body)
      .then(this.options.onLoaderVersionRelease)
      .then(() => {
        res.status(200).json({success: true});
      })
      .catch(next);
  }

  /**
   * Express default handler for routes that do not exist.
   * @param req the http request.
   * @param res the http response.
   */
  private notFound(req: Request, res: Response) {
    res.status(404).json({
      error: 'NotFound',
      message: 'The requested resource could not be found!'
    });
  }

  /**
   * Express error handler.
   * @param err the error
   * @param req the http request.
   * @param res the http response.
   * @param next the function to call to forward this request to the next
   * handler.
   */
  private error(err: any, req: Request, res: Response, next: NextFunction): void {
    if (err instanceof SyntaxError && (err as any).status === 400 && 'body' in err) {
      res.status(400).json({
        error: 'SyntaxError',
        message: (err as Error).message,
      });
    } else if (err instanceof ValidationError) {
      res.status(400).json({
        error: 'ValidationError',
        message: err.message,
      });
    } else {
      logger.error(err);
      res.status(500).json({
        error: 'ServerError',
        message: 'Something went wrong on our end!',
      });
    }
  }

  public shutdown(): void {
    this.server.close();
    logger.info('Shutdown!')
  }
}
