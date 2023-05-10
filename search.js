const queryInput = document.getElementById("query-input");
const results = document.getElementById("results");

queryInput.addEventListener("change", () => {
  const query = queryInput.value;
  const query_words = query.toLowerCase().match(/\d+|\w+/g);

  fetch("http://127.0.0.1:3000")
    .then((response) => response.json())
    .then((index) => {
      const paths = Object.keys(index);

      // Parse HTML code
      const allContents = Object.values(index).map((documentHTML) => {
        const parser = new DOMParser();
        const fileContents = parser.parseFromString(documentHTML, "text/html");
        return fileContents.body.textContent.toLowerCase();
      });

      const indexWithScores = {};
      for (let i = 0; i < paths.length; i++) {
        const document_words = allContents[i].match(/\d+|\w+/g);
        indexWithScores[paths[i]] = computeTF_IDF(
          query_words,
          document_words,
          allContents
        );
      }

      let rankedIndex = Object.keys(indexWithScores).map((k) => [
        k,
        indexWithScores[k],
      ]);
      rankedIndex.sort((first, second) => second[1] - first[1]);

      let innerHTML = "";
      rankedIndex.forEach((rankedResult) => {
        if(rankedResult[1]>0){
        innerHTML += `<li><a href="${rankedResult[0]}">${rankedResult[0]}</a> (Score: ${rankedResult[1]})</li><br>`;
        }});
      results.innerHTML = innerHTML;
    });
});

const computeTF = (word, words) => {
  let word_occurrences = 0;
  words.forEach((w) => {
    if (word === w) {
      word_occurrences += 1;
    }
  });

  return word_occurrences / words.length;
};

const computeIDF = (word, documents) => {
  let documents_involved = 0;
  documents.forEach((document) => {
    if (document.includes(word)) {
      documents_involved += 1;
    }
  });

  if (documents_involved === 0) {
    return 0;
  }

  return Math.log10(documents.length / documents_involved);
};

const computeTF_IDF = (query_words, document_words, documents) => {
  let score = 0;
  query_words.forEach((word) => {
    score += computeTF(word, document_words) * computeIDF(word, documents);
  });

  return score;
};
