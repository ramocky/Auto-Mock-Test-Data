const https = require('https');
const fs = require('fs');
const file = fs.createWriteStream("logo.png");
// Use ui-avatars to generate a clean "M" logo in a dark rounded rectangle
const url = "https://ui-avatars.com/api/?name=M&background=24292e&color=fff&size=128&font-size=0.6&length=1";

https.get(url, function(response) {
  if (response.statusCode !== 200) {
    console.error(`Failed to download: ${response.statusCode}`);
    return;
  }
  response.pipe(file);
  file.on('finish', function() {
    file.close();
    console.log("Download complete.");
  });
}).on('error', function(err) {
  fs.unlink("logo.png", () => {});
  console.error("Error: ", err.message);
});
