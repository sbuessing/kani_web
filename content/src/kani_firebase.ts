
import * as admin from 'firebase-admin';
import { Sentence } from "../../site/functions/src/shared/types";

export class KaniFirebase {
  app: admin.app.App;

  constructor() {
    //Confirm I can initialize and read the database.
    this.app = admin.initializeApp({
      projectId: 'kanireader',
      credential: admin.credential.applicationDefault(),
      databaseURL: 'https://kanireader.firebaseio.com',
      storageBucket: 'gs://kanireader.appspot.com'
    });
  }

  uploadNewsArticle(file: string, destination: string) {
    return this.app.storage().bucket().upload(file, { destination });
  }

  async testConnection() {
    const collections = this.app.firestore().listCollections().then(
      (response) => {
        console.log("Have response");
        response.forEach(
          document => {
            console.log(document.path);
          }
        )
      }
    ).catch((err) => {
      console.error('Error: ', err);
    });
  }


  async uploadSentences(sentences: Sentence[]) {
    const writer = this.getSentenceWriter();
    sentences.forEach(sentence => {
      writer.set(sentence);
    })
    await writer.close();
  }

  getSentenceWriter() {
    const writer = this.app.firestore().bulkWriter();
    const collection = this.app.firestore().collection("sentences");
    return new SentenceWriter(writer, collection);
  }
}

class SentenceWriter {
  async flush() {
    return this.writer.flush();
  }
  uploadCount = 0;
  constructor(private writer, private collection) { }

  async set(sentence: Sentence) {
    this.uploadCount++;
    return this.writer.set(this.collection.doc(sentence.key), sentence);
  }
  async close() {
    console.log(`Closing after writing ${this.uploadCount} sentences`);
    return this.writer.close();
  }
}
