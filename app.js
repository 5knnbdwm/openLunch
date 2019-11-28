require('custom-env').env()
var request = require('request')
var rp = require('request-promise')

const {
  App,
  LogLevel
} = require('@slack/bolt')

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  // logLevel: LogLevel.DEBUG,
})

const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/slack_bot', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
mongoose.set('useFindAndModify', false)

var db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function () {
  // we're connected!
})

var UserSchema = new mongoose.Schema({
  idUser: String,
  idChannel: String,
  lastActivity: Date,
  location: Object,
  status: Number
})
var usermodel = mongoose.model('user', UserSchema)
var ActivitySchema = new mongoose.Schema({
  idUser: String,
  idChannel: String,
  kind: Array,
  activity: Date
})
var activitymodel = mongoose.model('activity', ActivitySchema)
var EventSchema = new mongoose.Schema({
  idUserOwner: String,
  idChannelOwner: String,
  location: Object,
  time: String,
  maxPeople: Number,
  idUserMember: Array,
  idChannelMember: Array,
  status: Number
})
var eventmodel = mongoose.model('event', EventSchema)

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

function filterGeo(_postcode) {
  const postcode = _postcode
  const geo = [
    ["10115", "52.532,13.3922"],
    ["10117", "52.5161,13.3874"],
    ["10119", "52.5285,13.4109"],
    ["10178", "52.5233,13.4138"],
    ["10179", "52.5136,13.4232"],
    ["10243", "52.5056,13.4487"],
    ["10245", "52.5167,13.4"],
    ["10247", "52.515,13.4608"],
    ["10249", "52.5167,13.4"],
    ["10318", "52.5167,13.4"],
    ["10319", "52.5167,13.4"],
    ["10405", "52.539,13.424"],
    ["10407", "52.5332,13.4464"],
    ["10409", "52.5167,13.4"],
    ["10435", "52.5167,13.4"],
    ["10437", "52.5466,13.4146"],
    ["10439", "52.553,13.4142"],
    ["10585", "52.5178,13.301"],
    ["10587", "52.5154,13.3194"],
    ["10589", "52.5167,13.4"],
    ["10623", "52.5076,13.3274"],
    ["10625", "52.5092,13.3158"],
    ["10627", "52.5086,13.3033"],
    ["10629", "52.5032,13.3134"],
    ["10823", "52.5167,13.4"],
    ["10825", "52.4889,13.3438"],
    ["10827", "52.4853,13.355"],
    ["10829", "52.4809,13.3619"],
    ["10961", "52.4924,13.3908"],
    ["10963", "52.4992,13.3812"],
    ["10965", "52.4887,13.3781"],
    ["10967", "52.4921,13.4137"],
    ["10969", "52.5038,13.41"],
    ["10997", "52.5002,13.437"],
    ["10999", "52.4992,13.4307"],
    ["12043", "52.4788,13.4374"],
    ["12045", "52.5167,13.4"],
    ["12047", "52.4873,13.4269"],
    ["12049", "52.4789,13.4228"],
    ["12051", "52.5167,13.4"],
    ["12053", "52.5167,13.4"],
    ["12055", "52.4693,13.4417"],
    ["12057", "52.4654,13.4425"],
    ["12059", "52.5167,13.4"],
    ["12203", "52.5167,13.4"],
    ["12205", "52.5167,13.4"],
    ["12207", "52.5167,13.4"],
    ["12209", "52.5167,13.4"],
    ["12247", "52.5167,13.4"],
    ["12249", "52.5167,13.4"],
    ["12277", "52.5167,13.4"],
    ["12279", "52.5167,13.4"],
    ["12305", "52.5167,13.4"],
    ["12307", "52.5167,13.4"],
    ["12309", "52.5167,13.4"],
    ["12487", "52.5167,13.4"],
    ["12489", "52.5167,13.4"],
    ["12555", "52.5167,13.4"],
    ["12557", "52.5167,13.4"],
    ["12559", "52.5167,13.4"],
    ["12679", "52.5167,13.4"],
    ["12681", "52.5167,13.4"],
    ["12683", "52.5167,13.4"],
    ["12685", "52.5167,13.4"],
    ["12687", "52.5167,13.4"],
    ["12689", "52.5167,13.4"],
    ["13086", "52.5167,13.4"],
    ["13088", "52.558,13.4697"],
    ["13089", "52.5714,13.4308"],
    ["13187", "52.5731,13.4171"],
    ["13189", "52.5677,13.423"],
    ["13347", "52.5449,13.3623"],
    ["13349", "52.5544,13.3447"],
    ["13351", "52.5167,13.4"],
    ["13353", "52.5427,13.3557"],
    ["13355", "52.5167,13.4"],
    ["13357", "52.5517,13.3843"],
    ["13359", "52.5565,13.3911"],
    ["13403", "52.5723,13.324"],
    ["13405", "52.567,13.313"],
    ["13407", "52.5698,13.3416"],
    ["13409", "52.5586,13.3668"],
    ["13435", "52.5993,13.3537"],
    ["13437", "52.5922,13.3312"],
    ["13439", "52.598,13.358"],
    ["14109", "52.5167,13.4"],
    ["14163", "52.5167,13.4"],
    ["14165", "52.5167,13.4"],
    ["14167", "52.5167,13.4"],
    ["14169", "52.5167,13.4"]
  ]
  var element
  for (var i = 0; i < geo.length; i++) {
    if (geo[i][0] === postcode) {
      element = geo[i][1]
    }
  }
  return element
}

function activityUpdate(_user, _channel, _tags) {
  const user = _user
  const channel = _channel
  const tags = _tags

  const logging = true

  var activityUpdate = new activitymodel({
    idUser: user,
    idChannel: channel,
    kind: tags,
    activity: new Date()
  })

  if (logging) {
    activityUpdate.save()
    console.log("activityUpdate: " + activityUpdate.kind)
  }
}

// Slack events

app.event('app_home_opened', async ({
  body,
  context,
  event,
  say
}) => {
  userCallback = await usermodel.findOne({
    idUser: event.user,
    idChannel: event.channel
  })
  if (userCallback !== null) {
    var userActivity = new Date(userCallback.lastActivity.getTime() + 6 * 3600 * 1000)
    if (userActivity < new Date()) {
      say({
        "blocks": [{
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "Some status message text. This is not important for the moment. It is just important that this is present."
            }
          },
          {
            "type": "actions",
            "elements": [{
                "type": "button",
                "text": {
                  "type": "plain_text",
                  "emoji": true,
                  "text": "Look for event"
                },
                "style": "primary",
                "action_id": "event_join_search"
              },
              {
                "type": "button",
                "text": {
                  "type": "plain_text",
                  "emoji": true,
                  "text": "Create event"
                },
                "action_id": "event_create_place"
              }
            ]
          }
        ]
      })

      var tags = ["app_home_opened", "after_6_hours"]
      activityUpdate(body.user.id, body.channel.id, tags)

      // second option, if last userActivity + 6 hours is smaller than the current time  
    } else {
      var tags = ["app_home_opened", "within_6_hours"]
      activityUpdate(event.user, event.channel, tags)
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
  })
  await userAdd.save()
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
  var tags = ["sign_up"]
  activityUpdate(body.user.id, body.channel.id, tags)
})

app.action('account_setup_denied', ({
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
  ack()
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
})

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
})

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
            "style": "primary",
            "action_id": "account_setup_confirm"
          }
        ]
      }
    ]
  })
})

app.action('account_setup_confirm', async ({
  ack,
  body,
  respond,
  say
}) => {
  ack()
  const user = await usermodel.findOne({
    idUser: body.user.id,
    idChannel: body.channel.id
  })

  const geoValue = filterGeo(user.location.postCode)

  await usermodel.findOneAndUpdate({
    idUser: body.user.id,
    idChannel: body.channel.id
  }, {
    lastActivity: new Date(),
    location: {
      "geo": geoValue,
      "city": user.location.city,
      "district": user.location.district,
      "postCode": user.location.postCode
    },
    status: 0
  })

  respond({
    "text": ">:gear: Your Profile has been updated."
  })
  say({
    "blocks": [{
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": "Some status message text. This is not important for the moment. It is just important that this is present."
        }
      },
      {
        "type": "actions",
        "elements": [{
            "type": "button",
            "text": {
              "type": "plain_text",
              "emoji": true,
              "text": "Look for event"
            },
            "style": "primary",
            "action_id": "event_join_search"
          },
          {
            "type": "button",
            "text": {
              "type": "plain_text",
              "emoji": true,
              "text": "Create event"
            },
            "action_id": "event_create_place"
          }
        ]
      }
    ]
  })

  var tags = ["signup_complete"]
  activityUpdate(body.user.id, body.channel.id, tags)
})

app.action('event_create_place', async ({
  ack,
  body,
  respond,
  say
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
    lastActivity: new Date(),
    status: 2
  })

  respond({
    "blocks": [{
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": "To create the event at a place of your liking you first have to specify where exatly You would like to eat. :burrito:"
        }
      },
      {
        "type": "divider"
      },
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": "*Location:*"
        }
      },
      {
        "type": "context",
        "elements": [{
          "type": "mrkdwn",
          "text": "Select by giving chat input"
        }]
      }
    ]
  })

  var tags = ["event_create"]
  activityUpdate(body.user.id, body.channel.id, tags)
})

app.message('', async ({
  say,
  message,
  context,
  body
}) => {
  const user = await usermodel.findOne({
    idUser: message.user,
    idChannel: message.channel
  }).catch(function (err) {
    console.log(err)
  })

  if (user.status === 2) {
    var results
    var optionsSearch = {
      uri: 'https://places.cit.api.here.com/places/v1/discover/search',
      qs: {
        at: user.location.geo,
        q: message.text,
        tf: "plain",
        app_id: process.env.HERE_APP_ID,
        app_code: process.env.HERE_APP_CODE
      },
      json: true
    };


    await rp(optionsSearch)
      .then(function (body) {
        results = body.results.items
      })
      .catch(function (err) {
        console.log(err)
      })

    if (results.length === 0) {
      say({
        "blocks": [{
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": ":calendar: *Your event:* Creation in progress"
            }
          },
          {
            "type": "divider"
          },
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "*Location:* No result"
            }
          },
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "_It was not possible to find a Restaurant with the name/information provided. Please try again._"
            }
          }
        ]
      })
    }
    if (results.length === 1) {
      say({
        "blocks": [{
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": ":calendar: *Your event:* Creation in progress"
            }
          },
          {
            "type": "divider"
          },
          {
            "type": "section",
            "fields": [{
                "type": "mrkdwn",
                "text": `*Name:*\n${results[0].title}`
              },
              {
                "type": "mrkdwn",
                "text": `*Location:*\n${results[0].vicinity}`
              }
            ]
          },
          {
            "type": "actions",
            "elements": [{
              "type": "static_select",
              "action_id": "event_create_time",
              "placeholder": {
                "type": "plain_text",
                "text": "Select a Time",
                "emoji": true
              },
              "options": [{
                  "text": {
                    "type": "plain_text",
                    "text": "12:00 pm",
                    "emoji": true
                  },
                  "value": "12:00"
                },
                {
                  "text": {
                    "type": "plain_text",
                    "text": "12:30 pm",
                    "emoji": true
                  },
                  "value": "12:30"
                },
                {
                  "text": {
                    "type": "plain_text",
                    "text": "13:00 pm",
                    "emoji": true
                  },
                  "value": "13:00"
                },
                {
                  "text": {
                    "type": "plain_text",
                    "text": "13:30 pm",
                    "emoji": true
                  },
                  "value": "13:30"
                },
                {
                  "text": {
                    "type": "plain_text",
                    "text": "14:00 pm",
                    "emoji": true
                  },
                  "value": "14:00"
                },
                {
                  "text": {
                    "type": "plain_text",
                    "text": "14:30 pm",
                    "emoji": true
                  },
                  "value": "14:30"
                },
                {
                  "text": {
                    "type": "plain_text",
                    "text": "15:00 pm",
                    "emoji": true
                  },
                  "value": "15:00"
                },
                {
                  "text": {
                    "type": "plain_text",
                    "text": "15:30 pm",
                    "emoji": true
                  },
                  "value": "15:30"
                },
                {
                  "text": {
                    "type": "plain_text",
                    "text": "16:00 pm",
                    "emoji": true
                  },
                  "value": "16:00"
                },
                {
                  "text": {
                    "type": "plain_text",
                    "text": "16:30 pm",
                    "emoji": true
                  },
                  "value": "16:30"
                },
                {
                  "text": {
                    "type": "plain_text",
                    "text": "17:00 pm",
                    "emoji": true
                  },
                  "value": "17:00"
                },
                {
                  "text": {
                    "type": "plain_text",
                    "text": "17:30 pm",
                    "emoji": true
                  },
                  "value": "17:30"
                },
                {
                  "text": {
                    "type": "plain_text",
                    "text": "18:00 pm",
                    "emoji": true
                  },
                  "value": "18:00"
                },
                {
                  "text": {
                    "type": "plain_text",
                    "text": "18:30 pm",
                    "emoji": true
                  },
                  "value": "18:30"
                },
                {
                  "text": {
                    "type": "plain_text",
                    "text": "19:00 pm",
                    "emoji": true
                  },
                  "value": "19:00"
                },
                {
                  "text": {
                    "type": "plain_text",
                    "text": "19:30 pm",
                    "emoji": true
                  },
                  "value": "19:30"
                },
                {
                  "text": {
                    "type": "plain_text",
                    "text": "20:00 pm",
                    "emoji": true
                  },
                  "value": "20:00"
                },
                {
                  "text": {
                    "type": "plain_text",
                    "text": "20:30 pm",
                    "emoji": true
                  },
                  "value": "20:30"
                },
                {
                  "text": {
                    "type": "plain_text",
                    "text": "21:00 pm",
                    "emoji": true
                  },
                  "value": "21:00"
                },
                {
                  "text": {
                    "type": "plain_text",
                    "text": "21:30 pm",
                    "emoji": true
                  },
                  "value": "21:30"
                }
              ]
            }]
          }
        ]
      })

      var eventAdd = new eventmodel({
        idUserOwner: message.user,
        idChannelOwner: message.channel,
        location: {
          "name": results[0].title,
          "vicinity": results[0].vicinity,
          "geo": results[0].position[0] + ',' + results[0].position[1],
          "id": results[0].id
        },
        status: -2
      })
      await eventAdd.save()

      await usermodel.findOneAndUpdate({
        idUser: message.user,
        idChannel: message.channel
      }, {
        lastActivity: new Date(),
        status: 3
      })
    }
    if (results.length > 1) {

      var list = []

      if (results.length > 7) {
        var number = 8
      } else {
        var number = results.length
      }

      for (var i = 0; number > i; i++) {
        var color = "#03BA0F"
        if (results[i].distance > 1300) {
          color = "#EA9F1E"
        } if (results[i].distance > 2500) {
          color = "#DD0003"
        }
        const element = {
          "color": color,
          "blocks": [{
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "*" + results[i].title + "*\n" + results[i].vicinity.split('\n').join(', '),
            },
            "accessory": {
              "type": "button",
              "text": {
                "type": "plain_text",
                "emoji": true,
                "text": "Choose"
              },
              "value": JSON.stringify(results[i]),
              "action_id": "event_create_place_decision"
            }
          }]
        }

        list.push(element)
      }

      say({
        "blocks": [{
          "type": "context",
          "elements": [{
            "type": "mrkdwn",
            "text": ":arrow_down: *Ordered by distance from your location*"
          }]
        }],
        "attachments": list
      })

      await usermodel.findOneAndUpdate({
        idUser: message.user,
        idChannel: message.channel
      }, {
        lastActivity: new Date(),
        status: 3
      })
    }

    let history = await app.client.im.history({
      token: context.botToken,
      channel: message.channel,
      count: 5
    })
    for (var i = 1; history.messages.length >= i; i++) {
      const element = history.messages[i]

      if (element.subtype !== undefined) {
        app.client.chat.delete({
          token: context.botToken,
          channel: message.channel,
          ts: history.messages[i].ts
        })
        break
      }
    }
  }
})

app.action("event_create_place_decision", async ({
  ack,
  action,
  body,
  respond,
  say
}) => {
  ack()
  var result = JSON.parse(action.value)

  respond({
    "blocks": [{
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": ":calendar: *Your event:* Creation in progress"
        }
      },
      {
        "type": "divider"
      },
      {
        "type": "section",
        "fields": [{
            "type": "mrkdwn",
            "text": "*Name:*\n" + result.title
          },
          {
            "type": "mrkdwn",
            "text": "*Location:*\n" + result.vicinity
          }
        ]
      },
      {
        "type": "actions",
        "elements": [{
          "type": "static_select",
          "action_id": "event_create_time",
          "placeholder": {
            "type": "plain_text",
            "text": "Select a Time",
            "emoji": true
          },
          "options": [{
              "text": {
                "type": "plain_text",
                "text": "12:00 pm",
                "emoji": true
              },
              "value": "12:00"
            },
            {
              "text": {
                "type": "plain_text",
                "text": "12:30 pm",
                "emoji": true
              },
              "value": "12:30"
            },
            {
              "text": {
                "type": "plain_text",
                "text": "13:00 pm",
                "emoji": true
              },
              "value": "13:00"
            },
            {
              "text": {
                "type": "plain_text",
                "text": "13:30 pm",
                "emoji": true
              },
              "value": "13:30"
            },
            {
              "text": {
                "type": "plain_text",
                "text": "14:00 pm",
                "emoji": true
              },
              "value": "14:00"
            },
            {
              "text": {
                "type": "plain_text",
                "text": "14:30 pm",
                "emoji": true
              },
              "value": "14:30"
            },
            {
              "text": {
                "type": "plain_text",
                "text": "15:00 pm",
                "emoji": true
              },
              "value": "15:00"
            },
            {
              "text": {
                "type": "plain_text",
                "text": "15:30 pm",
                "emoji": true
              },
              "value": "15:30"
            },
            {
              "text": {
                "type": "plain_text",
                "text": "16:00 pm",
                "emoji": true
              },
              "value": "16:00"
            },
            {
              "text": {
                "type": "plain_text",
                "text": "16:30 pm",
                "emoji": true
              },
              "value": "16:30"
            },
            {
              "text": {
                "type": "plain_text",
                "text": "17:00 pm",
                "emoji": true
              },
              "value": "17:00"
            },
            {
              "text": {
                "type": "plain_text",
                "text": "17:30 pm",
                "emoji": true
              },
              "value": "17:30"
            },
            {
              "text": {
                "type": "plain_text",
                "text": "18:00 pm",
                "emoji": true
              },
              "value": "18:00"
            },
            {
              "text": {
                "type": "plain_text",
                "text": "18:30 pm",
                "emoji": true
              },
              "value": "18:30"
            },
            {
              "text": {
                "type": "plain_text",
                "text": "19:00 pm",
                "emoji": true
              },
              "value": "19:00"
            },
            {
              "text": {
                "type": "plain_text",
                "text": "19:30 pm",
                "emoji": true
              },
              "value": "19:30"
            },
            {
              "text": {
                "type": "plain_text",
                "text": "20:00 pm",
                "emoji": true
              },
              "value": "20:00"
            },
            {
              "text": {
                "type": "plain_text",
                "text": "20:30 pm",
                "emoji": true
              },
              "value": "20:30"
            },
            {
              "text": {
                "type": "plain_text",
                "text": "21:00 pm",
                "emoji": true
              },
              "value": "21:00"
            },
            {
              "text": {
                "type": "plain_text",
                "text": "21:30 pm",
                "emoji": true
              },
              "value": "21:30"
            }
          ]
        }]
      }
    ]
  })

  var eventAdd = new eventmodel({
    idUserOwner: body.user.id,
    idChannelOwner: body.channel.id,
    location: {
      "name": result.title,
      "vicinity": result.vicinity,
      "geo": result.position[0] + ',' + result.position[1],
      "id": result.id
    },
    status: -2
  })
  await eventAdd.save()
})

app.action('event_create_time', async ({
  ack,
  action,
  body,
  respond,
  say
}) => {
  ack()

  const event = await eventmodel.findOne({
    idUserOwner: body.user.id,
    idChannelOwner: body.channel.id,
    status: -2
  })

  await eventmodel.findOneAndUpdate({
    idUserOwner: body.user.id,
    idChannelOwner: body.channel.id,
    status: -2
  }, {
    time: action.selected_option.value,
    status: -1
  })

  respond({
    "blocks": [{
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": ":calendar: *Your event:* Creation in progress"
        }
      },
      {
        "type": "divider"
      },
      {
        "type": "section",
        "fields": [{
            "type": "mrkdwn",
            "text": `*Name:*\n${event.location.name}`
          },
          {
            "type": "mrkdwn",
            "text": `*Location:*\n${event.location.vicinity}`
          },
          {
            "type": "mrkdwn",
            "text": `*When:*\n${action.selected_option.value} pm`
          }
        ]
      },
      {
        "type": "actions",
        "elements": [{
          "type": "static_select",
          "action_id": "event_create_maxpeople",
          "placeholder": {
            "type": "plain_text",
            "text": "Select Max amount of other People",
            "emoji": true
          },
          "options": [{
              "text": {
                "type": "plain_text",
                "text": "3 other people",
                "emoji": true
              },
              "value": "3"
            },
            {
              "text": {
                "type": "plain_text",
                "text": "4 other people",
                "emoji": true
              },
              "value": "4"
            },
            {
              "text": {
                "type": "plain_text",
                "text": "5 other people",
                "emoji": true
              },
              "value": "5"
            },
            {
              "text": {
                "type": "plain_text",
                "text": "6 other people",
                "emoji": true
              },
              "value": "6"
            },
            {
              "text": {
                "type": "plain_text",
                "text": "7 other people",
                "emoji": true
              },
              "value": "7"
            }
          ]
        }]
      }
    ]
  })
})

app.action('event_create_maxpeople', async ({
  ack,
  action,
  body,
  respond,
  say
}) => {
  ack()

  const event = await eventmodel.findOne({
    idUserOwner: body.user.id,
    idChannelOwner: body.channel.id,
    status: -1
  })

  await eventmodel.findOneAndUpdate({
    idUserOwner: body.user.id,
    idChannelOwner: body.channel.id,
    status: -1
  }, {
    maxPeople: action.selected_option.value
  })

  respond({
    "blocks": [{
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": ":calendar: *Your event:* Creation in progress"
        }
      },
      {
        "type": "divider"
      },
      {
        "type": "section",
        "fields": [{
            "type": "mrkdwn",
            "text": `*Name:*\n${event.location.name}`
          },
          {
            "type": "mrkdwn",
            "text": `*Location:*\n${event.location.vicinity}`
          },
          {
            "type": "mrkdwn",
            "text": `*When:*\n${event.time} pm`
          },
          {
            "type": "mrkdwn",
            "text": `*How many:*\n${action.selected_option.value} other people`
          }
        ]
      },
      {
        "type": "actions",
        "elements": [{
          "type": "button",
          "text": {
            "type": "plain_text",
            "emoji": true,
            "text": "Confirm event"
          },
          "style": "primary",
          "action_id": "event_setup_confirm"
        }]
      }
    ]
  })
})

app.action('event_setup_confirm', async ({
  ack,
  body,
  respond,
  say
}) => {
  ack()

  const event = await eventmodel.findOne({
    idUserOwner: body.user.id,
    idChannelOwner: body.channel.id,
    status: -1
  })

  await eventmodel.findOneAndUpdate({
    idUserOwner: body.user.id,
    idChannelOwner: body.channel.id,
    status: -1
  }, {
    status: 0
  })



  respond({
    "blocks": [{
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": ":calendar: *Your event:* "
        }
      },
      {
        "type": "divider"
      },
      {
        "type": "section",
        "fields": [{
            "type": "mrkdwn",
            "text": `*Name:*\n${event.location.name}`
          },
          {
            "type": "mrkdwn",
            "text": `*Location:*\n${event.location.vicinity}`
          },
          {
            "type": "mrkdwn",
            "text": `*When:*\n${event.time} pm`
          },
          {
            "type": "mrkdwn",
            "text": `*How many:*\n${event.maxPeople} other poeple`
          }
        ]
      },
      {
        "type": "divider"
      },
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": ":calendar: *Your event:* "
        }
      },
    ]
  })

  var tags = ["event_create_complete"]
  activityUpdate(body.user.id, body.channel.id, tags)
})

// Testing functions

app.message(/status|Status/, ({
  say
}) => {
  say({
    "blocks": [{
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": "Some status message text. This is not important for the moment. It is just important that this is present."
        }
      },
      {
        "type": "actions",
        "elements": [{
            "type": "button",
            "text": {
              "type": "plain_text",
              "emoji": true,
              "text": "Look for event"
            },
            "style": "primary",
            "action_id": "event_join_search"
          },
          {
            "type": "button",
            "text": {
              "type": "plain_text",
              "emoji": true,
              "text": "Create event"
            },
            "action_id": "event_create_place"
          }
        ]
      }
    ]
  })
})

app.message('hello', async ({
  context,
  message,
  body
}) => {
  let history = await app.client.im.history({
    token: context.botToken,
    channel: message.channel,
    count: 5
  })
  history = history.messages
  console.log(history)
})

app.message('delete all', async ({
  context,
  message
}) => {
  let history = await app.client.im.history({
    token: context.botToken,
    channel: message.channel
  })

  for (var i = 0; i <= history.messages.length; i++) {
    app.client.chat.delete({
      // fill here the `OAuth Access Token` that you in your slack app `OAuth & Permissions` section
      token: "xoxp-786262460966-785911256039-833079405941-ba5daedd0b1372541c3d8c4efce008de",
      channel: message.channel,
      ts: history.messages[i].ts,
      as_user: true
    });
  }
})

app.message('create me', async ({
  message
}) => {
  var userAdd = new usermodel({
    idUser: message.user,
    idChannel: message.channel,
    lastActivity: new Date(),
    location: {
      geo: "52.5731,13.4171",
      city: "Berlin",
      district: "Pankow",
      postCode: "13187"
    },
    status: 3
  })
  await userAdd.save()
})

app.message('delete me', async ({
  message
}) => {
  await usermodel.findOneAndDelete({
    idUser: message.user,
    idChannel: message.channel
  })
})

// Setup functions

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
  await app.start(process.env.PORT || 3000)

  console.log('⚡️ Bolt app is running!')
})()