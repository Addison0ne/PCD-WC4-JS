var downloadBlob, downloadURL;

downloadBlob = function(data, fileName, mimeType) {
  var blob, url;
  blob = new Blob([data], {
    type: mimeType
  });
  url = window.URL.createObjectURL(blob);
  downloadURL(url, fileName);
  setTimeout(function() {
    return window.URL.revokeObjectURL(url);
  }, 1000);
};

downloadURL = function(data, fileName) {
  var a;
  a = document.createElement('a');
  a.href = data;
  a.download = fileName;
  document.body.appendChild(a);
  a.style = 'display: none';
  a.click();
  a.remove();
};

function outputFileAsHex(file) {
    let prettyHexOutput = '';
    for(let i = 0; i < file.length; i++) {
        if(i !== 0) prettyHexOutput += ' ';
        prettyHexOutput += file[i].toString(16).padStart(2, "0");
    }
    console.log(prettyHexOutput);
}

function Convert(){
	let file = document.getElementById('inputFile').files[0];
	if(file != undefined){
		let name = (file.name).split(".")
		name[1] = name[1].toLowerCase()
		let reader = new FileReader()
		reader.onload = function() {
			var arrayBuffer = this.result,
			array = new Uint8Array(arrayBuffer);
			if (name[1] == "wc4"|| name[1] == "pg4"){
				var ext = "";
				if (name[1] == "wc4"){
					ext = ".pcd";
				} else {
					ext = ".pgt";
				}
				downloadBlob(EncryptWC4(array), name[0] + ext, 'application/octet-stream');
			}else {
				var ext = "";
				if (name[1] == "pcd"){
					ext = ".wc4";
				} else {
					ext = ".pg4";
				}
				downloadBlob(DecryptPCD(array), name[0] + ext, 'application/octet-stream');
			};
		}
		reader.readAsArrayBuffer(file);

	}
}
