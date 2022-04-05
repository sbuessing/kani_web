There are multiple tools in this directory, listed in package.json.
These scripts are meant to be run locally, executing code that is in
site/functions and executable within Firebase Functions.


To initialize tools:
Add a Wanikani api token in a new file at assets/wanikani/apitoken
Add a firebase-private-key.json in this folder.
Run 'npm run wanikani' to initialize Wanikani data.
Run 'npm run test' to confirm pipeline is stable.
This may require:
  sudo apt-get upgrade nodejs
  sudo npm i npm@latest -g
  npm install



To run the news pipeline:
  npm run nhk
  npm run maisho
Note that there are flags in news.ts to enable translation and upload to Firebase storage. Off by default.


To run the tatoeba sentence pipeline you need to:
TODO: Automatically create data directories.
The data pipeline does the following:
Prepare word classification data.
Download kanji and vocabulary from Wanikani.  ~2000 Kanji and 6000 words.
Initialize the mecab sentence tokenizer.
Initialize the hacked rikaikun data files.
TODO: Parse the vocab table for JLPT

Prepare the dataset:
Merge Tatoeba data into a sentence pair set. 2 CSV files, 700MB total
Tokenize each tatoeba sentence with mecab.

Annotate the sentences:
Tag each token with Wanikani word, JMDict meaning, TODO: JLPT level

Score each sentence:
Highest kanji level (Wanikani preferred, JLPT backup)
Number of unknown kanjis.
TODO: Sentence length (>20 characters preferred)

Filter to 5-10 sentences for each word:

Upload the sentences to:
Currently just .json files that are manually copied to project.
  a) word[word].sentences[]
  b) sentences[uniqueidentifier]
  c) sentencesMetadata + storage or hosting file.
  d) word[word].sentencesmetadata[] + storage
