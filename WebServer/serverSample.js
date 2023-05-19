import express from "express";
import axios from "axios";
import initIndexHTMLDOM from "./initIndexHTMLDOM";

class ReferralNotFoundError extends Error {}

const app = express();

const API_BASE_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8080/graphql"
    : "https://braid.co/graphql";

const APP_REFERRAL_QUERY = `
query AppReferralQuery($referralCode: String!) {
  referrer(referralCode: $referralCode) {
    minimumMoneyMovement
    payoutAmount
  }
}
`;

const appReferralBaseOptions = {
  title: "Join Braid, the place to pool money",
  description: "Sign up and get $10 when you deposit $10 for the first time!",
  name: "Braid",
};

const REFERRAL_BASE_URL = "https://app.braid.co";
app.get("/r/:referralCode", async (req, res) => {
  const dom = await initIndexHTMLDOM();
  const { referralCode } = req.params;
  console.log("serving referral code: " + referralCode);
  const graphqlResponse = await axios({
    method: "get",
    url: API_BASE_URL,
    params: { query: APP_REFERRAL_QUERY, variables: { referralCode } },
  });
  const { referrer } = graphqlResponse.data.data;
  if (!referrer) {
    throw new ReferralNotFoundError();
  }
  const { minimumMoneyMovement, payoutAmount } = referrer;

  const options = {
    ...appReferralBaseOptions,
    title: `Join Braid and earn ${payoutAmount}!`,
    description: `Sign up and get ${payoutAmount} when you deposit ${minimumMoneyMovement} for the first time!`,
    url: REFERRAL_BASE_URL + req.originalUrl,
  };
  updateMetaTags(dom.window.document, options);

  res.send(dom.serialize());
});

/**
 * Updates various meta tags based on the given options.
 * @param {*} document Can be obtained from accessing window.document from a jsdom object
 * @param {*} options title - Primary, OG/Facebook, and Twitter titles
 *                    description - Primary, OG/Facebook, and Twitter descriptions
 *                    imageUri - OG/Facebook and Twitter images
 *                    url - OG/Facebook and Twitter canonical urls
 *                    name - site_name
 *                    alt - Twitter alt text
 */
function updateMetaTags(document, options) {
    if (options.title !== undefined) {
      const { title } = options;
      document.querySelector("title").textContent = title;
      document
        .querySelectorAll("meta[property*=title]")
        .forEach((elem) => (elem.content = title));
    }
  
    if (options.titleTag !== undefined) {
      document.querySelector("title").textContent = options.titleTag;
    }
  
    if (options.alt !== undefined) {
      document.querySelector("meta[name*=alt]").content = options.alt;
    }
  
    if (options.description !== undefined) {
      const { description } = options;
      document
        .querySelectorAll("meta[property*=description]")
        .forEach((elem) => (elem.content = description));
      document
        .querySelectorAll("meta[name*=description")
        .forEach((elem) => (elem.content = description));
    }
  
    if (options.imageUri !== undefined) {
      document
        .querySelectorAll("meta[property*=image]")
        .forEach((elem) => (elem.content = options.imageUri));
    }
  
    if (options.url !== undefined) {
      document
        .querySelectorAll("meta[property*=url]")
        .forEach((elem) => (elem.content = options.url));
    }
  
    if (options.name !== undefined) {
      document.querySelector("meta[property*=site_name]").content = options.name;
    }
  }