var ui = {
  alert: function (title, msg) {
    title = title || '';
    var app = [NSApplication sharedApplication];
    [app displayDialog:msg withTitle:title];
  }
};
