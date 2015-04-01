app.factory('vaultPdfPrint', [ '$window', '$location', function($window, $location) {
  return {
    printPdf : function(type, path) {
      var absUrl = $location.absUrl();
      var pathIndex = absUrl.indexOf("/lwc");
      var baseUrl = absUrl.substring(0, pathIndex);

      var targetUrl = baseUrl + "/rest/PdfPrint";
      switch (type) {
      case "vault":
        targetUrl += "/Vault";
        break;
      case "vaultQ":
        targetUrl += "/VaultQ";
        break;
      default:
        throw "Type should be in ['vault', 'vaultQ']";
      }
      targetUrl += "?id=" + path;

      $window.open(targetUrl, '_blank');
    }
  };
} ]);