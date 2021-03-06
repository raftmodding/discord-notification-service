/**
 * A collection for configurable variables for this application.
 */
export interface Configuration {
  /**
   * The type of environment this application is running in.
   */
  environment: 'development' | 'production';
  /**
   * The client key for the Sentry error reporting service.
   */
  sentryDsn: string;
  /**
   * The port to host the http server on.
   */
  port: number;
  /**
   * The token clients can use to connect to this http server using basic auth.
   * If the token is empty or undefined, the http server will be accessible
   * without authorization.
   */
  token: string | undefined;
  /**
   * The minimum amount of time between pinging a role (in milliseconds).
   */
  pingCooldown: number;
  /**
   * Configurable variables for the mod version notifications.
   */
  modVersionNotifications: ModVersionNotificationConfiguration;
  /**
   * Configurable variables for the launcher version notifications.
   */
  launcherVersionNotifications: LauncherVersionNotificationsConfiguration;
  /**
   * Configurable variables for the mod loader version notifications.
   */
  loaderVersionNotifications: LoaderVersionNotificationsConfiguration;
}

/**
 * Configurable variables for mod version notifications.
 */
export interface ModVersionNotificationConfiguration {
  /**
   * The discord webhook url to be used for mod version release notifications.
   */
  discordWebhookUrl: string;
  /**
   * Discord role id to be mentioned in mod version release notifications. If
   * none is specified, role pings will be omitted.
   */
  discordRolePingId?: string;
}

/**
 * Configurable variables for launcher version notifications.
 */
export interface LauncherVersionNotificationsConfiguration {
  /**
   * The name of the launcher software.
   */
  name: string;
  /**
   * A URL to the download web page of the launcher.
   */
  downloadUrl: string;
  /**
   * Logo image url.
   */
  logoUrl: string;
  /**
   * Discord webhook url to be used for launcher version release notifications.
   */
  discordWebhookUrl: string;
  /**
   * Discord role id to be mentioned in launcher version release notifications.
   * If none is specified, role pings will be omitted.
   */
  discordRolePingId?: string;
}

/**
 * Configurable variables for mod loader version notifications.
 */
export interface LoaderVersionNotificationsConfiguration {
  /**
   * The name of the mod loader software.
   */
  name: string;
  /**
   * Logo image url.
   */
  logoUrl: string;
  /**
   * Discord webhook url to be used for mod loader version release notifications.
   */
  discordWebhookUrl: string;
  /**
   * Discord role id to be mentioned in mod loader version release
   * notifications. If none is specified, role pings will be omitted.
   */
  discordRolePingId?: string;
}
