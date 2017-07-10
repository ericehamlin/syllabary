'use strict';

export default class FileLoader {
	static load(filename) {
		return new Promise(function(resolve, reject) {

			let xhttp = new XMLHttpRequest();
			xhttp.onreadystatechange = function () {
				if (this.readyState == 4 && this.status == 200) {
					resolve(this.response);
				}
				else {
					reject();
				}
			}
			xhttp.open("GET", filename, true);
			xhttp.send();
		});
	}
}