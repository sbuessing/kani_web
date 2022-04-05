import * as functions from 'firebase-functions';
import admin from 'firebase-admin';
import { RuntimeOptions } from 'firebase-functions';
import { ArticleFunction } from './article_function';
import { NewsSource } from './shared/types';
import { ParserFunction } from './parser_functions';

const cors = require('cors')({ origin: true });
const app = admin.initializeApp({
  // This is probably wrong in dev mode.
  credential: admin.credential.applicationDefault(),
  storageBucket: 'gs://kanireader.appspot.com',
});

console.log('Loading functions');

export const hello = functions.https.onRequest((request, response) => {
  cors(request, response, () => {
    response.status(200).send({ data: 'Hello from unsecured Firebase' });
  });
});

export const helloSecure = functions.https.onRequest((request, response) => {
  cors(request, response, () => {
    const tokenId = request.get('Authorization').split('Bearer ')[1];
    admin
      .auth()
      .verifyIdToken(tokenId)
      .then((decoded) =>
        response
          .status(200)
          .send({ data: 'Hello from firebase with ' + decoded.email })
      )
      .catch((err) => {
        console.error(err);
        response.status(200).send({ data: 'Who are you' });
      });
  });
});

export const runtimeOpts: RuntimeOptions = {
  timeoutSeconds: 300,
  memory: '2GB',
  // NODE: You may still need to manually set NODE memory per
  // https://stackoverflow.com/questions/67158368/deploy-firebase-functions-on-node-14-runtime-with-increased-memory
};

// TODO: Use a single function and get the article type as a param.
// TODO: This isn't working.  Either need to send data using httpsCallable
// https://stackoverflow.com/questions/51066434/firebase-cloud-functions-difference-between-onrequest-and-oncall
// or switch to express...
export const updateArticles = functions
  .runWith(runtimeOpts)
  .https.onCall(async (data, context) => {
    console.log(context.auth.uid);
    if (context.auth.token.email !== 'sbuessing@gmail.com') {
      console.log('no access');
      return { data: 'Only admins can do this' };
    }
    const af = new ArticleFunction(app);
    console.log('Data ' + data);
    console.log('Found type' + data.text);
    const type = data.text as NewsSource;
    if (!type) {
      return { data: `Couldn't find type ${data['type']}` };
    }
    return await af.run(type);
  });

export const parseContent = functions
  .runWith(runtimeOpts)
  .https.onCall(async (data, context) => {
    console.log(context.auth.uid);
    if (context.auth.token.email !== 'sbuessing@gmail.com') {
      console.log('no access');
      return { data: 'Only admins can do this' };
    }
    const af = new ParserFunction();
    return await af.translateText(data.text);
  });

exports.nhkFunction = functions
  .runWith(runtimeOpts)
  .pubsub.schedule('every 4 hours')
  .onRun(async (context) => {
    const news = new ArticleFunction(app);
    console.log('Running NHK Easy');
    console.log(await news.run(NewsSource.NHK));
    console.log('Running NHK Regular');
    console.log(await news.run(NewsSource.NHKHard));
    console.log('Running Maisho');
    console.log(await news.run(NewsSource.Maisho));
  });
