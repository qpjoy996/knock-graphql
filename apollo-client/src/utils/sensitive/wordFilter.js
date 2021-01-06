import Mint from "mint-filter";
const sensitive = require("./sensitive.json");
const mint = new Mint(sensitive.content);

const wordFilter = (word) => {
  return mint.filterSync(word, {replace: true});
}

export default wordFilter;
