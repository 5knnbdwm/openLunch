require('custom-env').env()

const {
  App,
  LogLevel
} = require('@slack/bolt');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  // logLevel: LogLevel.DEBUG,
});

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/slack_bot', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
mongoose.set('useFindAndModify', false);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  // we're connected!
});

var UserSchema = new mongoose.Schema({
  idUser: String,
  idChannel: String,
  lastActivity: Date,
  location: Object,
  status: Number
});
var usermodel = mongoose.model('user', UserSchema);
var ActivitySchema = new mongoose.Schema({
  idUser: String,
  idChannel: String,
  activity: Date
});
var activitymodel = mongoose.model('activity', ActivitySchema);
var EventSchema = new mongoose.Schema({
  idUserOwner: String,
  idChannelOwner: String,
  locationName: String,
  locationLink: String,
  time: Date,
  maxPeople: Number,
  idUserMember: Array,
  idChannelMember: Array,
  status: Number
});
var eventmodel = mongoose.model('event', EventSchema);

const messageStore = {
  "missing": {
    "blocks": [{
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": `>*Something is missing here*`
      }
    }]
  }
}

// Helper functions

function filterDistrict(_city) {
  const city = _city
  const district = [{
    "name": "Berlin",
    "item": [{
      "text": {
        "type": "plain_text",
        "text": "Adlershof",
        "emoji": true
      },
      "value": "Adlershof"
    }, {
      "text": {
        "type": "plain_text",
        "text": "Charlottenburg",
        "emoji": true
      },
      "value": "Charlottenburg"
    }, {
      "text": {
        "type": "plain_text",
        "text": "Friedrichshain",
        "emoji": true
      },
      "value": "Friedrichshain"
    }, {
      "text": {
        "type": "plain_text",
        "text": "Köpenick",
        "emoji": true
      },
      "value": "Köpenick"
    }, {
      "text": {
        "type": "plain_text",
        "text": "Kreuzberg",
        "emoji": true
      },
      "value": "Kreuzberg"
    }, {
      "text": {
        "type": "plain_text",
        "text": "Lankwitz",
        "emoji": true
      },
      "value": "Lankwitz"
    }, {
      "text": {
        "type": "plain_text",
        "text": "Lichtenberg",
        "emoji": true
      },
      "value": "Lichtenberg"
    }, {
      "text": {
        "type": "plain_text",
        "text": "Lichtenrade",
        "emoji": true
      },
      "value": "Lichtenrade"
    }, {
      "text": {
        "type": "plain_text",
        "text": "Lichterfelde",
        "emoji": true
      },
      "value": "Lichterfelde"
    }, {
      "text": {
        "type": "plain_text",
        "text": "Marienfelde",
        "emoji": true
      },
      "value": "Marienfelde"
    }, {
      "text": {
        "type": "plain_text",
        "text": "Marzahn",
        "emoji": true
      },
      "value": "Marzahn"
    }, {
      "text": {
        "type": "plain_text",
        "text": "Mitte",
        "emoji": true
      },
      "value": "Mitte"
    }, {
      "text": {
        "type": "plain_text",
        "text": "Neukölln",
        "emoji": true
      },
      "value": "Neukölln"
    }, {
      "text": {
        "type": "plain_text",
        "text": "Pankow",
        "emoji": true
      },
      "value": "Pankow"
    }, {
      "text": {
        "type": "plain_text",
        "text": "Prenzlauer Berg",
        "emoji": true
      },
      "value": "Prenzlauer Berg"
    }, {
      "text": {
        "type": "plain_text",
        "text": "Reinickendorf",
        "emoji": true
      },
      "value": "Reinickendorf"
    }, {
      "text": {
        "type": "plain_text",
        "text": "Schöneberg",
        "emoji": true
      },
      "value": "Schöneberg"
    }, {
      "text": {
        "type": "plain_text",
        "text": "Wannsee",
        "emoji": true
      },
      "value": "Wannsee"
    }, {
      "text": {
        "type": "plain_text",
        "text": "Wedding",
        "emoji": true
      },
      "value": "Wedding"
    }, {
      "text": {
        "type": "plain_text",
        "text": "Weißensee",
        "emoji": true
      },
      "value": "Weißensee"
    }, {
      "text": {
        "type": "plain_text",
        "text": "Wittenau",
        "emoji": true
      },
      "value": "Wittenau"
    }, {
      "text": {
        "type": "plain_text",
        "text": "Zehlendo",
        "emoji": true
      },
      "value": "Zehlendo"
    }]
  }]
  var element
  for (var i = 0; i < district.length; i++) {
    if (district[i].name === city) {
      element = district[i].item
    }
  }
  // element = district[0].item
  return element
}

function filterPostCode(_district) {
  const district = _district
  const postCode = [{
      "name": "Mitte",
      "item": [{
        "text": {
          "type": "plain_text",
          "text": "10115",
          "emoji": true
        },
        "value": "10115"
      }, {
        "text": {
          "type": "plain_text",
          "text": "10117",
          "emoji": true
        },
        "value": "10117"
      }, {
        "text": {
          "type": "plain_text",
          "text": "10119",
          "emoji": true
        },
        "value": "10119"
      }, {
        "text": {
          "type": "plain_text",
          "text": "10178",
          "emoji": true
        },
        "value": "10178"
      }, {
        "text": {
          "type": "plain_text",
          "text": "10179",
          "emoji": true
        },
        "value": "10179"
      }]
    },
    {
      "name": "Friedrichshain",
      "item": [{
        "text": {
          "type": "plain_text",
          "text": "10243",
          "emoji": true
        },
        "value": "10243"
      }, {
        "text": {
          "type": "plain_text",
          "text": "10245",
          "emoji": true
        },
        "value": "10245"
      }, {
        "text": {
          "type": "plain_text",
          "text": "10247",
          "emoji": true
        },
        "value": "10247"
      }, {
        "text": {
          "type": "plain_text",
          "text": "10249",
          "emoji": true
        },
        "value": "10249"
      }]
    },
    {
      "name": "Lichtenberg",
      "item": [{
        "text": {
          "type": "plain_text",
          "text": "10318",
          "emoji": true
        },
        "value": "10318"
      }, {
        "text": {
          "type": "plain_text",
          "text": "10319",
          "emoji": true
        },
        "value": "10319"
      }]
    },
    {
      "name": "Prenzlauer Berg",
      "item": [{
        "text": {
          "type": "plain_text",
          "text": "10405",
          "emoji": true
        },
        "value": "10405"
      }, {
        "text": {
          "type": "plain_text",
          "text": "10407",
          "emoji": true
        },
        "value": "10407"
      }, {
        "text": {
          "type": "plain_text",
          "text": "10409",
          "emoji": true
        },
        "value": "10409"
      }, {
        "text": {
          "type": "plain_text",
          "text": "10435",
          "emoji": true
        },
        "value": "10435"
      }, {
        "text": {
          "type": "plain_text",
          "text": "10437",
          "emoji": true
        },
        "value": "10437"
      }, {
        "text": {
          "type": "plain_text",
          "text": "10439",
          "emoji": true
        },
        "value": "10439"
      }]
    },
    {
      "name": "Charlottenburg",
      "item": [{
        "text": {
          "type": "plain_text",
          "text": "10585",
          "emoji": true
        },
        "value": "10585"
      }, {
        "text": {
          "type": "plain_text",
          "text": "10587",
          "emoji": true
        },
        "value": "10587"
      }, {
        "text": {
          "type": "plain_text",
          "text": "10589",
          "emoji": true
        },
        "value": "10589"
      }, {
        "text": {
          "type": "plain_text",
          "text": "10623",
          "emoji": true
        },
        "value": "10623"
      }, {
        "text": {
          "type": "plain_text",
          "text": "10625",
          "emoji": true
        },
        "value": "10625"
      }, {
        "text": {
          "type": "plain_text",
          "text": "10627",
          "emoji": true
        },
        "value": "10627"
      }, {
        "text": {
          "type": "plain_text",
          "text": "10629",
          "emoji": true
        },
        "value": "10629"
      }]
    },
    {
      "name": "Schöneberg",
      "item": [{
        "text": {
          "type": "plain_text",
          "text": "10823",
          "emoji": true
        },
        "value": "10823"
      }, {
        "text": {
          "type": "plain_text",
          "text": "10825",
          "emoji": true
        },
        "value": "10825"
      }, {
        "text": {
          "type": "plain_text",
          "text": "10827",
          "emoji": true
        },
        "value": "10827"
      }, {
        "text": {
          "type": "plain_text",
          "text": "10829",
          "emoji": true
        },
        "value": "10829"
      }]
    },
    {
      "name": "Kreuzberg",
      "item": [{
        "text": {
          "type": "plain_text",
          "text": "10961",
          "emoji": true
        },
        "value": "10961"
      }, {
        "text": {
          "type": "plain_text",
          "text": "10963",
          "emoji": true
        },
        "value": "10963"
      }, {
        "text": {
          "type": "plain_text",
          "text": "10965",
          "emoji": true
        },
        "value": "10965"
      }, {
        "text": {
          "type": "plain_text",
          "text": "10967",
          "emoji": true
        },
        "value": "10967"
      }, {
        "text": {
          "type": "plain_text",
          "text": "10969",
          "emoji": true
        },
        "value": "10969"
      }, {
        "text": {
          "type": "plain_text",
          "text": "10997",
          "emoji": true
        },
        "value": "10997"
      }, {
        "text": {
          "type": "plain_text",
          "text": "10999",
          "emoji": true
        },
        "value": "10999"
      }]
    },
    {
      "name": "Neukölln",
      "item": [{
        "text": {
          "type": "plain_text",
          "text": "12043",
          "emoji": true
        },
        "value": "12043"
      }, {
        "text": {
          "type": "plain_text",
          "text": "12045",
          "emoji": true
        },
        "value": "12045"
      }, {
        "text": {
          "type": "plain_text",
          "text": "12047",
          "emoji": true
        },
        "value": "12047"
      }, {
        "text": {
          "type": "plain_text",
          "text": "12049",
          "emoji": true
        },
        "value": "12049"
      }, {
        "text": {
          "type": "plain_text",
          "text": "12051",
          "emoji": true
        },
        "value": "12051"
      }, {
        "text": {
          "type": "plain_text",
          "text": "12053",
          "emoji": true
        },
        "value": "12053"
      }, {
        "text": {
          "type": "plain_text",
          "text": "12055",
          "emoji": true
        },
        "value": "12055"
      }, {
        "text": {
          "type": "plain_text",
          "text": "12057",
          "emoji": true
        },
        "value": "12057"
      }, {
        "text": {
          "type": "plain_text",
          "text": "12059",
          "emoji": true
        },
        "value": "12059"
      }]
    },
    {
      "name": "Lichterfelde",
      "item": [{
        "text": {
          "type": "plain_text",
          "text": "12203",
          "emoji": true
        },
        "value": "12203"
      }, {
        "text": {
          "type": "plain_text",
          "text": "12205",
          "emoji": true
        },
        "value": "12205"
      }, {
        "text": {
          "type": "plain_text",
          "text": "12207",
          "emoji": true
        },
        "value": "12207"
      }, {
        "text": {
          "type": "plain_text",
          "text": "12209",
          "emoji": true
        },
        "value": "12209"
      }]
    },
    {
      "name": "Lankwitz",
      "item": [{
        "text": {
          "type": "plain_text",
          "text": "12247",
          "emoji": true
        },
        "value": "12247"
      }, {
        "text": {
          "type": "plain_text",
          "text": "12249",
          "emoji": true
        },
        "value": "12249"
      }]
    },
    {
      "name": "Marienfelde",
      "item": [{
        "text": {
          "type": "plain_text",
          "text": "12277",
          "emoji": true
        },
        "value": "12277"
      }, {
        "text": {
          "type": "plain_text",
          "text": "12279",
          "emoji": true
        },
        "value": "12279"
      }]
    },
    {
      "name": "Lichtenrade",
      "item": [{
        "text": {
          "type": "plain_text",
          "text": "12305",
          "emoji": true
        },
        "value": "12305"
      }, {
        "text": {
          "type": "plain_text",
          "text": "12307",
          "emoji": true
        },
        "value": "12307"
      }, {
        "text": {
          "type": "plain_text",
          "text": "12309",
          "emoji": true
        },
        "value": "12309"
      }]
    },
    {
      "name": "Adlershof",
      "item": [{
        "text": {
          "type": "plain_text",
          "text": "12487",
          "emoji": true
        },
        "value": "12487"
      }, {
        "text": {
          "type": "plain_text",
          "text": "12489",
          "emoji": true
        },
        "value": "12489"
      }]
    },
    {
      "name": "Köpenick",
      "item": [{
        "text": {
          "type": "plain_text",
          "text": "12555",
          "emoji": true
        },
        "value": "12555"
      }, {
        "text": {
          "type": "plain_text",
          "text": "12557",
          "emoji": true
        },
        "value": "12557"
      }, {
        "text": {
          "type": "plain_text",
          "text": "12559",
          "emoji": true
        },
        "value": "12559"
      }]
    },
    {
      "name": "Marzahn",
      "item": [{
        "text": {
          "type": "plain_text",
          "text": "12679",
          "emoji": true
        },
        "value": "12679"
      }, {
        "text": {
          "type": "plain_text",
          "text": "12681",
          "emoji": true
        },
        "value": "12681"
      }, {
        "text": {
          "type": "plain_text",
          "text": "12683",
          "emoji": true
        },
        "value": "12683"
      }, {
        "text": {
          "type": "plain_text",
          "text": "12685",
          "emoji": true
        },
        "value": "12685"
      }, {
        "text": {
          "type": "plain_text",
          "text": "12687",
          "emoji": true
        },
        "value": "12687"
      }, {
        "text": {
          "type": "plain_text",
          "text": "12689",
          "emoji": true
        },
        "value": "12689"
      }]
    },
    {
      "name": "Weißensee",
      "item": [{
        "text": {
          "type": "plain_text",
          "text": "13086",
          "emoji": true
        },
        "value": "13086"
      }, {
        "text": {
          "type": "plain_text",
          "text": "13088",
          "emoji": true
        },
        "value": "13088"
      }, {
        "text": {
          "type": "plain_text",
          "text": "13089",
          "emoji": true
        },
        "value": "13089"
      }]
    },
    {
      "name": "Pankow",
      "item": [{
        "text": {
          "type": "plain_text",
          "text": "13187",
          "emoji": true
        },
        "value": "13187"
      }, {
        "text": {
          "type": "plain_text",
          "text": "13189",
          "emoji": true
        },
        "value": "13189"
      }]
    },
    {
      "name": "Wedding",
      "item": [{
        "text": {
          "type": "plain_text",
          "text": "13347",
          "emoji": true
        },
        "value": "13347"
      }, {
        "text": {
          "type": "plain_text",
          "text": "13349",
          "emoji": true
        },
        "value": "13349"
      }, {
        "text": {
          "type": "plain_text",
          "text": "13351",
          "emoji": true
        },
        "value": "13351"
      }, {
        "text": {
          "type": "plain_text",
          "text": "13353",
          "emoji": true
        },
        "value": "13353"
      }, {
        "text": {
          "type": "plain_text",
          "text": "13355",
          "emoji": true
        },
        "value": "13355"
      }, {
        "text": {
          "type": "plain_text",
          "text": "13357",
          "emoji": true
        },
        "value": "13357"
      }, {
        "text": {
          "type": "plain_text",
          "text": "13359",
          "emoji": true
        },
        "value": "13359"
      }]
    },
    {
      "name": "Reinickendorf",
      "item": [{
        "text": {
          "type": "plain_text",
          "text": "13403",
          "emoji": true
        },
        "value": "13403"
      }, {
        "text": {
          "type": "plain_text",
          "text": "13405",
          "emoji": true
        },
        "value": "13405"
      }, {
        "text": {
          "type": "plain_text",
          "text": "13407",
          "emoji": true
        },
        "value": "13407"
      }, {
        "text": {
          "type": "plain_text",
          "text": "13409",
          "emoji": true
        },
        "value": "13409"
      }]
    },
    {
      "name": "Wittenau",
      "item": [{
        "text": {
          "type": "plain_text",
          "text": "13435",
          "emoji": true
        },
        "value": "13435"
      }, {
        "text": {
          "type": "plain_text",
          "text": "13437",
          "emoji": true
        },
        "value": "13437"
      }, {
        "text": {
          "type": "plain_text",
          "text": "13439",
          "emoji": true
        },
        "value": "13439"
      }]
    },
    {
      "name": "Wannsee",
      "item": [{
        "text": {
          "type": "plain_text",
          "text": "14109",
          "emoji": true
        },
        "value": "14109"
      }]
    },
    {
      "name": "Zehlendorf",
      "item": [{
        "text": {
          "type": "plain_text",
          "text": "14163",
          "emoji": true
        },
        "value": "14163"
      }, {
        "text": {
          "type": "plain_text",
          "text": "14165",
          "emoji": true
        },
        "value": "14165"
      }, {
        "text": {
          "type": "plain_text",
          "text": "14167",
          "emoji": true
        },
        "value": "14167"
      }, {
        "text": {
          "type": "plain_text",
          "text": "14169",
          "emoji": true
        },
        "value": "14169"
      }]
    }
  ]
  var element
  for (var i = 0; i < postCode.length; i++) {
    if (postCode[i].name === district) {
      element = postCode[i].item
    }
  }
  return element
}

// Slack events

app.event('app_home_opened', async ({
  context,
  event,
  say
}) => {
  userCallback = await usermodel.findOne({
    idUser: event.user,
    idChannel: event.channel
  });
  if (userCallback !== null) {
    var userActivity = new Date(userCallback.lastActivity.getTime() + 6 * 3600 * 1000)
    if (userActivity < new Date()) {
      say({
        "blocks": messageStore.missing.blocks
      })
      // second option, if last userActivity + 6 hours is smaller than the current time  
    } else {
      console.log('user in db')
    }
  } else {
    // there is no user with the channel and the user ID. User has to accept the privacy policy first and set up the account
    let history = await app.client.im.history({
      token: context.botToken,
      channel: event.channel,
      count: 1 // we only need to check if >=1 messages exist
    })

    // if there was no prior interaction (= 0 messages),
    // it's save to send a welcome message
    if (!history.messages.length) {
      say({
        "blocks": [{
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "Please accept the privacy policy."
            }
          },
          {
            "type": "actions",
            "elements": [{
                "type": "button",
                "text": {
                  "type": "plain_text",
                  "emoji": true,
                  "text": "Approve"
                },
                "style": "primary",
                "action_id": "account_setup_approved"
              },
              {
                "type": "button",
                "text": {
                  "type": "plain_text",
                  "emoji": true,
                  "text": "Deny"
                },
                "action_id": "account_setup_denied"
              }
            ]
          }
        ]
      })
    }
  }
})

app.action('account_setup_approved', async ({
  ack,
  body,
  respond,
  say
}) => {
  ack()
  respond({
    "blocks": [{
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "Please accept the privacy policy."
      }
    }],
    "attachments": [{
      "blocks": [{
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `:white_check_mark: <@${body.user.id}> accepted the Privacy Policy.`
        }
      }]
    }]
  })
  var userAdd = new usermodel({
    idUser: body.user.id,
    idChannel: body.channel.id,
    lastActivity: new Date(),
    location: {
      "geo": "",
      "city": "",
      "district": "",
      "postCode": ""
    },
    status: -2
  });
  await userAdd.save();
  say({
    "blocks": [{
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": "To complete your onboarding please give complete your information regarding your location. \n\n*The service is currently limited to Germany. This means any information regarding locations outside of Germany will very likely not work.*"
        }
      },
      {
        "type": "actions",
        "elements": [{
          "type": "static_select",
          "action_id": "account_setup_city",
          "placeholder": {
            "type": "plain_text",
            "text": "Select an City",
            "emoji": true
          },
          "options": [{
            "text": {
              "type": "plain_text",
              "text": "Berlin",
              "emoji": true
            },
            "value": "Berlin"
          }],
        }]
      }
    ]
  })
})

app.action('account_setup_denied', ({
  ack,
  body,
  respond,
  say
}) => {
  ack();
  respond({
    "blocks": [{
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "Please accept the privacy policy."
      }
    }],
    "attachments": [{
      "blocks": [{
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `:x: <@${body.user.id}> denied the Privacy Policy.`
        }
      }]
    }]
  })
  say({
    "blocks": [{
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": "If you however change your mind, click here to see the Privacvy Policy again."
        }
      },
      {
        "type": "actions",
        "elements": [{
          "type": "button",
          "text": {
            "type": "plain_text",
            "emoji": true,
            "text": "View again"
          },
          "action_id": "account_setup_review"
        }]
      }
    ]
  })
})

app.action('account_setup_review', ({
  ack,
  say
}) => {
  ack();
  say({
    "blocks": [{
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": "Please accept the privacy policy."
        }
      },
      {
        "type": "actions",
        "elements": [{
            "type": "button",
            "text": {
              "type": "plain_text",
              "emoji": true,
              "text": "Approve"
            },
            "style": "primary",
            "action_id": "account_setup_approved"
          },
          {
            "type": "button",
            "text": {
              "type": "plain_text",
              "emoji": true,
              "text": "Deny"
            },
            "action_id": "account_setup_denied"
          }
        ]
      }
    ]
  })
})

app.action('account_setup_city', async ({
  ack,
  body,
  action,
  respond
}) => {
  ack()

  const user = await usermodel.findOne({
    idUser: body.user.id,
    idChannel: body.channel.id
  })
  await usermodel.findOneAndUpdate({
    idUser: body.user.id,
    idChannel: body.channel.id
  }, {
    location: {
      "geo": "",
      "city": action.selected_option.value,
      "district": "",
      "postCode": ""
    },
  })

  const districtOptions = filterDistrict(action.selected_option.value)

  respond({
    "blocks": [{
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": "To complete your onboarding please give complete your information regarding your location. \n\n*The service is currently limited to Germany. This means any information regarding locations outside of Germany will very likely not work.*"
        }
      },
      {
        "type": "actions",
        "elements": [{
            "type": "static_select",
            "action_id": "account_setup_city",
            "placeholder": {
              "type": "plain_text",
              "text": "Select a City",
              "emoji": true
            },
            "options": [{
              "text": {
                "type": "plain_text",
                "text": "Berlin",
                "emoji": true
              },
              "value": "Berlin"
            }],
            "initial_option": {
              "text": {
                "type": "plain_text",
                "text": action.selected_option.value,
                "emoji": true
              },
              "value": action.selected_option.value
            }
          },
          {
            "type": "static_select",
            "action_id": "account_setup_district",
            "placeholder": {
              "type": "plain_text",
              "text": "Select a District",
              "emoji": true
            },
            "options": districtOptions
          }
        ]
      }
    ]
  })
});

app.action('account_setup_district', async ({
  ack,
  body,
  action,
  respond
}) => {
  ack()

  const user = await usermodel.findOne({
    idUser: body.user.id,
    idChannel: body.channel.id
  })
  await usermodel.findOneAndUpdate({
    idUser: body.user.id,
    idChannel: body.channel.id
  }, {
    location: {
      "geo": "",
      "city": user.location.city,
      "district": action.selected_option.value,
      "postCode": ""
    },
  })

  const districtOptions = filterDistrict(user.location.city)
  const postCodeOptions = filterPostCode(action.selected_option.value)

  respond({
    "blocks": [{
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": "To complete your onboarding please give complete your information regarding your location. \n\n*The service is currently limited to Germany. This means any information regarding locations outside of Germany will very likely not work.*"
        }
      },
      {
        "type": "actions",
        "elements": [{
            "type": "static_select",
            "action_id": "account_setup_city",
            "placeholder": {
              "type": "plain_text",
              "text": "Select a City",
              "emoji": true
            },
            "options": [{
              "text": {
                "type": "plain_text",
                "text": "Berlin",
                "emoji": true
              },
              "value": "Berlin"
            }],
            "initial_option": {
              "text": {
                "type": "plain_text",
                "text": user.location.city,
                "emoji": true
              },
              "value": user.location.city
            }
          },
          {
            "type": "static_select",
            "action_id": "account_setup_district",
            "placeholder": {
              "type": "plain_text",
              "text": "Select a District",
              "emoji": true
            },
            "options": districtOptions,
            "initial_option": {
              "text": {
                "type": "plain_text",
                "text": action.selected_option.value,
                "emoji": true
              },
              "value": action.selected_option.value
            }
          },
          {
            "type": "static_select",
            "action_id": "account_setup_postcode",
            "placeholder": {
              "type": "plain_text",
              "text": "Select a District",
              "emoji": true
            },
            "options": postCodeOptions,
          }
        ]
      }
    ]
  })
});

app.action('account_setup_postcode', async ({
  ack,
  body,
  action,
  respond
}) => {
  ack()

  const user = await usermodel.findOne({
    idUser: body.user.id,
    idChannel: body.channel.id
  })
  await usermodel.findOneAndUpdate({
    idUser: body.user.id,
    idChannel: body.channel.id
  }, {
    location: {
      "geo": "",
      "city": user.location.city,
      "district": user.location.district,
      "postCode": action.selected_option.value
    },
  })

  const districtOptions = filterDistrict(user.location.city)
  const postCodeOptions = filterPostCode(user.location.district)

  respond({
    "blocks": [{
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": "To complete your onboarding please give complete your information regarding your location. \n\n*The service is currently limited to Germany. This means any information regarding locations outside of Germany will very likely not work.*"
        }
      },
      {
        "type": "actions",
        "elements": [{
            "type": "static_select",
            "action_id": "account_setup_city",
            "placeholder": {
              "type": "plain_text",
              "text": "Select a City",
              "emoji": true
            },
            "options": [{
              "text": {
                "type": "plain_text",
                "text": "Berlin",
                "emoji": true
              },
              "value": "Berlin"
            }],
            "initial_option": {
              "text": {
                "type": "plain_text",
                "text": user.location.city,
                "emoji": true
              },
              "value": user.location.city
            }
          },
          {
            "type": "static_select",
            "action_id": "account_setup_district",
            "placeholder": {
              "type": "plain_text",
              "text": "Select a District",
              "emoji": true
            },
            "options": districtOptions,
            "initial_option": {
              "text": {
                "type": "plain_text",
                "text": user.location.district,
                "emoji": true
              },
              "value": user.location.district
            }
          },
          {
            "type": "static_select",
            "action_id": "account_setup_postcode",
            "placeholder": {
              "type": "plain_text",
              "text": "Select a District",
              "emoji": true
            },
            "options": postCodeOptions,
            "initial_option": {
              "text": {
                "type": "plain_text",
                "text": action.selected_option.value,
                "emoji": true
              },
              "value": action.selected_option.value
            }
          },
          {
            "type": "button",
            "text": {
              "type": "plain_text",
              "text": "Confirm",
              "emoji": true
            },
            "action_id": "account_setup_confirm"
          }
        ]
      }
    ]
  })
});

app.action('account_setup_confirm', async ({
  ack,
  body,
  action,
  respond,
  say
}) => {
  ack()

  await usermodel.findOneAndUpdate({
    idUser: body.user.id,
    idChannel: body.channel.id
  }, {
    lastActivity: new Date(),
    status: 0
  })

  respond({
    "text": ">:gear: Your Profile has been updated."
  })
  say('_! status message !_')
})

app.action('', async ({
  ack,
  action
}) => {
  ack()
  console.log(action)
})

app.error((error) => {
  // Check the details of the error to handle cases where you should retry sending a message or stop the app
  console.error(error)
});

(async () => {
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ Bolt app is running!');
})();