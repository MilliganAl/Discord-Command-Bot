
module.exports = {
    SendEmbededMessage: function (date, uri, avi , name) {
      var embedMessage = {embed: {
      color: 3447003,
      author: {
        name: name,
        icon_url: avi
      },
      title: "Here is your video",
      url: uri,
      description: "This Clip Was Recorded on " +date,
      timestamp: new Date(),
      footer: {
        icon_url: avi,
        text: "© name"
      }
    }
  };
  return embedMessage;
    },
  };