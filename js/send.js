var SendPage = new (function () {
  var address, name, currency, amount, // private variables
      
      amntElem, // amount
      currElem, // currency
      destElem, // destination
      nameElem, // (optional) name
      sendPageButton; // button
  
  function onFieldsUpdated() {
    address = destElem.value();
    name = blobVault.addressBook.getName(address) || "";
    currency = currElem.value();
    amount = amntElem.val() * (currency == 'XNS' ? BALANCE_DISPLAY_DIVISOR : 1);
    
    $("#SpacerRow").show();
    $("#AddressDisplayRow").hide();
    $("#SendDestNameRow").hide();

    sendPageButton.attr(
      'disabled', 
      !ncc.misc.isValidAmount(amount, currency)
    );
    
    if (ncc.misc.isValidAddress(address) && name != 'you') {
      $("#SpacerRow").hide();
      if (address == destElem.input.val()) {
        // address in input box
        $("#SendDestNameRow").show();
        $("#SendDestName").val(name);
      } else {
        // name in input box
        $("#AddressDisplayRow").show();
        $("#AddressDisplay").val(address)
      }
    } else {
      sendPageButton.attr('disabled', true);
    }
  }
  
  $(document).ready(function () {
    sendPageButton = $("#SendPageButton");
    amntElem = $("#SendAmount");
    nameElem = $("#SendDestName");
    $("#t-send input").on('keydown', function (e) {
      if (e.which == 13 && !sendPageButton.attr('disabled') && !$(this).widget) {
        sendPageButton.click();
      }
    });
    amntElem.on('input', onFieldsUpdated);
  });
  
  this.onShowTab = function () {
    var destinationOptions = _.extend(blobVault.getRecentSends(), blobVault.addressBook.getEntries());
    
    if (!destElem) {
      destElem = $("#SendDest").combobox({
        data: destinationOptions,
        selected: '',
        button_title: 'Recently used addresses',
        onchange: onFieldsUpdated
      }).data('combobox');
    }
    
    if (!currElem) {
      currElem = $("#SendCurrency").combobox({
        data: ncc.allCurrencyOptions,
        selected: 'XNS',
        strict: true,
        button_title: 'Select a currency',
        onchange: onFieldsUpdated
      }).data('combobox');
    }
    
    setTimeout(function () { amntElem.focus(); }, 100);
    destElem.updateData(destinationOptions)
  }
  
  this.send = function () {
    if (currency == 'XNS') {
      rpc.send(ncc.masterKey, ncc.accountID, address, String(amount), currency, SendPage.onSendResponse);
    } else {
      rpc.send(ncc.masterKey, ncc.accountID, address, String(amount), currency, ncc.accountID, SendPage.onSendResponse);
    }
    
    sendPageButton.text("Sending...");
    ncc.misc.forms.disable('#t-send');
  };
  
  this.onSendResponse = function (res, noError) {
    res = res.result || res;
    if (noError) {
      var toAccount = res.dstAccountID,
          curr = res.dstISO;
      
      name = nameElem.val() || name;
      if (name) {
        blobVault.addressBook.setEntry(name, toAccount);
      }
      
      blobVault.updateRecentSends(toAccount);
      blobVault.save();
      blobVault.pushToServer();
      
      destElem.promoteEntry(toAccount);
      
      // clean up
      delete address;
      delete name;
      delete currency;
      delete amount;
      
      destElem.input.val('');
      $("#SendAmount").val('');
      $("#SendDestName").val('');
      $("#SendDestNameRow").hide();
      $("#AddressDisplay").val('');
      $("#AddressDisplayRow").hide();
      $("#SpacerRow").show();
    }
    
    sendPageButton.text("Send Money");
    ncc.misc.forms.enable('#t-send');
    destElem.cleanup();
  }
})();
