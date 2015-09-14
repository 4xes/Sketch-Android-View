var ui = {
  alert: function (title, msg) {
    title = title || '';
    var app = [NSApplication sharedApplication];
    [app displayDialog:msg withTitle:title];
  }

  // directory: function(){
  //   var openPanel = [NSOpenPanel openPanel]
  //   [openPanel setCanChooseDirectories:true
  //   [openPanel setCanCreateDirectories:true]
  //   [openPanel setDirectoryURL:[NSURL fileURLWithPath:"~/Documents/"]]
  //
  //   [openPanel setTitle:"Choose a directory"]
  //   [openPanel setPrompt:"Choose"]
  //   [openPanel runModal]
  //
  //   openPanel
  // }
};
