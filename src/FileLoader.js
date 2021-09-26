'use strict';

export default class FileLoader {
	static load(filename) {
		return new Promise(function(resolve, reject) {
			const xhttp = new XMLHttpRequest();
			xhttp.overrideMimeType('text/xml; charset=CP1252'); // Windows Latin-1 Charset
			xhttp.onreadystatechange = function () {
				if (this.readyState == 4) { // 4 = DONE
					if (this.status == 200) {
						resolve(this.response);
					}
					else {
						reject(this.status);
					}
				}
			}
			xhttp.open("GET", filename, true);
			xhttp.send();
		});
	}
}
