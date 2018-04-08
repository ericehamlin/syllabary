const fs = require('fs');
const path = require('path');


// Delete existing files
const directory = 'coallatedSvg';
let files = fs.readdirSync(directory);
for (let i in files) {
  fs.unlinkSync(path.join(directory, files[i]));
}

let x = 20,
    y = 10,
    z = 18;

let content;

for (let i=1; i<=x; i++) {
  for (let j=1; j<=y; j++) {
    content = '';
    for (let k=1; k<=z; k++) {
      let fileContent = fs.readFileSync("./svg/" + i + "-" + j + "-" + k + ".svg", {encoding: 'utf8'});
      fileContent = fileContent.replace(/<\?xml.*\?>\n/, '');
      fileContent = fileContent.replace(/<svg/, '<svg id="' + i + '-' + j + '-' + k + '" ');
      content += fileContent;
    }
    fs.writeFileSync("./" + directory + "/" + i + "-" + j + ".svg", content);
  }
}




