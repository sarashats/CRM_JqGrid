OrderPayments = {
  __namespace: true,
  baseUrl: ''
};

 OrderPayments.EntityId = null;

 OrderPayments.Load = function () {

  var parameters = location.search.replace("?", "").split("&");
  for (var i = 0; i < parameters.length; i++) {
    var paramName = parameters[i].split("=")[0];
    var paramValue = parameters[i].split("=")[1];
    if (paramName == "id")
       OrderPayments.EntityId = paramValue.replace("%7b", "").replace("%7d", "").replace("{", "").replace("}", "");
  }

   OrderPayments.GetPayments(OrderPayments.loadGrid);
}

 OrderPayments.GetPayments = function (callback) {
  if ( OrderPayments.EntityId != '' && OrderPayments.EntityId != null) {
    // Call action and get payments
     CrmWebAPI.ExecuteAction("new_orders", OrderPayments.EntityId, "new_GetOrderPayments", null,
      function (data) {
        callback(JSON.parse(data.Payments));
      }, Common.Fail, true);
  }
}

 OrderPayments.loadGrid = function (data) {
  if (data != null) {
    $("#paymentGrid").jqGrid({
      data: data,
      datatype: "local",
      height: 280,
      width: 1000,
      rowNum: 5,
      pager: '#paymentPager',
      sortname: 'FNCDATE',
      sortorder: "desc",
      caption: "&nbsp;",
      direction: "rtl",
      shrinkToFit: true,
      autowidth: true,
      showSingleSelectRadio: false,
      colNames: ['פרטים', 'חובה', 'זכות', 'אסמכתא', 'תאריך ערך', 'סוג תנועה', 'הפק קבלה'],
      colModel: [
        { name: 'DETAILS', index: 'DETAILS', align: "right", width: 300 },
        { name: 'DEBIT1', index: 'DEBIT1', align: "right", width: 100 },
        { name: 'CREDIT1', index: 'CREDIT1', align: "right", width: 100 },
        { name: 'IVNUM', index: 'IVNUM', key: true, align: "right", width: 200 },
        {
          name: 'FNCDATE', index: 'FNCDATE', align: "right", width: 200,
          formatter: function (value, datafield, row) {
            return value.substring(0, value.indexOf('T'));
          }
        },
        { name: 'TYRA_IV', index: 'TYRA_IV', hidden: true, align: "right" },
        {
          name: 'link', align: "left", width: 100,
          formatter: function (value, datafield, row) {
            var links = '';
            if (row["TYRA_CHAR1"] == "T") {
              links += '<a class="link" href="#" title="הדפס" onclick="getReceipt(\'' + row["TYRA_IV"] + '\',3)"><img src="/TalcarTest/WebResources/new_receipt_icon" /></a>'
              links += '<a class="link" href="#" title="שלח מייל" onclick="getReceipt(\'' + row["TYRA_IV"] + '\',2)"><img src="/TalcarTest/WebResources/new_email_icon" /></a>'
              links += '<a class="link" href="#" title="שלח SMS" onclick="getReceipt(\'' + row["TYRA_IV"] + '\',1)"><img src="/TalcarTest/WebResources/new_sms_icon" /></a>'
            }
            return links;
          }
        }
      ],
      jsonReader: {
        //root: 'ipInfo.ipResponses',
        id: 'IVNUM',
        repeatitems: false,
        page: function (obj) { return 1; },
        total: function (obj) { return 1; },
        records: function (obj) { return obj.length; },
      }
    });
    $('#paymentGrid').jqGrid('navGrid', '#paymentPager', {
      edit: false,
      add: false,
      del: false,
      search: false,
      refresh: true,
      refreshstate: "current"
    });
  }
  else {
    jQuery("#noData").show();
  }
}

var getReceipt = function (refNumber, sendMethod) {
  if (OrderPayments.EntityId != '' && OrderPayments.EntityId != null) {
    var inputParams = {
      "RefNumber": refNumber,
      "SendMethod": sendMethod
    };
    Xrm.Utility.showProgressIndicator("מפיק קבלה");

    // Call action
    CrmWebAPI.ExecuteAction("new_orders", OrderPayments.EntityId, "new_GetReceipt", inputParams,
      function (data) {
        Xrm.Utility.closeProgressIndicator();

        if (sendMethod != 3)
          Common.AlertDialog("קבלה נשלחה ללקוח בהצלחה");

        if (sendMethod == 3 && data.ReceiptLink != null && data.ReceiptLink != "")
          window.open(data.ReceiptLink);
      }, Common.Fail, true);
  }
}
