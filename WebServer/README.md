# Braid Web Server

A way for us to query the backend and populate the headers for the response appropriately. This allows us to display relevant information for a link's preview.

## Testing

The url to test must have its domain replaced with your `ngrok http 3000` domain. Both `yarn web:dev` and `yarn web:ssr-dev` must be running in addition to your java backend. There should be no need to use ngrok for your java backend when testing locally. However, the `ngrok http 8080` domain must be placed in `config.js` when testing with other people (_eg_ - `return "https://************.ngrok.app/"`).

The template for headers is `web/templates/index.ejs`

Twitter cards can be validated at https://cards-dev.twitter.com/validator
https://metatags.io/ was used as a reference for meta tags

## Sample

The shown sample is merely one of the many routes worked on throughout my tenure at Braid. It does not have full commit history as that would amount to including the entire file.