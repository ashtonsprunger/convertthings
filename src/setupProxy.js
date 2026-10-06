/**
 * Webpack Dev Server custom middleware configuration.
 * Note: Create React App natively configures connect-history-api-fallback
 * with `disableDotRule: true` and `index: paths.publicUrlOrPath`.
 * Do NOT use res.sendFile(publicIndex) here, as that sends the raw uncompiled
 * HTML template from disk without Webpack's injected bundle scripts.
 */
module.exports = function (app) {
  // Pass-through: native historyApiFallback correctly routes all sub-urls to the in-memory bundle.
};
