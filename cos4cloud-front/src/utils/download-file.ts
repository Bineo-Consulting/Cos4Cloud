function downloadFile(data, fileName) {
  var csvData = data;
  var blob = new Blob([ csvData ], {
    type : 'application/csv;charset=utf-8;'
  });

  if (window.navigator.msSaveBlob) {
    // FOR IE BROWSER
    navigator.msSaveBlob(blob, fileName);
  } else {
    // FOR OTHER BROWSERS
    var link: any = document.createElement('a');
    var csvUrl = URL.createObjectURL(blob);
    link.href = csvUrl;
    link.style = 'visibility:hidden';
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export { downloadFile }
