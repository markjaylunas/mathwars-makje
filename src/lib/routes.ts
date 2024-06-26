/**
 * An array of public routes that do not require authentication
 * @type {string[]}
 */

export const publicRoutes = [
  "/",
  "/new-verification",
  "/forgot-password",
  "/reset-password",
];

/**
 * An array of protected routes that require authentication
 * @type {string[]}
 */

export const authRoutes = ["/", "/sign-up", "/auth/error"];

/**
 * The prefix for the API authentication routes
 * Routes that start with this prefix are used for API authentication
 * @type {string}
 */

export const apiAuthPrefix = "/api/auth";

/**
 * The default login redirect path
 * @type {string}
 */
export const DEFAULT_SIGNIN_REDIRECT = "/home";

/**
 * The default login redirect path for oauth
 * @type {string}
 */
export const DEFAULT_OAUTH_SIGNIN_REDIRECT = "/create-username";

/**
 * The default sign in path
 * @type {string}
 */
export const DEFAULT_SIGNIN_PATH = "/";

/**
 * The default sign up path
 * @type {string}
 */

export const DEFAULT_SIGNUP_PATH = "/sign-up";

/**
 * The default forgot password path
 * @type {string}
 */

export const DEFAULT_FORGOT_PASSWORD_PATH = "/forgot-password";

/**
 * The default home path
 * @type {string}
 */

export const DEFAULT_HOME_PATH = "/home";

/**
 * The default classic game path
 * @type {string}
 */

export const CLASSIC_GAME_PATH = "/classic";

/**
 * An array of routes of games
 * @type {string[]}
 */

export const gameRoutes = [CLASSIC_GAME_PATH];
