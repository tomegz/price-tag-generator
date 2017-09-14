import React from "react";

const formatParagraphs = (model) => {
  const words = model.split(" ");
  const paragraphs = [];
  while(words.length > 0) {
    let paragraph = "";
    do {
      paragraph += words.shift() + " ";
    } while(typeof words[0] !== "undefined" && paragraph.length + words[0].length <= 9)
    paragraphs.push(paragraph);
  }
  return (
    <div>
      {paragraphs.map(paragraph => <p>{paragraph}</p>)}
    </div>
  );
}

export default formatParagraphs;