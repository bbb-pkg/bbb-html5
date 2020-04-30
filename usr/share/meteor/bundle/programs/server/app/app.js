var require = meteorInstall({"imports":{"api":{"annotations":{"server":{"handlers":{"whiteboardAnnotations.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/annotations/server/handlers/whiteboardAnnotations.js                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => handleWhiteboardAnnotations
});

let _;

module.link("lodash", {
  default(v) {
    _ = v;
  }

}, 0);
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 1);
let modifyWhiteboardAccess;
module.link("/imports/api/whiteboard-multi-user/server/modifiers/modifyWhiteboardAccess", {
  default(v) {
    modifyWhiteboardAccess = v;
  }

}, 2);
let clearAnnotations;
module.link("../modifiers/clearAnnotations", {
  default(v) {
    clearAnnotations = v;
  }

}, 3);
let addAnnotation;
module.link("../modifiers/addAnnotation", {
  default(v) {
    addAnnotation = v;
  }

}, 4);

function handleWhiteboardAnnotations({
  header,
  body
}, meetingId) {
  check(header, Object);

  if (header.userId !== 'nodeJSapp') {
    return false;
  }

  check(meetingId, String);
  check(body, Object);
  const {
    annotations,
    whiteboardId,
    multiUser
  } = body;
  check(annotations, Array);
  check(whiteboardId, String);
  check(multiUser, Boolean);
  clearAnnotations(meetingId, whiteboardId);
  const annotationsAdded = [];

  _.each(annotations, annotation => {
    const {
      wbId,
      userId
    } = annotation;
    annotationsAdded.push(addAnnotation(meetingId, wbId, userId, annotation));
  });

  modifyWhiteboardAccess(meetingId, whiteboardId, multiUser);
  return annotationsAdded;
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"whiteboardCleared.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/annotations/server/handlers/whiteboardCleared.js                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => handleWhiteboardCleared
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let AnnotationsStreamer;
module.link("/imports/api/annotations/server/streamer", {
  default(v) {
    AnnotationsStreamer = v;
  }

}, 1);
let clearAnnotations;
module.link("../modifiers/clearAnnotations", {
  default(v) {
    clearAnnotations = v;
  }

}, 2);

function handleWhiteboardCleared({
  body
}, meetingId) {
  check(body, {
    userId: String,
    whiteboardId: String,
    fullClear: Boolean
  });
  const {
    whiteboardId,
    fullClear,
    userId
  } = body;

  if (fullClear) {
    AnnotationsStreamer(meetingId).emit('removed', {
      meetingId,
      whiteboardId
    });
    return clearAnnotations(meetingId, whiteboardId);
  }

  AnnotationsStreamer(meetingId).emit('removed', {
    meetingId,
    whiteboardId,
    userId
  });
  return clearAnnotations(meetingId, whiteboardId, userId);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"whiteboardSend.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/annotations/server/handlers/whiteboardSend.js                                                           //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => handleWhiteboardSend
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let AnnotationsStreamer;
module.link("/imports/api/annotations/server/streamer", {
  default(v) {
    AnnotationsStreamer = v;
  }

}, 1);
let addAnnotation;
module.link("../modifiers/addAnnotation", {
  default(v) {
    addAnnotation = v;
  }

}, 2);
const ANNOTATION_PROCCESS_INTERVAL = 60;
let annotationsQueue = {};
let annotationsRecieverIsRunning = false;

const proccess = () => {
  if (!Object.keys(annotationsQueue).length) {
    annotationsRecieverIsRunning = false;
    return;
  }

  annotationsRecieverIsRunning = true;
  Object.keys(annotationsQueue).forEach(meetingId => {
    AnnotationsStreamer(meetingId).emit('added', {
      meetingId,
      annotations: annotationsQueue[meetingId]
    });
  });
  annotationsQueue = {};
  Meteor.setTimeout(proccess, ANNOTATION_PROCCESS_INTERVAL);
};

function handleWhiteboardSend({
  header,
  body
}, meetingId) {
  const userId = header.userId;
  const annotation = body.annotation;
  check(userId, String);
  check(annotation, Object);
  const whiteboardId = annotation.wbId;
  check(whiteboardId, String);

  if (!annotationsQueue.hasOwnProperty(meetingId)) {
    annotationsQueue[meetingId] = [];
  }

  annotationsQueue[meetingId].push({
    meetingId,
    whiteboardId,
    userId,
    annotation
  });
  if (!annotationsRecieverIsRunning) proccess();
  return addAnnotation(meetingId, whiteboardId, userId, annotation);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"whiteboardUndo.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/annotations/server/handlers/whiteboardUndo.js                                                           //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => handleWhiteboardUndo
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let AnnotationsStreamer;
module.link("/imports/api/annotations/server/streamer", {
  default(v) {
    AnnotationsStreamer = v;
  }

}, 1);
let removeAnnotation;
module.link("../modifiers/removeAnnotation", {
  default(v) {
    removeAnnotation = v;
  }

}, 2);

function handleWhiteboardUndo({
  body
}, meetingId) {
  const whiteboardId = body.whiteboardId;
  const shapeId = body.annotationId;
  check(whiteboardId, String);
  check(shapeId, String);
  AnnotationsStreamer(meetingId).emit('removed', {
    meetingId,
    whiteboardId,
    shapeId
  });
  return removeAnnotation(meetingId, whiteboardId, shapeId);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"methods":{"clearWhiteboard.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/annotations/server/methods/clearWhiteboard.js                                                           //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => clearWhiteboard
});
let RedisPubSub;
module.link("/imports/startup/server/redis", {
  default(v) {
    RedisPubSub = v;
  }

}, 0);
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 1);
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 2);
let extractCredentials;
module.link("/imports/api/common/server/helpers", {
  extractCredentials(v) {
    extractCredentials = v;
  }

}, 3);

function clearWhiteboard(whiteboardId) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'ClearWhiteboardPubMsg';
  const {
    meetingId,
    requesterUserId
  } = extractCredentials(this.userId);
  check(whiteboardId, String);
  const payload = {
    whiteboardId
  };
  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"sendAnnotation.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/annotations/server/methods/sendAnnotation.js                                                            //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => sendAnnotation
});
let sendAnnotationHelper;
module.link("./sendAnnotationHelper", {
  default(v) {
    sendAnnotationHelper = v;
  }

}, 0);
let extractCredentials;
module.link("/imports/api/common/server/helpers", {
  extractCredentials(v) {
    extractCredentials = v;
  }

}, 1);

function sendAnnotation(annotation) {
  const {
    meetingId,
    requesterUserId
  } = extractCredentials(this.userId);
  sendAnnotationHelper(annotation, meetingId, requesterUserId);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"sendAnnotationHelper.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/annotations/server/methods/sendAnnotationHelper.js                                                      //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => sendAnnotationHelper
});
let RedisPubSub;
module.link("/imports/startup/server/redis", {
  default(v) {
    RedisPubSub = v;
  }

}, 0);
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 1);
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 2);

function sendAnnotationHelper(annotation, meetingId, requesterUserId) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'SendWhiteboardAnnotationPubMsg';
  const whiteboardId = annotation.wbId;
  check(annotation, Object);
  check(whiteboardId, String);

  if (annotation.annotationType === 'text') {
    check(annotation, {
      id: String,
      status: String,
      annotationType: String,
      annotationInfo: {
        x: Number,
        y: Number,
        fontColor: Number,
        calcedFontSize: Number,
        textBoxWidth: Number,
        text: String,
        textBoxHeight: Number,
        id: String,
        whiteboardId: String,
        status: String,
        fontSize: Number,
        dataPoints: String,
        type: String
      },
      wbId: String,
      userId: String,
      position: Number
    });
  } else {
    check(annotation, {
      id: String,
      status: String,
      annotationType: String,
      annotationInfo: {
        color: Number,
        thickness: Number,
        points: Array,
        id: String,
        whiteboardId: String,
        status: String,
        type: String,
        dimensions: Match.Maybe([Number])
      },
      wbId: String,
      userId: String,
      position: Number
    });
  }

  const payload = {
    annotation
  };
  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"sendBulkAnnotations.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/annotations/server/methods/sendBulkAnnotations.js                                                       //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => sendBulkAnnotations
});
let extractCredentials;
module.link("/imports/api/common/server/helpers", {
  extractCredentials(v) {
    extractCredentials = v;
  }

}, 0);
let sendAnnotationHelper;
module.link("./sendAnnotationHelper", {
  default(v) {
    sendAnnotationHelper = v;
  }

}, 1);

function sendBulkAnnotations(payload) {
  const {
    meetingId,
    requesterUserId
  } = extractCredentials(this.userId);
  payload.forEach(annotation => sendAnnotationHelper(annotation, meetingId, requesterUserId));
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"undoAnnotation.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/annotations/server/methods/undoAnnotation.js                                                            //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => undoAnnotation
});
let RedisPubSub;
module.link("/imports/startup/server/redis", {
  default(v) {
    RedisPubSub = v;
  }

}, 0);
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 1);
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 2);
let extractCredentials;
module.link("/imports/api/common/server/helpers", {
  extractCredentials(v) {
    extractCredentials = v;
  }

}, 3);

function undoAnnotation(whiteboardId) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'UndoWhiteboardPubMsg';
  const {
    meetingId,
    requesterUserId
  } = extractCredentials(this.userId);
  check(whiteboardId, String);
  const payload = {
    whiteboardId
  };
  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"modifiers":{"addAnnotation.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/annotations/server/modifiers/addAnnotation.js                                                           //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => addAnnotation
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 1);
let Annotations;
module.link("/imports/api/annotations", {
  default(v) {
    Annotations = v;
  }

}, 2);
let addAnnotationQuery;
module.link("/imports/api/annotations/addAnnotation", {
  default(v) {
    addAnnotationQuery = v;
  }

}, 3);

function addAnnotation(meetingId, whiteboardId, userId, annotation) {
  check(meetingId, String);
  check(whiteboardId, String);
  check(annotation, Object);
  const query = addAnnotationQuery(meetingId, whiteboardId, userId, annotation);

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Adding annotation to collection: ${err}`);
    }

    const {
      insertedId
    } = numChanged;

    if (insertedId) {
      return Logger.info(`Added annotation id=${annotation.id} whiteboard=${whiteboardId}`);
    }

    return true;
  };

  return Annotations.upsert(query.selector, query.modifier, cb);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"clearAnnotations.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/annotations/server/modifiers/clearAnnotations.js                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => clearAnnotations
});
let Annotations;
module.link("/imports/api/annotations", {
  default(v) {
    Annotations = v;
  }

}, 0);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 1);

function clearAnnotations(meetingId, whiteboardId, userId) {
  const selector = {};

  if (meetingId) {
    selector.meetingId = meetingId;
  }

  if (whiteboardId) {
    selector.whiteboardId = whiteboardId;
  }

  if (userId) {
    selector.userId = userId;
  }

  const cb = err => {
    if (err) {
      return Logger.error(`Removing Annotations from collection: ${err}`);
    }

    if (userId) {
      return Logger.info(`Cleared Annotations for userId=${userId} where whiteboard=${whiteboardId}`);
    }

    if (whiteboardId) {
      return Logger.info(`Cleared Annotations for whiteboard=${whiteboardId}`);
    }

    if (meetingId) {
      return Logger.info(`Cleared Annotations (${meetingId})`);
    }

    return Logger.info('Cleared Annotations (all)');
  };

  return Annotations.remove(selector, cb);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"removeAnnotation.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/annotations/server/modifiers/removeAnnotation.js                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => removeAnnotation
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let Annotations;
module.link("/imports/api/annotations", {
  default(v) {
    Annotations = v;
  }

}, 1);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 2);

function removeAnnotation(meetingId, whiteboardId, shapeId) {
  check(meetingId, String);
  check(whiteboardId, String);
  check(shapeId, String);
  const selector = {
    meetingId,
    whiteboardId,
    id: shapeId
  };

  const cb = err => {
    if (err) {
      return Logger.error(`Removing annotation from collection: ${err}`);
    }

    return Logger.info(`Removed annotation id=${shapeId} whiteboard=${whiteboardId}`);
  };

  return Annotations.remove(selector, cb);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"eventHandlers.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/annotations/server/eventHandlers.js                                                                     //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let RedisPubSub;
module.link("/imports/startup/server/redis", {
  default(v) {
    RedisPubSub = v;
  }

}, 0);
let processForHTML5ServerOnly;
module.link("/imports/api/common/server/helpers", {
  processForHTML5ServerOnly(v) {
    processForHTML5ServerOnly = v;
  }

}, 1);
let handleWhiteboardCleared;
module.link("./handlers/whiteboardCleared", {
  default(v) {
    handleWhiteboardCleared = v;
  }

}, 2);
let handleWhiteboardUndo;
module.link("./handlers/whiteboardUndo", {
  default(v) {
    handleWhiteboardUndo = v;
  }

}, 3);
let handleWhiteboardSend;
module.link("./handlers/whiteboardSend", {
  default(v) {
    handleWhiteboardSend = v;
  }

}, 4);
let handleWhiteboardAnnotations;
module.link("./handlers/whiteboardAnnotations", {
  default(v) {
    handleWhiteboardAnnotations = v;
  }

}, 5);
RedisPubSub.on('ClearWhiteboardEvtMsg', handleWhiteboardCleared);
RedisPubSub.on('UndoWhiteboardEvtMsg', handleWhiteboardUndo);
RedisPubSub.on('SendWhiteboardAnnotationEvtMsg', handleWhiteboardSend);
RedisPubSub.on('GetWhiteboardAnnotationsRespMsg', processForHTML5ServerOnly(handleWhiteboardAnnotations));
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/annotations/server/index.js                                                                             //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.link("./eventHandlers");
module.link("./methods");
module.link("./publishers");
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"methods.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/annotations/server/methods.js                                                                           //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let undoAnnotation;
module.link("./methods/undoAnnotation", {
  default(v) {
    undoAnnotation = v;
  }

}, 1);
let clearWhiteboard;
module.link("./methods/clearWhiteboard", {
  default(v) {
    clearWhiteboard = v;
  }

}, 2);
let sendAnnotation;
module.link("./methods/sendAnnotation", {
  default(v) {
    sendAnnotation = v;
  }

}, 3);
let sendBulkAnnotations;
module.link("./methods/sendBulkAnnotations", {
  default(v) {
    sendBulkAnnotations = v;
  }

}, 4);
Meteor.methods({
  undoAnnotation,
  clearWhiteboard,
  sendAnnotation,
  sendBulkAnnotations
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"publishers.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/annotations/server/publishers.js                                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let Annotations;
module.link("/imports/api/annotations", {
  default(v) {
    Annotations = v;
  }

}, 0);
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 1);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 2);
let extractCredentials;
module.link("/imports/api/common/server/helpers", {
  extractCredentials(v) {
    extractCredentials = v;
  }

}, 3);

function annotations() {
  if (!this.userId) {
    return Annotations.find({
      meetingId: ''
    });
  }

  const {
    meetingId,
    requesterUserId
  } = extractCredentials(this.userId);
  Logger.debug(`Publishing Annotations for ${meetingId} ${requesterUserId}`);
  return Annotations.find({
    meetingId
  });
}

function publish(...args) {
  const boundAnnotations = annotations.bind(this);
  return boundAnnotations(...args);
}

Meteor.publish('annotations', publish);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"streamer.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/annotations/server/streamer.js                                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  removeAnnotationsStreamer: () => removeAnnotationsStreamer,
  addAnnotationsStreamer: () => addAnnotationsStreamer,
  default: () => get
});
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 0);

function removeAnnotationsStreamer(meetingId) {
  Logger.info(`Removing Annotations streamer object for meeting ${meetingId}`);
  delete Meteor.StreamerCentral.instances[`annotations-${meetingId}`];
}

function addAnnotationsStreamer(meetingId) {
  const streamer = new Meteor.Streamer(`annotations-${meetingId}`, {
    retransmit: false
  });
  streamer.allowRead(function allowRead() {
    if (!this.userId) return false;
    return this.userId && this.userId.includes(meetingId);
  });
  streamer.allowWrite(function allowWrite() {
    return false;
  });
}

function get(meetingId) {
  return Meteor.StreamerCentral.instances[`annotations-${meetingId}`];
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"addAnnotation.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/annotations/addAnnotation.js                                                                            //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => addAnnotation
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
const ANNOTATION_TYPE_TEXT = 'text';
const ANNOTATION_TYPE_PENCIL = 'pencil'; // line, triangle, ellipse, rectangle

function handleCommonAnnotation(meetingId, whiteboardId, userId, annotation) {
  const {
    id,
    status,
    annotationType,
    annotationInfo,
    wbId,
    position
  } = annotation;
  const selector = {
    meetingId,
    id,
    userId
  };
  const modifier = {
    $set: {
      whiteboardId,
      meetingId,
      id,
      status,
      annotationType,
      annotationInfo,
      wbId
    },
    $setOnInsert: {
      position
    },
    $inc: {
      version: 1
    }
  };
  return {
    selector,
    modifier
  };
}

function handleTextUpdate(meetingId, whiteboardId, userId, annotation) {
  const {
    id,
    status,
    annotationType,
    annotationInfo,
    wbId,
    position
  } = annotation;
  const selector = {
    meetingId,
    id,
    userId
  };
  annotationInfo.text = annotationInfo.text.replace(/[\r]/g, '\n');
  const modifier = {
    $set: {
      whiteboardId,
      meetingId,
      id,
      status,
      annotationType,
      annotationInfo,
      wbId
    },
    $setOnInsert: {
      position
    },
    $inc: {
      version: 1
    }
  };
  return {
    selector,
    modifier
  };
}

function handlePencilUpdate(meetingId, whiteboardId, userId, annotation) {
  const DRAW_START = 'DRAW_START';
  const DRAW_UPDATE = 'DRAW_UPDATE';
  const DRAW_END = 'DRAW_END';
  const {
    id,
    status,
    annotationType,
    annotationInfo,
    wbId,
    position
  } = annotation;
  const baseSelector = {
    meetingId,
    id,
    userId,
    whiteboardId
  };
  let baseModifier;

  switch (status) {
    case DRAW_START:
      // on start we split the points
      // create the 'pencil_base'
      // TODO: find and removed unused props (chunks, version, etc)
      baseModifier = {
        $set: {
          id,
          userId,
          meetingId,
          whiteboardId,
          position,
          status,
          annotationType,
          annotationInfo,
          wbId,
          version: 1
        }
      };
      break;

    case DRAW_UPDATE:
      baseModifier = {
        $push: {
          'annotationInfo.points': {
            $each: annotationInfo.points
          }
        },
        $set: {
          status
        },
        $inc: {
          version: 1
        }
      };
      break;

    case DRAW_END:
      // Updating the main pencil object with the final info
      baseModifier = {
        $set: {
          whiteboardId,
          meetingId,
          id,
          status,
          annotationType,
          annotationInfo,
          wbId,
          position
        },
        $inc: {
          version: 1
        }
      };
      break;

    default:
      break;
  }

  return {
    selector: baseSelector,
    modifier: baseModifier
  };
}

function addAnnotation(meetingId, whiteboardId, userId, annotation) {
  check(meetingId, String);
  check(whiteboardId, String);
  check(annotation, Object);

  switch (annotation.annotationType) {
    case ANNOTATION_TYPE_TEXT:
      return handleTextUpdate(meetingId, whiteboardId, userId, annotation);

    case ANNOTATION_TYPE_PENCIL:
      return handlePencilUpdate(meetingId, whiteboardId, userId, annotation);

    default:
      return handleCommonAnnotation(meetingId, whiteboardId, userId, annotation);
  }
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/annotations/index.js                                                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
const Annotations = new Mongo.Collection('annotations');

if (Meteor.isServer) {
  // types of queries for the annotations  (Total):
  // 1. meetingId, id, userId               ( 8 )
  // 2. meetingId, id, userId, whiteboardId ( 1 )
  // 3. meetingId                           ( 1 )
  // 4. meetingId, whiteboardId             ( 1 )
  // 5. meetingId, whiteboardId, id         ( 1 )
  // 6. meetingId, whiteboardId, userId     ( 1 )
  // These 2 indexes seem to cover all of the cases
  Annotations._ensureIndex({
    id: 1
  });

  Annotations._ensureIndex({
    meetingId: 1,
    whiteboardId: 1,
    userId: 1
  });
}

module.exportDefault(Annotations);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"breakouts":{"server":{"handlers":{"breakoutClosed.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/breakouts/server/handlers/breakoutClosed.js                                                             //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => handleBreakoutClosed
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let clearBreakouts;
module.link("../modifiers/clearBreakouts", {
  default(v) {
    clearBreakouts = v;
  }

}, 1);

function handleBreakoutClosed({
  body
}) {
  const {
    breakoutId
  } = body;
  check(breakoutId, String);
  return clearBreakouts(breakoutId);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"breakoutJoinURL.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/breakouts/server/handlers/breakoutJoinURL.js                                                            //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => handleBreakoutJoinURL
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 1);
let Breakouts;
module.link("/imports/api/breakouts", {
  default(v) {
    Breakouts = v;
  }

}, 2);

function handleBreakoutJoinURL({
  body
}) {
  const {
    redirectToHtml5JoinURL,
    userId,
    breakoutId
  } = body;
  check(redirectToHtml5JoinURL, String);
  const selector = {
    breakoutId
  };
  const modifier = {
    $push: {
      users: {
        userId,
        redirectToHtml5JoinURL,
        insertedTime: new Date().getTime()
      }
    }
  };

  const cb = (cbErr, numChanged) => {
    if (cbErr) {
      return Logger.error(`Adding breakout to collection: ${cbErr}`);
    }

    const {
      insertedId
    } = numChanged;

    if (insertedId) {
      return Logger.info(`Added breakout id=${breakoutId}`);
    }

    return Logger.info(`Upserted breakout id=${breakoutId}`);
  };

  return Breakouts.upsert(selector, modifier, cb);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"breakoutStarted.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/breakouts/server/handlers/breakoutStarted.js                                                            //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => handleBreakoutRoomStarted
});
let Breakouts;
module.link("/imports/api/breakouts", {
  default(v) {
    Breakouts = v;
  }

}, 0);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 1);
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 2);
let flat;
module.link("flat", {
  default(v) {
    flat = v;
  }

}, 3);

function handleBreakoutRoomStarted({
  body
}, meetingId) {
  // 0 seconds default breakout time, forces use of real expiration time
  const DEFAULT_TIME_REMAINING = 0;
  const {
    parentMeetingId,
    breakout
  } = body;
  const {
    breakoutId
  } = breakout;
  check(meetingId, String);
  const selector = {
    breakoutId
  };
  const modifier = {
    $set: Object.assign({
      users: [],
      joinedUsers: []
    }, {
      timeRemaining: DEFAULT_TIME_REMAINING
    }, {
      parentMeetingId
    }, flat(breakout))
  };

  const cb = err => {
    if (err) {
      return Logger.error(`updating breakout: ${err}`);
    }

    return Logger.info('Updated timeRemaining and externalMeetingId ' + `for breakout id=${breakoutId}`);
  };

  return Breakouts.upsert(selector, modifier, cb);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"joinedUsersChanged.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/breakouts/server/handlers/joinedUsersChanged.js                                                         //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => joinedUsersChanged
});
let Breakouts;
module.link("/imports/api/breakouts", {
  default(v) {
    Breakouts = v;
  }

}, 0);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 1);
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 2);

function joinedUsersChanged({
  body
}) {
  check(body, Object);
  const {
    parentId,
    breakoutId,
    users
  } = body;
  check(parentId, String);
  check(breakoutId, String);
  check(users, Array);
  const selector = {
    parentMeetingId: parentId,
    breakoutId
  };
  const usersMapped = users.map(user => ({
    userId: user.id,
    name: user.name
  }));
  const modifier = {
    $set: {
      joinedUsers: usersMapped
    }
  };

  const cb = err => {
    if (err) {
      return Logger.error(`updating joined users in breakout: ${err}`);
    }

    return Logger.info('Updated joined users ' + `in breakout id=${breakoutId}`);
  };

  Breakouts.find(selector);
  Breakouts.update(selector, modifier, cb);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"updateTimeRemaining.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/breakouts/server/handlers/updateTimeRemaining.js                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => handleUpdateTimeRemaining
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 1);
let Breakouts;
module.link("/imports/api/breakouts", {
  default(v) {
    Breakouts = v;
  }

}, 2);

function handleUpdateTimeRemaining({
  body
}, meetingId) {
  const {
    timeRemaining
  } = body;
  check(meetingId, String);
  check(timeRemaining, Number);
  const selector = {
    parentMeetingId: meetingId
  };
  const modifier = {
    $set: {
      timeRemaining
    }
  };
  const options = {
    multi: true
  };

  const cb = err => {
    if (err) {
      return Logger.error(`Updating breakouts: ${err}`);
    }

    return Logger.info('Updated breakout time remaining for breakouts ' + `where parentMeetingId=${meetingId}`);
  };

  return Breakouts.update(selector, modifier, options, cb);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"methods":{"createBreakout.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/breakouts/server/methods/createBreakout.js                                                              //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => createBreakoutRoom
});
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let RedisPubSub;
module.link("/imports/startup/server/redis", {
  default(v) {
    RedisPubSub = v;
  }

}, 1);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 2);
let extractCredentials;
module.link("/imports/api/common/server/helpers", {
  extractCredentials(v) {
    extractCredentials = v;
  }

}, 3);

function createBreakoutRoom(rooms, durationInMinutes, record = false) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const {
    meetingId,
    requesterUserId
  } = extractCredentials(this.userId);
  const eventName = 'CreateBreakoutRoomsCmdMsg';
  if (rooms.length > 8) return Logger.info(`Attempt to create breakout rooms with invalid number of rooms in meeting id=${meetingId}`);
  const payload = {
    record,
    durationInMinutes,
    rooms,
    meetingId
  };
  return RedisPubSub.publishUserMessage(CHANNEL, eventName, meetingId, requesterUserId, payload);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"endAllBreakouts.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/breakouts/server/methods/endAllBreakouts.js                                                             //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => endAllBreakouts
});
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 1);
let RedisPubSub;
module.link("/imports/startup/server/redis", {
  default(v) {
    RedisPubSub = v;
  }

}, 2);
let extractCredentials;
module.link("/imports/api/common/server/helpers", {
  extractCredentials(v) {
    extractCredentials = v;
  }

}, 3);

function endAllBreakouts() {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const {
    meetingId,
    requesterUserId
  } = extractCredentials(this.userId);
  check(meetingId, String);
  check(requesterUserId, String);
  const eventName = 'EndAllBreakoutRoomsMsg';
  return RedisPubSub.publishUserMessage(CHANNEL, eventName, meetingId, requesterUserId, null);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"requestJoinURL.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/breakouts/server/methods/requestJoinURL.js                                                              //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => requestJoinURL
});
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let RedisPubSub;
module.link("/imports/startup/server/redis", {
  default(v) {
    RedisPubSub = v;
  }

}, 1);
let extractCredentials;
module.link("/imports/api/common/server/helpers", {
  extractCredentials(v) {
    extractCredentials = v;
  }

}, 2);

function requestJoinURL({
  breakoutId,
  userId: userIdToInvite
}) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const {
    meetingId,
    requesterUserId
  } = extractCredentials(this.userId);
  const userId = userIdToInvite || requesterUserId;
  const eventName = 'RequestBreakoutJoinURLReqMsg';
  return RedisPubSub.publishUserMessage(CHANNEL, eventName, meetingId, requesterUserId, {
    meetingId,
    breakoutId,
    userId
  });
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"modifiers":{"clearBreakouts.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/breakouts/server/modifiers/clearBreakouts.js                                                            //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => clearBreakouts
});
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 0);
let Breakouts;
module.link("/imports/api/breakouts", {
  default(v) {
    Breakouts = v;
  }

}, 1);

function clearBreakouts(breakoutId) {
  if (breakoutId) {
    const selector = {
      breakoutId
    };
    return Breakouts.remove(selector, () => {
      Logger.info(`Cleared Breakouts (${breakoutId})`);
    });
  }

  return Breakouts.remove({}, () => {
    Logger.info('Cleared Breakouts (all)');
  });
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"eventHandlers.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/breakouts/server/eventHandlers.js                                                                       //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let RedisPubSub;
module.link("/imports/startup/server/redis", {
  default(v) {
    RedisPubSub = v;
  }

}, 0);
let handleBreakoutJoinURL;
module.link("./handlers/breakoutJoinURL", {
  default(v) {
    handleBreakoutJoinURL = v;
  }

}, 1);
let handleBreakoutStarted;
module.link("./handlers/breakoutStarted", {
  default(v) {
    handleBreakoutStarted = v;
  }

}, 2);
let handleUpdateTimeRemaining;
module.link("./handlers/updateTimeRemaining", {
  default(v) {
    handleUpdateTimeRemaining = v;
  }

}, 3);
let handleBreakoutClosed;
module.link("./handlers/breakoutClosed", {
  default(v) {
    handleBreakoutClosed = v;
  }

}, 4);
let joinedUsersChanged;
module.link("./handlers/joinedUsersChanged", {
  default(v) {
    joinedUsersChanged = v;
  }

}, 5);
RedisPubSub.on('BreakoutRoomStartedEvtMsg', handleBreakoutStarted);
RedisPubSub.on('BreakoutRoomJoinURLEvtMsg', handleBreakoutJoinURL);
RedisPubSub.on('RequestBreakoutJoinURLRespMsg', handleBreakoutJoinURL);
RedisPubSub.on('BreakoutRoomsTimeRemainingUpdateEvtMsg', handleUpdateTimeRemaining);
RedisPubSub.on('BreakoutRoomEndedEvtMsg', handleBreakoutClosed);
RedisPubSub.on('UpdateBreakoutUsersEvtMsg', joinedUsersChanged);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/breakouts/server/index.js                                                                               //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.link("./eventHandlers");
module.link("./methods");
module.link("./publishers");
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"methods.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/breakouts/server/methods.js                                                                             //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let createBreakoutRoom;
module.link("/imports/api/breakouts/server/methods/createBreakout", {
  default(v) {
    createBreakoutRoom = v;
  }

}, 1);
let requestJoinURL;
module.link("./methods/requestJoinURL", {
  default(v) {
    requestJoinURL = v;
  }

}, 2);
let endAllBreakouts;
module.link("./methods/endAllBreakouts", {
  default(v) {
    endAllBreakouts = v;
  }

}, 3);
Meteor.methods({
  requestJoinURL,
  createBreakoutRoom,
  endAllBreakouts
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"publishers.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/breakouts/server/publishers.js                                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let Breakouts;
module.link("/imports/api/breakouts", {
  default(v) {
    Breakouts = v;
  }

}, 1);
let Users;
module.link("/imports/api/users", {
  default(v) {
    Users = v;
  }

}, 2);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 3);
let extractCredentials;
module.link("/imports/api/common/server/helpers", {
  extractCredentials(v) {
    extractCredentials = v;
  }

}, 4);
const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;

function breakouts(moderator = false) {
  if (!this.userId) {
    return Breakouts.find({
      meetingId: ''
    });
  }

  const {
    meetingId,
    requesterUserId
  } = extractCredentials(this.userId);
  Logger.debug(`Publishing Breakouts for ${meetingId} ${requesterUserId}`);

  if (moderator) {
    const User = Users.findOne({
      userId: requesterUserId,
      meetingId
    });

    if (!!User && User.role === ROLE_MODERATOR) {
      const presenterSelector = {
        $or: [{
          parentMeetingId: meetingId
        }, {
          breakoutId: meetingId
        }]
      };
      return Breakouts.find(presenterSelector);
    }
  }

  const selector = {
    $or: [{
      parentMeetingId: meetingId,
      freeJoin: true
    }, {
      parentMeetingId: meetingId,
      'users.userId': requesterUserId
    }, {
      breakoutId: meetingId
    }]
  };
  return Breakouts.find(selector);
}

function publish(...args) {
  const boundBreakouts = breakouts.bind(this);
  return boundBreakouts(...args);
}

Meteor.publish('breakouts', publish);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"index.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/breakouts/index.js                                                                                      //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
const Breakouts = new Mongo.Collection('breakouts');

if (Meteor.isServer) {
  // types of queries for the breakouts:
  // 1. breakoutId ( handleJoinUrl, roomStarted, clearBreakouts )
  // 2. parentMeetingId ( updateTimeRemaining )
  Breakouts._ensureIndex({
    breakoutId: 1
  });

  Breakouts._ensureIndex({
    parentMeetingId: 1
  });
}

module.exportDefault(Breakouts);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"captions":{"server":{"handlers":{"padCreate.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/captions/server/handlers/padCreate.js                                                                   //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => handlePadCreate
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let fetchReadOnlyPadId;
module.link("/imports/api/captions/server/methods/fetchReadOnlyPadId", {
  default(v) {
    fetchReadOnlyPadId = v;
  }

}, 1);

function handlePadCreate({
  body
}) {
  const {
    pad
  } = body;
  const {
    id
  } = pad;
  check(id, String);
  fetchReadOnlyPadId(id);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"padUpdate.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/captions/server/handlers/padUpdate.js                                                                   //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => handlePadUpdate
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let getDataFromChangeset;
module.link("/imports/api/captions/server/helpers", {
  getDataFromChangeset(v) {
    getDataFromChangeset = v;
  }

}, 1);
let updatePad;
module.link("/imports/api/captions/server/modifiers/updatePad", {
  default(v) {
    updatePad = v;
  }

}, 2);

function handlePadUpdate({
  body
}) {
  const {
    pad,
    revs,
    changeset
  } = body;
  const {
    id
  } = pad;
  check(id, String);
  check(changeset, String);
  check(revs, Number);
  const data = getDataFromChangeset(changeset);

  if (data !== '') {
    updatePad(id, data, revs);
  }
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"methods":{"appendText.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/captions/server/methods/appendText.js                                                                   //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => appendText
});
let axios;
module.link("axios", {
  default(v) {
    axios = v;
  }

}, 0);
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 1);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 2);
let generatePadId;
module.link("/imports/api/captions/server/helpers", {
  generatePadId(v) {
    generatePadId = v;
  }

}, 3);
let appendTextURL;
module.link("/imports/api/note/server/helpers", {
  appendTextURL(v) {
    appendTextURL = v;
  }

}, 4);
let extractCredentials;
module.link("/imports/api/common/server/helpers", {
  extractCredentials(v) {
    extractCredentials = v;
  }

}, 5);

function appendText(text, locale) {
  const {
    meetingId
  } = extractCredentials(this.userId);
  check(meetingId, String);
  check(text, String);
  check(locale, String);
  const padId = generatePadId(meetingId, locale);
  axios({
    method: 'get',
    url: appendTextURL(padId, text),
    responseType: 'json'
  }).then(response => {
    const {
      status
    } = response;

    if (status === 200) {
      Logger.verbose(`Appended text for padId:${padId}`);
    }
  }).catch(error => Logger.error(`Could not append captions for padId=${padId}: ${error}`));
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"createCaptions.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/captions/server/methods/createCaptions.js                                                               //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => createCaptions
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 1);
let generatePadId, isEnabled, getLocalesURL;
module.link("/imports/api/captions/server/helpers", {
  generatePadId(v) {
    generatePadId = v;
  },

  isEnabled(v) {
    isEnabled = v;
  },

  getLocalesURL(v) {
    getLocalesURL = v;
  }

}, 2);
let addCaption;
module.link("/imports/api/captions/server/modifiers/addCaption", {
  default(v) {
    addCaption = v;
  }

}, 3);
let axios;
module.link("axios", {
  default(v) {
    axios = v;
  }

}, 4);

function createCaptions(meetingId) {
  // Avoid captions creation if this feature is disabled
  if (!isEnabled()) {
    Logger.warn(`Captions are disabled for ${meetingId}`);
    return;
  }

  check(meetingId, String);
  axios({
    method: 'get',
    url: getLocalesURL(),
    responseType: 'json'
  }).then(response => {
    const {
      status
    } = response;

    if (status !== 200) {
      Logger.error(`Could not get locales info for ${meetingId} ${status}`);
    }

    const locales = response.data;
    locales.forEach(locale => {
      const padId = generatePadId(meetingId, locale.locale);
      addCaption(meetingId, padId, locale);
    });
  }).catch(error => Logger.error(`Could not create captions for ${meetingId}: ${error}`));
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"editCaptions.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/captions/server/methods/editCaptions.js                                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => editCaptions
});
let RedisPubSub;
module.link("/imports/startup/server/redis", {
  default(v) {
    RedisPubSub = v;
  }

}, 0);
let Captions;
module.link("/imports/api/captions", {
  default(v) {
    Captions = v;
  }

}, 1);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 2);
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 3);
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 4);

const getIndex = (data, length) => length - data.length;

function editCaptions(padId, data) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'EditCaptionHistoryPubMsg';
  check(padId, String);
  check(data, String);
  const pad = Captions.findOne({
    padId
  });
  if (!pad) return Logger.error(`Editing captions history: ${padId}`);
  const {
    meetingId,
    ownerId,
    locale,
    length
  } = pad;
  check(meetingId, String);
  check(ownerId, String);
  check(locale, {
    locale: String,
    name: String
  });
  check(length, Number);
  const index = getIndex(data, length);
  const payload = {
    startIndex: index,
    localeCode: locale.locale,
    locale: locale.name,
    endIndex: index,
    text: data
  };
  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, ownerId, payload);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"fetchReadOnlyPadId.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/captions/server/methods/fetchReadOnlyPadId.js                                                           //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => fetchReadOnlyPadId
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 1);
let getReadOnlyIdURL, getDataFromResponse;
module.link("/imports/api/note/server/helpers", {
  getReadOnlyIdURL(v) {
    getReadOnlyIdURL = v;
  },

  getDataFromResponse(v) {
    getDataFromResponse = v;
  }

}, 2);
let updateReadOnlyPadId;
module.link("/imports/api/captions/server/modifiers/updateReadOnlyPadId", {
  default(v) {
    updateReadOnlyPadId = v;
  }

}, 3);
let axios;
module.link("axios", {
  default(v) {
    axios = v;
  }

}, 4);

function fetchReadOnlyPadId(padId) {
  check(padId, String);
  const readOnlyURL = getReadOnlyIdURL(padId);
  axios({
    method: 'get',
    url: readOnlyURL,
    responseType: 'json'
  }).then(response => {
    const readOnlyPadId = getDataFromResponse(response.data, 'readOnlyID');

    if (readOnlyPadId) {
      updateReadOnlyPadId(padId, readOnlyPadId);
    } else {
      Logger.error(`Could not get pad readOnlyID for ${padId}`);
    }
  }).catch(error => Logger.error(`Could not get pad readOnlyID for ${padId}: ${error}`));
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"takeOwnership.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/captions/server/methods/takeOwnership.js                                                                //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => takeOwnership
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let Captions;
module.link("/imports/api/captions", {
  default(v) {
    Captions = v;
  }

}, 1);
let updateOwnerId;
module.link("/imports/api/captions/server/modifiers/updateOwnerId", {
  default(v) {
    updateOwnerId = v;
  }

}, 2);
let extractCredentials;
module.link("/imports/api/common/server/helpers", {
  extractCredentials(v) {
    extractCredentials = v;
  }

}, 3);

function takeOwnership(locale) {
  const {
    meetingId,
    requesterUserId
  } = extractCredentials(this.userId);
  check(locale, String);
  const pad = Captions.findOne({
    meetingId,
    padId: {
      $regex: `_captions_${locale}$`
    }
  });

  if (pad) {
    updateOwnerId(meetingId, requesterUserId, pad.padId);
  }
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"updateOwner.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/captions/server/methods/updateOwner.js                                                                  //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => editCaptions
});
let RedisPubSub;
module.link("/imports/startup/server/redis", {
  default(v) {
    RedisPubSub = v;
  }

}, 0);
let Captions;
module.link("/imports/api/captions", {
  default(v) {
    Captions = v;
  }

}, 1);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 2);
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 3);
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 4);

function editCaptions(meetingId, userId, padId) {
  // TODO
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'UpdateCaptionOwnerPubMsg';
  check(meetingId, String);
  check(userId, String);
  check(padId, String);
  const pad = Captions.findOne({
    meetingId,
    padId
  });
  if (!pad) return Logger.error(`Editing captions owner: ${padId}`);
  const {
    locale
  } = pad;
  check(locale, {
    locale: String,
    name: String
  });
  const payload = {
    ownerId: userId,
    locale: locale.name,
    localeCode: locale.locale
  };
  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, userId, payload);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"modifiers":{"addCaption.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/captions/server/modifiers/addCaption.js                                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => addCaption
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let Captions;
module.link("/imports/api/captions", {
  default(v) {
    Captions = v;
  }

}, 1);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 2);

function addCaption(meetingId, padId, locale) {
  check(meetingId, String);
  check(padId, String);
  check(locale, {
    locale: String,
    name: String
  });
  const selector = {
    meetingId,
    padId
  };
  const modifier = {
    meetingId,
    padId,
    locale,
    ownerId: '',
    readOnlyPadId: '',
    data: '',
    revs: 0,
    length: 0
  };

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Adding caption to collection: ${err}`);
    }

    const {
      insertedId
    } = numChanged;

    if (insertedId) {
      return Logger.verbose(`Added caption locale=${locale.locale} meeting=${meetingId}`);
    }

    return Logger.verbose(`Upserted caption locale=${locale.locale} meeting=${meetingId}`);
  };

  return Captions.upsert(selector, modifier, cb);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"clearCaptions.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/captions/server/modifiers/clearCaptions.js                                                              //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => clearCaptions
});
let Captions;
module.link("/imports/api/captions", {
  default(v) {
    Captions = v;
  }

}, 0);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 1);

function clearCaptions(meetingId) {
  if (meetingId) {
    return Captions.remove({
      meetingId
    }, () => {
      Logger.info(`Cleared Captions (${meetingId})`);
    });
  }

  return Captions.remove({}, () => {
    Logger.info('Cleared Captions (all)');
  });
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"updateOwnerId.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/captions/server/modifiers/updateOwnerId.js                                                              //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => updateOwnerId
});
let Captions;
module.link("/imports/api/captions", {
  default(v) {
    Captions = v;
  }

}, 0);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 1);
let updateOwner;
module.link("/imports/api/captions/server/methods/updateOwner", {
  default(v) {
    updateOwner = v;
  }

}, 2);
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 3);

function updateOwnerId(meetingId, userId, padId) {
  check(meetingId, String);
  check(userId, String);
  check(padId, String);
  const selector = {
    meetingId,
    padId
  };
  const modifier = {
    $set: {
      ownerId: userId
    }
  };

  const cb = err => {
    if (err) {
      return Logger.error(`Updating captions pad: ${err}`);
    }

    updateOwner(meetingId, userId, padId);
    return Logger.verbose(`Update captions pad=${padId} ownerId=${userId}`);
  };

  return Captions.update(selector, modifier, {
    multi: true
  }, cb);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"updatePad.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/captions/server/modifiers/updatePad.js                                                                  //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => updatePad
});
let Captions;
module.link("/imports/api/captions", {
  default(v) {
    Captions = v;
  }

}, 0);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 1);
let editCaptions;
module.link("/imports/api/captions/server/methods/editCaptions", {
  default(v) {
    editCaptions = v;
  }

}, 2);
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 3);

function updatePad(padId, data, revs) {
  check(padId, String);
  check(data, String);
  check(revs, Number);
  const selector = {
    padId
  };
  const modifier = {
    $set: {
      data,
      revs
    },
    $inc: {
      length: data.length
    }
  };

  const cb = err => {
    if (err) {
      return Logger.error(`Updating captions pad: ${err}`);
    }

    editCaptions(padId, data, revs);
    return Logger.verbose(`Update captions pad=${padId} revs=${revs}`);
  };

  return Captions.update(selector, modifier, {
    multi: true
  }, cb);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"updateReadOnlyPadId.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/captions/server/modifiers/updateReadOnlyPadId.js                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => updateReadOnlyPadId
});
let Captions;
module.link("/imports/api/captions", {
  default(v) {
    Captions = v;
  }

}, 0);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 1);
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 2);

function updateReadOnlyPadId(padId, readOnlyPadId) {
  check(padId, String);
  check(readOnlyPadId, String);
  const selector = {
    padId
  };
  const modifier = {
    $set: {
      readOnlyPadId
    }
  };

  const cb = err => {
    if (err) {
      return Logger.error(`Adding readOnlyPadId captions pad: ${err}`);
    }

    return Logger.verbose(`Added readOnlyPadId captions pad=${padId} readOnlyPadId=${readOnlyPadId}`);
  };

  return Captions.update(selector, modifier, {
    multi: true
  }, cb);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"eventHandlers.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/captions/server/eventHandlers.js                                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let RedisPubSub;
module.link("/imports/startup/server/redis", {
  default(v) {
    RedisPubSub = v;
  }

}, 0);
let processForCaptionsPadOnly;
module.link("/imports/api/captions/server/helpers", {
  processForCaptionsPadOnly(v) {
    processForCaptionsPadOnly = v;
  }

}, 1);
let handlePadCreate;
module.link("./handlers/padCreate", {
  default(v) {
    handlePadCreate = v;
  }

}, 2);
let handlePadUpdate;
module.link("./handlers/padUpdate", {
  default(v) {
    handlePadUpdate = v;
  }

}, 3);
RedisPubSub.on('PadCreateSysMsg', processForCaptionsPadOnly(handlePadCreate));
RedisPubSub.on('PadUpdateSysMsg', processForCaptionsPadOnly(handlePadUpdate));
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"helpers.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/captions/server/helpers.js                                                                              //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  generatePadId: () => generatePadId,
  processForCaptionsPadOnly: () => processForCaptionsPadOnly,
  isEnabled: () => isEnabled,
  getLocalesURL: () => getLocalesURL,
  getDataFromChangeset: () => getDataFromChangeset
});
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let hashFNV32a;
module.link("/imports/api/common/server/helpers", {
  hashFNV32a(v) {
    hashFNV32a = v;
  }

}, 1);
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 2);
const CAPTIONS_CONFIG = Meteor.settings.public.captions;
const BASENAME = Meteor.settings.public.app.basename;
const APP = Meteor.settings.private.app;
const LOCALES_URL = `http://${APP.host}:${APP.port}${BASENAME}${APP.localesUrl}`;
const CAPTIONS = '_captions_';
const TOKEN = '$'; // Captions padId should look like: {padId}_captions_{locale}

const generatePadId = (meetingId, locale) => {
  const padId = `${hashFNV32a(meetingId, true)}${CAPTIONS}${locale}`;
  return padId;
};

const isCaptionsPad = padId => {
  const splitPadId = padId.split(CAPTIONS);
  return splitPadId.length === 2;
};

const getDataFromChangeset = changeset => {
  const splitChangeset = changeset.split(TOKEN);

  if (splitChangeset.length > 1) {
    splitChangeset.shift();
    return splitChangeset.join(TOKEN);
  }

  return '';
};

const isEnabled = () => CAPTIONS_CONFIG.enabled;

const getLocalesURL = () => LOCALES_URL;

const processForCaptionsPadOnly = fn => (message, ...args) => {
  const {
    body
  } = message;
  const {
    pad
  } = body;
  const {
    id
  } = pad;
  check(id, String);
  if (isCaptionsPad(id)) return fn(message, ...args);
  return () => {};
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/captions/server/index.js                                                                                //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.link("./eventHandlers");
module.link("./methods");
module.link("./publishers");
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"methods.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/captions/server/methods.js                                                                              //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let takeOwnership;
module.link("/imports/api/captions/server/methods/takeOwnership", {
  default(v) {
    takeOwnership = v;
  }

}, 1);
let appendText;
module.link("/imports/api/captions/server/methods/appendText", {
  default(v) {
    appendText = v;
  }

}, 2);
Meteor.methods({
  takeOwnership,
  appendText
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"publishers.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/captions/server/publishers.js                                                                           //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let Captions;
module.link("/imports/api/captions", {
  default(v) {
    Captions = v;
  }

}, 0);
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 1);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 2);
let extractCredentials;
module.link("/imports/api/common/server/helpers", {
  extractCredentials(v) {
    extractCredentials = v;
  }

}, 3);

function captions() {
  if (!this.userId) {
    return Captions.find({
      meetingId: ''
    });
  }

  const {
    meetingId
  } = extractCredentials(this.userId);
  Logger.debug(`Publishing Captions for ${meetingId}`);
  return Captions.find({
    meetingId
  });
}

function publish(...args) {
  const boundCaptions = captions.bind(this);
  return boundCaptions(...args);
}

Meteor.publish('captions', publish);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"index.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/captions/index.js                                                                                       //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
const Captions = new Mongo.Collection('captions');

if (Meteor.isServer) {
  Captions._ensureIndex({
    meetingId: 1,
    padId: 1
  });
}

module.exportDefault(Captions);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"cursor":{"server":{"handlers":{"cursorUpdate.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/cursor/server/handlers/cursorUpdate.js                                                                  //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => handleCursorUpdate
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let CursorStreamer;
module.link("/imports/api/cursor/server/streamer", {
  default(v) {
    CursorStreamer = v;
  }

}, 1);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 2);

let _;

module.link("lodash", {
  default(v) {
    _ = v;
  }

}, 3);
const {
  streamerLog
} = Meteor.settings.private.serverLog;
const CURSOR_PROCCESS_INTERVAL = 30;
const cursorQueue = {};

const proccess = _.throttle(() => {
  try {
    Object.keys(cursorQueue).forEach(meetingId => {
      try {
        const cursors = cursorQueue[meetingId];
        delete cursorQueue[meetingId];
        CursorStreamer(meetingId).emit('message', {
          meetingId,
          cursors
        });

        if (streamerLog) {
          Logger.debug(`CursorUpdate process for meeting ${meetingId} has finished`);
        }
      } catch (error) {
        Logger.error(`Error while trying to send cursor streamer data for meeting ${meetingId}. ${error}`);
      }
    });
  } catch (error) {
    Logger.error(`Error while processing cursor queue. ${error}`);
  }
}, CURSOR_PROCCESS_INTERVAL);

function handleCursorUpdate({
  header,
  body
}, meetingId) {
  const {
    userId
  } = header;
  check(body, Object);
  check(meetingId, String);
  check(userId, String);

  if (!cursorQueue[meetingId]) {
    cursorQueue[meetingId] = {};
  } // overwrite since we dont care about the other positions


  cursorQueue[meetingId][userId] = body;
  proccess();
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"methods":{"publishCursorUpdate.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/cursor/server/methods/publishCursorUpdate.js                                                            //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => publishCursorUpdate
});
let RedisPubSub;
module.link("/imports/startup/server/redis", {
  default(v) {
    RedisPubSub = v;
  }

}, 0);
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 1);

function publishCursorUpdate(meetingId, requesterUserId, payload) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'SendCursorPositionPubMsg';
  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"eventHandlers.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/cursor/server/eventHandlers.js                                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let RedisPubSub;
module.link("/imports/startup/server/redis", {
  default(v) {
    RedisPubSub = v;
  }

}, 0);
let handleCursorUpdate;
module.link("./handlers/cursorUpdate", {
  default(v) {
    handleCursorUpdate = v;
  }

}, 1);
RedisPubSub.on('SendCursorPositionEvtMsg', handleCursorUpdate);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/cursor/server/index.js                                                                                  //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.link("./eventHandlers");
module.link("./methods");
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"methods.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/cursor/server/methods.js                                                                                //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let publishCursorUpdate;
module.link("./methods/publishCursorUpdate", {
  default(v) {
    publishCursorUpdate = v;
  }

}, 1);
Meteor.methods({
  publishCursorUpdate
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"streamer.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/cursor/server/streamer.js                                                                               //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  removeCursorStreamer: () => removeCursorStreamer,
  addCursorStreamer: () => addCursorStreamer,
  default: () => get
});
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 0);
let publishCursorUpdate;
module.link("./methods/publishCursorUpdate", {
  default(v) {
    publishCursorUpdate = v;
  }

}, 1);
const {
  streamerLog
} = Meteor.settings.private.serverLog;

function removeCursorStreamer(meetingId) {
  Logger.info(`Removing Cursor streamer object for meeting ${meetingId}`);
  delete Meteor.StreamerCentral.instances[`cursor-${meetingId}`];
}

function addCursorStreamer(meetingId) {
  const streamer = new Meteor.Streamer(`cursor-${meetingId}`, {
    retransmit: false
  });

  if (streamerLog) {
    Logger.debug(`Cursor streamer created for meeting ${meetingId}`);
  }

  streamer.allowRead(function allowRead() {
    if (streamerLog) {
      Logger.debug(`Cursor streamer called allowRead for user ${this.userId} in meeting ${meetingId}`);
    }

    return this.userId && this.userId.includes(meetingId);
  });
  streamer.allowWrite(function allowWrite() {
    return this.userId && this.userId.includes(meetingId);
  });
  streamer.on('publish', message => {
    publishCursorUpdate(meetingId, message.userId, message.payload);
  });
}

function get(meetingId) {
  return Meteor.StreamerCentral.instances[`cursor-${meetingId}`];
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}},"external-videos":{"server":{"methods":{"destroyExternalVideo.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/external-videos/server/methods/destroyExternalVideo.js                                                  //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => destroyExternalVideo
});
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 1);

function destroyExternalVideo(meetingId) {
  const streamName = `external-videos-${meetingId}`;

  if (Meteor.StreamerCentral.instances[streamName]) {
    Logger.info(`Destroying External Video streamer object for ${streamName}`);
    delete Meteor.StreamerCentral.instances[streamName];
  }
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"emitExternalVideoEvent.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/external-videos/server/methods/emitExternalVideoEvent.js                                                //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => emitExternalVideoEvent
});
let Users;
module.link("/imports/api/users", {
  default(v) {
    Users = v;
  }

}, 0);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 1);
let extractCredentials;
module.link("/imports/api/common/server/helpers", {
  extractCredentials(v) {
    extractCredentials = v;
  }

}, 2);

function emitExternalVideoEvent(messageName, ...rest) {
  const {
    meetingId,
    requesterUserId: userId
  } = extractCredentials(this.userId);
  const user = Users.findOne({
    userId,
    meetingId
  });

  if (user && user.presenter) {
    const streamerName = `external-videos-${meetingId}`;
    const streamer = Meteor.StreamerCentral.instances[streamerName];

    if (streamer) {
      streamer.emit(messageName, ...rest);
    } else {
      Logger.error(`External Video Streamer not found for meetingId: ${meetingId} userId: ${userId}`);
    }
  }
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"initializeExternalVideo.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/external-videos/server/methods/initializeExternalVideo.js                                               //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => initializeExternalVideo
});
let extractCredentials;
module.link("/imports/api/common/server/helpers", {
  extractCredentials(v) {
    extractCredentials = v;
  }

}, 0);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 1);

const allowRecentMessages = (eventName, message) => {
  const LATE_MESSAGE_THRESHOLD = 3000;
  const {
    userId,
    meetingId,
    time,
    timestamp,
    rate,
    state
  } = message;

  if (timestamp > Date.now() - LATE_MESSAGE_THRESHOLD) {
    Logger.debug(`ExternalVideo Streamer auth allowed userId: ${userId}, meetingId: ${meetingId}, event: ${eventName}, time: ${time}, timestamp: ${timestamp / 1000} rate: ${rate}, state: ${state}`);
    return true;
  }

  Logger.debug(`ExternalVideo Streamer auth rejected userId: ${userId}, meetingId: ${meetingId}, event: ${eventName}, time: ${time}, timestamp: ${timestamp / 1000} rate: ${rate}, state: ${state}`);
  return false;
};

function initializeExternalVideo() {
  const {
    meetingId
  } = extractCredentials(this.userId);
  const streamName = `external-videos-${meetingId}`;

  if (!Meteor.StreamerCentral.instances[streamName]) {
    const streamer = new Meteor.Streamer(streamName);
    streamer.allowRead('all');
    streamer.allowWrite('none');
    streamer.allowEmit(allowRecentMessages);
    Logger.info(`Created External Video streamer for ${streamName}`);
  } else {
    Logger.debug(`External Video streamer is already created for ${streamName}`);
  }
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"startWatchingExternalVideo.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/external-videos/server/methods/startWatchingExternalVideo.js                                            //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => startWatchingExternalVideo
});
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 1);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 2);
let Meetings;
module.link("/imports/api/meetings", {
  default(v) {
    Meetings = v;
  }

}, 3);
let RedisPubSub;
module.link("/imports/startup/server/redis", {
  default(v) {
    RedisPubSub = v;
  }

}, 4);
let extractCredentials;
module.link("/imports/api/common/server/helpers", {
  extractCredentials(v) {
    extractCredentials = v;
  }

}, 5);

function startWatchingExternalVideo(options) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'StartExternalVideoMsg';
  const {
    meetingId,
    requesterUserId
  } = extractCredentials(this.userId);
  const {
    externalVideoUrl
  } = options;
  check(externalVideoUrl, String);
  Meetings.update({
    meetingId
  }, {
    $set: {
      externalVideoUrl
    }
  });
  const payload = {
    externalVideoUrl
  };
  Logger.info(`User id=${requesterUserId} sharing an external video: ${externalVideoUrl} for meeting ${meetingId}`);
  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"stopWatchingExternalVideo.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/external-videos/server/methods/stopWatchingExternalVideo.js                                             //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => stopWatchingExternalVideo
});
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 1);
let Meetings;
module.link("/imports/api/meetings", {
  default(v) {
    Meetings = v;
  }

}, 2);
let RedisPubSub;
module.link("/imports/startup/server/redis", {
  default(v) {
    RedisPubSub = v;
  }

}, 3);
let extractCredentials;
module.link("/imports/api/common/server/helpers", {
  extractCredentials(v) {
    extractCredentials = v;
  }

}, 4);

function stopWatchingExternalVideo(options) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'StopExternalVideoMsg';

  if (this.userId) {
    options = extractCredentials(this.userId);
  }

  const {
    meetingId,
    requesterUserId
  } = options;
  const meeting = Meetings.findOne({
    meetingId
  });
  if (!meeting || meeting.externalVideoUrl === null) return;
  Meetings.update({
    meetingId
  }, {
    $set: {
      externalVideoUrl: null
    }
  });
  const payload = {};
  Logger.info(`User id=${requesterUserId} stopped sharing an external video for meeting=${meetingId}`);
  RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"index.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/external-videos/server/index.js                                                                         //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.link("./methods");
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"methods.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/external-videos/server/methods.js                                                                       //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let startWatchingExternalVideo;
module.link("./methods/startWatchingExternalVideo", {
  default(v) {
    startWatchingExternalVideo = v;
  }

}, 1);
let stopWatchingExternalVideo;
module.link("./methods/stopWatchingExternalVideo", {
  default(v) {
    stopWatchingExternalVideo = v;
  }

}, 2);
let initializeExternalVideo;
module.link("./methods/initializeExternalVideo", {
  default(v) {
    initializeExternalVideo = v;
  }

}, 3);
let emitExternalVideoEvent;
module.link("./methods/emitExternalVideoEvent", {
  default(v) {
    emitExternalVideoEvent = v;
  }

}, 4);
Meteor.methods({
  initializeExternalVideo,
  startWatchingExternalVideo,
  stopWatchingExternalVideo,
  emitExternalVideoEvent
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}},"group-chat":{"server":{"handlers":{"groupChatCreated.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/group-chat/server/handlers/groupChatCreated.js                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => handleGroupChatCreated
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let addGroupChat;
module.link("../modifiers/addGroupChat", {
  default(v) {
    addGroupChat = v;
  }

}, 1);

function handleGroupChatCreated({
  body
}, meetingId) {
  check(meetingId, String);
  check(body, Object);
  return addGroupChat(meetingId, body);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"groupChatDestroyed.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/group-chat/server/handlers/groupChatDestroyed.js                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => handleGroupChatDestroyed
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let addGroupChat;
module.link("../modifiers/addGroupChat", {
  default(v) {
    addGroupChat = v;
  }

}, 1);

function handleGroupChatDestroyed({
  body
}, meetingId) {
  check(meetingId, String);
  check(body, Object);
  return addGroupChat(meetingId, body);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"groupChats.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/group-chat/server/handlers/groupChats.js                                                                //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => handleGroupChats
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let addGroupChat;
module.link("../modifiers/addGroupChat", {
  default(v) {
    addGroupChat = v;
  }

}, 1);

function handleGroupChats({
  body
}, meetingId) {
  const {
    chats
  } = body;
  check(meetingId, String);
  check(chats, Array);
  const chatsAdded = [];
  chats.forEach(chat => {
    chatsAdded.push(addGroupChat(meetingId, chat));
  });
  return chatsAdded;
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"methods":{"createGroupChat.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/group-chat/server/methods/createGroupChat.js                                                            //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => createGroupChat
});
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 1);
let RedisPubSub;
module.link("/imports/startup/server/redis", {
  default(v) {
    RedisPubSub = v;
  }

}, 2);
let CHAT_ACCESS_PRIVATE;
module.link("/imports/api/group-chat", {
  CHAT_ACCESS_PRIVATE(v) {
    CHAT_ACCESS_PRIVATE = v;
  }

}, 3);
let extractCredentials;
module.link("/imports/api/common/server/helpers", {
  extractCredentials(v) {
    extractCredentials = v;
  }

}, 4);

function createGroupChat(receiver) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'CreateGroupChatReqMsg';
  const {
    meetingId,
    requesterUserId
  } = extractCredentials(this.userId);
  check(receiver, Object);
  const payload = {
    correlationId: `${requesterUserId}-${Date.now()}`,
    msg: [],
    users: [receiver.userId],
    access: CHAT_ACCESS_PRIVATE,
    name: receiver.name
  };
  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"destroyGroupChat.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/group-chat/server/methods/destroyGroupChat.js                                                           //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => createGroupChat
});
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let RedisPubSub;
module.link("/imports/startup/server/redis", {
  default(v) {
    RedisPubSub = v;
  }

}, 1);
let extractCredentials;
module.link("/imports/api/common/server/helpers", {
  extractCredentials(v) {
    extractCredentials = v;
  }

}, 2);

function createGroupChat() {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const {
    meetingId,
    requesterUserId
  } = extractCredentials(this.userId);
  const eventName = 'DestroyGroupChatReqMsg';
  const payload = {// TODO: Implement this together with #4988
    // chats: Array[String],
  };
  return RedisPubSub.publishUserMessage(CHANNEL, eventName, meetingId, requesterUserId, payload);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"modifiers":{"addGroupChat.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/group-chat/server/modifiers/addGroupChat.js                                                             //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => addGroupChat
});
let flat;
module.link("flat", {
  default(v) {
    flat = v;
  }

}, 0);
let Match, check;
module.link("meteor/check", {
  Match(v) {
    Match = v;
  },

  check(v) {
    check = v;
  }

}, 1);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 2);
let GroupChat;
module.link("/imports/api/group-chat", {
  default(v) {
    GroupChat = v;
  }

}, 3);

function addGroupChat(meetingId, chat) {
  check(meetingId, String);
  check(chat, {
    id: Match.Maybe(String),
    chatId: Match.Maybe(String),
    correlationId: Match.Maybe(String),
    name: String,
    access: String,
    createdBy: Object,
    users: Array,
    msg: Match.Maybe(Array)
  });
  const chatDocument = {
    meetingId,
    chatId: chat.chatId || chat.id,
    name: chat.name,
    access: chat.access,
    users: chat.users.map(u => u.id),
    createdBy: chat.createdBy.id
  };
  const selector = {
    chatId: chatDocument.chatId,
    meetingId
  };
  const modifier = {
    $set: flat(chatDocument, {
      safe: true
    })
  };

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Adding group-chat to collection: ${err}`);
    }

    const {
      insertedId
    } = numChanged;

    if (insertedId) {
      return Logger.info(`Added group-chat name=${chat.name} meetingId=${meetingId}`);
    }

    return Logger.info(`Upserted group-chat name=${chat.name} meetingId=${meetingId}`);
  };

  return GroupChat.upsert(selector, modifier, cb);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"clearGroupChat.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/group-chat/server/modifiers/clearGroupChat.js                                                           //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => clearGroupChat
});
let GroupChat;
module.link("/imports/api/group-chat", {
  default(v) {
    GroupChat = v;
  }

}, 0);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 1);
let clearGroupChatMsg;
module.link("/imports/api/group-chat-msg/server/modifiers/clearGroupChatMsg", {
  default(v) {
    clearGroupChatMsg = v;
  }

}, 2);

function clearGroupChat(meetingId) {
  clearGroupChatMsg(meetingId);
  return GroupChat.remove({
    meetingId
  }, () => {
    Logger.info(`Cleared GroupChat (${meetingId})`);
  });
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"eventHandlers.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/group-chat/server/eventHandlers.js                                                                      //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let RedisPubSub;
module.link("/imports/startup/server/redis", {
  default(v) {
    RedisPubSub = v;
  }

}, 0);
let handleGroupChats;
module.link("./handlers/groupChats", {
  default(v) {
    handleGroupChats = v;
  }

}, 1);
let handleGroupChatCreated;
module.link("./handlers/groupChatCreated", {
  default(v) {
    handleGroupChatCreated = v;
  }

}, 2);
let handleGroupChatDestroyed;
module.link("./handlers/groupChatDestroyed", {
  default(v) {
    handleGroupChatDestroyed = v;
  }

}, 3);
let processForHTML5ServerOnly;
module.link("/imports/api/common/server/helpers", {
  processForHTML5ServerOnly(v) {
    processForHTML5ServerOnly = v;
  }

}, 4);
RedisPubSub.on('GetGroupChatsRespMsg', processForHTML5ServerOnly(handleGroupChats));
RedisPubSub.on('GroupChatCreatedEvtMsg', handleGroupChatCreated);
RedisPubSub.on('GroupChatDestroyedEvtMsg', handleGroupChatDestroyed);
RedisPubSub.on('SyncGetGroupChatsRespMsg', handleGroupChats);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/group-chat/server/index.js                                                                              //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.link("/imports/api/group-chat-msg/server");
module.link("./eventHandlers");
module.link("./methods");
module.link("./publishers");
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"methods.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/group-chat/server/methods.js                                                                            //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let createGroupChat;
module.link("./methods/createGroupChat", {
  default(v) {
    createGroupChat = v;
  }

}, 1);
let destroyGroupChat;
module.link("./methods/destroyGroupChat", {
  default(v) {
    destroyGroupChat = v;
  }

}, 2);
Meteor.methods({
  createGroupChat,
  destroyGroupChat
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"publishers.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/group-chat/server/publishers.js                                                                         //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let GroupChat;
module.link("/imports/api/group-chat", {
  default(v) {
    GroupChat = v;
  }

}, 0);
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 1);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 2);
let extractCredentials;
module.link("/imports/api/common/server/helpers", {
  extractCredentials(v) {
    extractCredentials = v;
  }

}, 3);

function groupChat() {
  if (!this.userId) {
    return GroupChat.find({
      meetingId: ''
    });
  }

  const {
    meetingId,
    requesterUserId
  } = extractCredentials(this.userId);
  const CHAT_CONFIG = Meteor.settings.public.chat;
  const PUBLIC_CHAT_TYPE = CHAT_CONFIG.type_public;
  Logger.debug(`Publishing group-chat for ${meetingId} ${requesterUserId}`);
  return GroupChat.find({
    $or: [{
      meetingId,
      access: PUBLIC_CHAT_TYPE
    }, {
      meetingId,
      users: {
        $all: [requesterUserId]
      }
    }]
  });
}

function publish(...args) {
  const boundGroupChat = groupChat.bind(this);
  return boundGroupChat(...args);
}

Meteor.publish('group-chat', publish);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"index.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/group-chat/index.js                                                                                     //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  CHAT_ACCESS_PUBLIC: () => CHAT_ACCESS_PUBLIC,
  CHAT_ACCESS_PRIVATE: () => CHAT_ACCESS_PRIVATE
});
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
const GroupChat = new Mongo.Collection('group-chat');

if (Meteor.isServer) {
  GroupChat._ensureIndex({
    meetingId: 1,
    chatId: 1,
    access: 1,
    users: 1
  });
}

module.exportDefault(GroupChat);
const CHAT_ACCESS = {
  PUBLIC: 'PUBLIC_ACCESS',
  PRIVATE: 'PRIVATE_ACCESS'
};
const CHAT_ACCESS_PUBLIC = CHAT_ACCESS.PUBLIC;
const CHAT_ACCESS_PRIVATE = CHAT_ACCESS.PRIVATE;
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"group-chat-msg":{"server":{"handlers":{"clearPublicGroupChat.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/group-chat-msg/server/handlers/clearPublicGroupChat.js                                                  //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => clearPublicChatHistory
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let clearGroupChatMsg;
module.link("../modifiers/clearGroupChatMsg", {
  default(v) {
    clearGroupChatMsg = v;
  }

}, 1);

function clearPublicChatHistory({
  header,
  body
}) {
  const {
    meetingId
  } = header;
  const {
    chatId
  } = body;
  check(meetingId, String);
  check(chatId, String);
  return clearGroupChatMsg(meetingId, chatId);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"groupChatMsgBroadcast.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/group-chat-msg/server/handlers/groupChatMsgBroadcast.js                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => handleGroupChatMsgBroadcast
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let addGroupChatMsg;
module.link("../modifiers/addGroupChatMsg", {
  default(v) {
    addGroupChatMsg = v;
  }

}, 1);

function handleGroupChatMsgBroadcast({
  body
}, meetingId) {
  const {
    chatId,
    msg
  } = body;
  check(meetingId, String);
  check(chatId, String);
  check(msg, Object);
  return addGroupChatMsg(meetingId, chatId, msg);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"groupChatsMsgs.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/group-chat-msg/server/handlers/groupChatsMsgs.js                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => handleGroupChatsMsgs
});
let Match, check;
module.link("meteor/check", {
  Match(v) {
    Match = v;
  },

  check(v) {
    check = v;
  }

}, 0);
let addGroupChatMsg;
module.link("../modifiers/addGroupChatMsg", {
  default(v) {
    addGroupChatMsg = v;
  }

}, 1);

function handleGroupChatsMsgs({
  body
}, meetingId) {
  const {
    chatId,
    msgs,
    msg
  } = body;
  check(meetingId, String);
  check(chatId, String);
  check(msgs, Match.Maybe(Array));
  check(msg, Match.Maybe(Array));
  const msgsAdded = [];
  (msgs || msg).forEach(m => {
    msgsAdded.push(addGroupChatMsg(meetingId, chatId, m));
  });
  return msgsAdded;
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"userTyping.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/group-chat-msg/server/handlers/userTyping.js                                                            //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => handleUserTyping
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let startTyping;
module.link("../modifiers/startTyping", {
  default(v) {
    startTyping = v;
  }

}, 1);

function handleUserTyping({
  body
}, meetingId) {
  const {
    chatId,
    userId
  } = body;
  check(meetingId, String);
  check(userId, String);
  check(chatId, String);
  startTyping(meetingId, userId, chatId);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"methods":{"clearPublicChatHistory.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/group-chat-msg/server/methods/clearPublicChatHistory.js                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => clearPublicChatHistory
});
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let RedisPubSub;
module.link("/imports/startup/server/redis", {
  default(v) {
    RedisPubSub = v;
  }

}, 1);
let extractCredentials;
module.link("/imports/api/common/server/helpers", {
  extractCredentials(v) {
    extractCredentials = v;
  }

}, 2);

function clearPublicChatHistory() {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'ClearPublicChatHistoryPubMsg';
  const CHAT_CONFIG = Meteor.settings.public.chat;
  const PUBLIC_GROUP_CHAT_ID = CHAT_CONFIG.public_group_id;
  const {
    meetingId,
    requesterUserId
  } = extractCredentials(this.userId);
  const payload = {
    chatId: PUBLIC_GROUP_CHAT_ID
  };
  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"sendGroupChatMsg.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/group-chat-msg/server/methods/sendGroupChatMsg.js                                                       //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => sendGroupChatMsg
});
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 1);
let RedisPubSub;
module.link("/imports/startup/server/redis", {
  default(v) {
    RedisPubSub = v;
  }

}, 2);
let RegexWebUrl;
module.link("/imports/utils/regex-weburl", {
  default(v) {
    RegexWebUrl = v;
  }

}, 3);
let extractCredentials;
module.link("/imports/api/common/server/helpers", {
  extractCredentials(v) {
    extractCredentials = v;
  }

}, 4);
const HTML_SAFE_MAP = {
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
};

const parseMessage = message => {
  let parsedMessage = message || '';
  parsedMessage = parsedMessage.trim(); // Replace <br/> with \n\r

  parsedMessage = parsedMessage.replace(/<br\s*[\\/]?>/gi, '\n\r'); // Sanitize. See: http://shebang.brandonmintern.com/foolproof-html-escaping-in-javascript/

  parsedMessage = parsedMessage.replace(/[<>'"]/g, c => HTML_SAFE_MAP[c]); // Replace flash links to flash valid ones

  parsedMessage = parsedMessage.replace(RegexWebUrl, "<a href='event:$&'><u>$&</u></a>");
  return parsedMessage;
};

function sendGroupChatMsg(chatId, message) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'SendGroupChatMessageMsg';
  const {
    meetingId,
    requesterUserId
  } = extractCredentials(this.userId);
  check(message, Object);
  const parsedMessage = parseMessage(message.message);
  message.message = parsedMessage;
  const payload = {
    msg: message,
    chatId
  };
  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"startUserTyping.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/group-chat-msg/server/methods/startUserTyping.js                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => startUserTyping
});
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 1);
let RedisPubSub;
module.link("/imports/startup/server/redis", {
  default(v) {
    RedisPubSub = v;
  }

}, 2);
let extractCredentials;
module.link("/imports/api/common/server/helpers", {
  extractCredentials(v) {
    extractCredentials = v;
  }

}, 3);

function startUserTyping(chatId) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'UserTypingPubMsg';
  const CHAT_CONFIG = Meteor.settings.public.chat;
  const PUBLIC_GROUP_CHAT_ID = CHAT_CONFIG.public_group_id;
  const {
    meetingId,
    requesterUserId
  } = extractCredentials(this.userId);
  check(chatId, String);
  const payload = {
    chatId: chatId || PUBLIC_GROUP_CHAT_ID
  };
  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"stopUserTyping.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/group-chat-msg/server/methods/stopUserTyping.js                                                         //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => stopUserTyping
});
let UsersTyping;
module.link("/imports/api/group-chat-msg", {
  UsersTyping(v) {
    UsersTyping = v;
  }

}, 0);
let stopTyping;
module.link("../modifiers/stopTyping", {
  default(v) {
    stopTyping = v;
  }

}, 1);
let extractCredentials;
module.link("/imports/api/common/server/helpers", {
  extractCredentials(v) {
    extractCredentials = v;
  }

}, 2);

function stopUserTyping() {
  const {
    meetingId,
    requesterUserId
  } = extractCredentials(this.userId);
  const userTyping = UsersTyping.findOne({
    meetingId,
    userId: requesterUserId
  });

  if (userTyping) {
    stopTyping(meetingId, requesterUserId, true);
  }
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"modifiers":{"addGroupChatMsg.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/group-chat-msg/server/modifiers/addGroupChatMsg.js                                                      //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread"));

module.export({
  default: () => addGroupChatMsg
});
let flat;
module.link("flat", {
  default(v) {
    flat = v;
  }

}, 0);
let Match, check;
module.link("meteor/check", {
  Match(v) {
    Match = v;
  },

  check(v) {
    check = v;
  }

}, 1);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 2);
let GroupChatMsg;
module.link("/imports/api/group-chat-msg", {
  GroupChatMsg(v) {
    GroupChatMsg = v;
  }

}, 3);
let BREAK_LINE;
module.link("/imports/utils/lineEndings", {
  BREAK_LINE(v) {
    BREAK_LINE = v;
  }

}, 4);

const parseMessage = message => {
  let parsedMessage = message || ''; // Replace \r and \n to <br/>

  parsedMessage = parsedMessage.replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, `$1${BREAK_LINE}$2`); // Replace flash links to html valid ones

  parsedMessage = parsedMessage.split('<a href=\'event:').join('<a target="_blank" href=\'');
  parsedMessage = parsedMessage.split('<a href="event:').join('<a target="_blank" href="');
  return parsedMessage;
};

function addGroupChatMsg(meetingId, chatId, msg) {
  check(meetingId, String);
  check(chatId, String);
  check(msg, {
    id: Match.Maybe(String),
    timestamp: Number,
    sender: Object,
    color: String,
    message: String,
    correlationId: Match.Maybe(String)
  });
  const msgDocument = (0, _objectSpread2.default)({}, msg, {
    meetingId,
    chatId,
    message: parseMessage(msg.message),
    sender: msg.sender.id
  });
  const selector = {
    meetingId,
    chatId,
    id: msg.id
  };
  const modifier = {
    $set: flat(msgDocument, {
      safe: true
    })
  };

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Adding group-chat-msg to collection: ${err}`);
    }

    const {
      insertedId
    } = numChanged;

    if (insertedId) {
      return Logger.info(`Added group-chat-msg msgId=${msg.id} chatId=${chatId} meetingId=${meetingId}`);
    }

    return Logger.info(`Upserted group-chat-msg msgId=${msg.id} chatId=${chatId} meetingId=${meetingId}`);
  };

  return GroupChatMsg.upsert(selector, modifier, cb);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"clearGroupChatMsg.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/group-chat-msg/server/modifiers/clearGroupChatMsg.js                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => clearGroupChatMsg
});
let GroupChatMsg;
module.link("/imports/api/group-chat-msg", {
  GroupChatMsg(v) {
    GroupChatMsg = v;
  }

}, 0);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 1);
let addGroupChatMsg;
module.link("/imports/api/group-chat-msg/server/modifiers/addGroupChatMsg", {
  default(v) {
    addGroupChatMsg = v;
  }

}, 2);

function clearGroupChatMsg(meetingId, chatId) {
  const CHAT_CONFIG = Meteor.settings.public.chat;
  const PUBLIC_CHAT_SYSTEM_ID = CHAT_CONFIG.system_userid;
  const PUBLIC_GROUP_CHAT_ID = CHAT_CONFIG.public_group_id;
  const CHAT_CLEAR_MESSAGE = CHAT_CONFIG.system_messages_keys.chat_clear;

  if (chatId) {
    GroupChatMsg.remove({
      meetingId,
      chatId
    }, () => {
      Logger.info(`Cleared GroupChatMsg (${meetingId}, ${chatId})`);
      const clearMsg = {
        color: '0',
        timestamp: Date.now(),
        correlationId: `${PUBLIC_CHAT_SYSTEM_ID}-${Date.now()}`,
        sender: {
          id: PUBLIC_CHAT_SYSTEM_ID,
          name: ''
        },
        message: CHAT_CLEAR_MESSAGE
      };
      addGroupChatMsg(meetingId, PUBLIC_GROUP_CHAT_ID, clearMsg);
    });
    return true;
  }

  if (meetingId) {
    return GroupChatMsg.remove({
      meetingId,
      chatId: {
        $eq: PUBLIC_GROUP_CHAT_ID
      }
    }, () => {
      Logger.info(`Cleared GroupChatMsg (${meetingId})`);
    });
  }

  return GroupChatMsg.remove({
    chatId: {
      $eq: PUBLIC_GROUP_CHAT_ID
    }
  }, () => {
    Logger.info('Cleared GroupChatMsg (all)');
  });
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"startTyping.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/group-chat-msg/server/modifiers/startTyping.js                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => startTyping
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 1);
let Users;
module.link("/imports/api/users", {
  default(v) {
    Users = v;
  }

}, 2);
let UsersTyping;
module.link("/imports/api/group-chat-msg", {
  UsersTyping(v) {
    UsersTyping = v;
  }

}, 3);
let stopTyping;
module.link("./stopTyping", {
  default(v) {
    stopTyping = v;
  }

}, 4);
const TYPING_TIMEOUT = 5000;

function startTyping(meetingId, userId, chatId) {
  check(meetingId, String);
  check(userId, String);
  const selector = {
    meetingId,
    userId
  };
  const user = Users.findOne(selector);
  const mod = {
    meetingId,
    userId,
    name: user.name,
    isTypingTo: chatId,
    role: user.role,
    time: new Date()
  };
  const typingUser = UsersTyping.findOne(selector, {
    fields: {
      time: 1
    }
  });

  if (typingUser) {
    if (mod.time - typingUser.time <= TYPING_TIMEOUT - 100) return;
  }

  const cb = err => {
    if (err) {
      return Logger.error(`Typing indicator update error: ${err}`);
    }

    Meteor.setTimeout(() => {
      stopTyping(meetingId, userId);
    }, TYPING_TIMEOUT);
    return Logger.debug(`Typing indicator update for userId={${userId}} chatId={${chatId}}`);
  };

  return UsersTyping.upsert(selector, mod, cb);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"stopTyping.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/group-chat-msg/server/modifiers/stopTyping.js                                                           //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => stopTyping
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 1);
let UsersTyping;
module.link("/imports/api/group-chat-msg", {
  UsersTyping(v) {
    UsersTyping = v;
  }

}, 2);

function stopTyping(meetingId, userId, sendMsgInitiated = false) {
  check(meetingId, String);
  check(userId, String);
  check(sendMsgInitiated, Boolean);
  const selector = {
    meetingId,
    userId
  };
  const user = UsersTyping.findOne(selector);
  const stillTyping = !sendMsgInitiated && user && new Date() - user.time < 3000;
  if (stillTyping) return;

  const cb = err => {
    if (err) {
      return Logger.error(`Stop user=${userId} typing indicator error: ${err}`);
    }

    return Logger.debug(`Stopped typing indicator for user=${userId}`);
  };

  UsersTyping.remove(selector, cb);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"eventHandlers.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/group-chat-msg/server/eventHandlers.js                                                                  //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let RedisPubSub;
module.link("/imports/startup/server/redis", {
  default(v) {
    RedisPubSub = v;
  }

}, 0);
let handleGroupChatsMsgs;
module.link("./handlers/groupChatsMsgs", {
  default(v) {
    handleGroupChatsMsgs = v;
  }

}, 1);
let handleGroupChatMsgBroadcast;
module.link("./handlers/groupChatMsgBroadcast", {
  default(v) {
    handleGroupChatMsgBroadcast = v;
  }

}, 2);
let handleClearPublicGroupChat;
module.link("./handlers/clearPublicGroupChat", {
  default(v) {
    handleClearPublicGroupChat = v;
  }

}, 3);
let handleUserTyping;
module.link("./handlers/userTyping", {
  default(v) {
    handleUserTyping = v;
  }

}, 4);
let processForHTML5ServerOnly;
module.link("/imports/api/common/server/helpers", {
  processForHTML5ServerOnly(v) {
    processForHTML5ServerOnly = v;
  }

}, 5);
RedisPubSub.on('GetGroupChatMsgsRespMsg', processForHTML5ServerOnly(handleGroupChatsMsgs));
RedisPubSub.on('GroupChatMessageBroadcastEvtMsg', handleGroupChatMsgBroadcast);
RedisPubSub.on('ClearPublicChatHistoryEvtMsg', handleClearPublicGroupChat);
RedisPubSub.on('SyncGetGroupChatMsgsRespMsg', handleGroupChatsMsgs);
RedisPubSub.on('UserTypingEvtMsg', handleUserTyping);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/group-chat-msg/server/index.js                                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.link("./eventHandlers");
module.link("./methods");
module.link("./publishers");
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"methods.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/group-chat-msg/server/methods.js                                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let sendGroupChatMsg;
module.link("./methods/sendGroupChatMsg", {
  default(v) {
    sendGroupChatMsg = v;
  }

}, 1);
let clearPublicChatHistory;
module.link("./methods/clearPublicChatHistory", {
  default(v) {
    clearPublicChatHistory = v;
  }

}, 2);
let startUserTyping;
module.link("./methods/startUserTyping", {
  default(v) {
    startUserTyping = v;
  }

}, 3);
let stopUserTyping;
module.link("./methods/stopUserTyping", {
  default(v) {
    stopUserTyping = v;
  }

}, 4);
Meteor.methods({
  sendGroupChatMsg,
  clearPublicChatHistory,
  startUserTyping,
  stopUserTyping
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"publishers.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/group-chat-msg/server/publishers.js                                                                     //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let GroupChatMsg, UsersTyping;
module.link("/imports/api/group-chat-msg", {
  GroupChatMsg(v) {
    GroupChatMsg = v;
  },

  UsersTyping(v) {
    UsersTyping = v;
  }

}, 0);
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 1);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 2);
let extractCredentials;
module.link("/imports/api/common/server/helpers", {
  extractCredentials(v) {
    extractCredentials = v;
  }

}, 3);

function groupChatMsg(chatsIds) {
  if (!this.userId) {
    return GroupChatMsg.find({
      meetingId: ''
    });
  }

  const {
    meetingId,
    requesterUserId
  } = extractCredentials(this.userId);
  const CHAT_CONFIG = Meteor.settings.public.chat;
  const PUBLIC_GROUP_CHAT_ID = CHAT_CONFIG.public_group_id;
  Logger.debug(`Publishing group-chat-msg for ${meetingId} ${requesterUserId}`);
  return GroupChatMsg.find({
    $or: [{
      meetingId,
      chatId: {
        $eq: PUBLIC_GROUP_CHAT_ID
      }
    }, {
      chatId: {
        $in: chatsIds
      }
    }]
  });
}

function publish(...args) {
  const boundGroupChat = groupChatMsg.bind(this);
  return boundGroupChat(...args);
}

Meteor.publish('group-chat-msg', publish);

function usersTyping() {
  if (!this.userId) {
    return UsersTyping.find({
      meetingId: ''
    });
  }

  const {
    meetingId,
    requesterUserId
  } = extractCredentials(this.userId);
  Logger.debug(`Publishing users-typing for ${meetingId} ${requesterUserId}`);
  return UsersTyping.find({
    meetingId
  });
}

function pubishUsersTyping(...args) {
  const boundUsersTyping = usersTyping.bind(this);
  return boundUsersTyping(...args);
}

Meteor.publish('users-typing', pubishUsersTyping);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"index.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/group-chat-msg/index.js                                                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  GroupChatMsg: () => GroupChatMsg,
  UsersTyping: () => UsersTyping
});
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
const GroupChatMsg = new Mongo.Collection('group-chat-msg');
const UsersTyping = new Mongo.Collection('users-typing');

if (Meteor.isServer) {
  GroupChatMsg._ensureIndex({
    meetingId: 1,
    chatId: 1
  });

  UsersTyping._ensureIndex({
    meetingId: 1,
    isTypingTo: 1
  });
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"guest-users":{"server":{"handlers":{"guestApproved.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/guest-users/server/handlers/guestApproved.js                                                            //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => handleGuestApproved
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let setGuestStatus;
module.link("../modifiers/setGuestStatus", {
  default(v) {
    setGuestStatus = v;
  }

}, 1);

function handleGuestApproved({
  body
}, meetingId) {
  const {
    approvedBy,
    guests
  } = body;
  check(meetingId, String);
  check(approvedBy, String);
  check(guests, Array);
  return guests.forEach(guest => setGuestStatus(meetingId, guest.guest, guest.status, approvedBy));
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"guestsWaitingForApproval.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/guest-users/server/handlers/guestsWaitingForApproval.js                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread"));

module.export({
  default: () => handleGuestsWaitingForApproval
});
let stringHash;
module.link("string-hash", {
  default(v) {
    stringHash = v;
  }

}, 0);
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 1);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 2);
let GuestUsers;
module.link("/imports/api/guest-users/", {
  default(v) {
    GuestUsers = v;
  }

}, 3);
const COLOR_LIST = ['#7b1fa2', '#6a1b9a', '#4a148c', '#5e35b1', '#512da8', '#4527a0', '#311b92', '#3949ab', '#303f9f', '#283593', '#1a237e', '#1976d2', '#1565c0', '#0d47a1', '#0277bd', '#01579b'];

function handleGuestsWaitingForApproval({
  body
}, meetingId) {
  const {
    guests
  } = body;
  check(guests, Array);
  check(meetingId, String);

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Adding guest user to collection: ${err}`);
    }

    const {
      insertedId
    } = numChanged;

    if (insertedId) {
      return Logger.info(`Added guest user meeting=${meetingId}`);
    }

    return Logger.info(`Upserted guest user meeting=${meetingId}`);
  };

  return guests.map(guest => GuestUsers.upsert({
    meetingId,
    intId: guest.intId
  }, (0, _objectSpread2.default)({
    approved: false,
    denied: false
  }, guest, {
    meetingId,
    loginTime: new Date().getTime(),
    color: COLOR_LIST[stringHash(guest.intId) % COLOR_LIST.length]
  }), cb));
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"methods":{"allowPendingUsers.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/guest-users/server/methods/allowPendingUsers.js                                                         //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => allowPendingUsers
});
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 1);
let RedisPubSub;
module.link("/imports/startup/server/redis", {
  default(v) {
    RedisPubSub = v;
  }

}, 2);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 3);
let extractCredentials;
module.link("/imports/api/common/server/helpers", {
  extractCredentials(v) {
    extractCredentials = v;
  }

}, 4);
const REDIS_CONFIG = Meteor.settings.private.redis;
const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
const EVENT_NAME = 'GuestsWaitingApprovedMsg';

function allowPendingUsers(guests, status) {
  const {
    meetingId,
    requesterUserId
  } = extractCredentials(this.userId);
  check(guests, Array);
  const mappedGuests = guests.map(guest => ({
    status,
    guest: guest.intId
  }));
  const payload = {
    approvedBy: requesterUserId,
    guests: mappedGuests
  };
  Logger.info(`User=${requesterUserId} ${status} guests ${JSON.stringify(mappedGuests)}`);
  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"changeGuestPolicy.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/guest-users/server/methods/changeGuestPolicy.js                                                         //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => changeGuestPolicy
});
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 1);
let RedisPubSub;
module.link("/imports/startup/server/redis", {
  default(v) {
    RedisPubSub = v;
  }

}, 2);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 3);
let extractCredentials;
module.link("/imports/api/common/server/helpers", {
  extractCredentials(v) {
    extractCredentials = v;
  }

}, 4);
const REDIS_CONFIG = Meteor.settings.private.redis;
const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
const EVENT_NAME = 'SetGuestPolicyCmdMsg';

function changeGuestPolicy(policyRule) {
  const {
    meetingId,
    requesterUserId
  } = extractCredentials(this.userId);
  check(policyRule, String);
  const payload = {
    setBy: requesterUserId,
    policy: policyRule
  };
  Logger.info(`User=${requesterUserId} change guest policy to ${policyRule}`);
  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"modifiers":{"setGuestStatus.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/guest-users/server/modifiers/setGuestStatus.js                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => setGuestStatus
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let GuestUsers;
module.link("/imports/api/guest-users", {
  default(v) {
    GuestUsers = v;
  }

}, 1);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 2);
const GUEST_STATUS_ALLOW = 'ALLOW';
const GUEST_STATUS_DENY = 'DENY';

function setGuestStatus(meetingId, intId, status, approvedBy = null) {
  check(meetingId, String);
  check(intId, String);
  check(status, String);
  const selector = {
    meetingId,
    intId
  };
  const modifier = {
    $set: {
      approved: status === GUEST_STATUS_ALLOW,
      denied: status === GUEST_STATUS_DENY,
      approvedBy
    }
  };

  const cb = err => {
    if (err) {
      return Logger.error(`Updating status=${status} user=${intId}: ${err}`);
    }

    return Logger.info(`Updated status=${status} user=${intId} meeting=${meetingId}`);
  };

  return GuestUsers.update(selector, modifier, cb);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"eventHandlers.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/guest-users/server/eventHandlers.js                                                                     //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let RedisPubSub;
module.link("/imports/startup/server/redis", {
  default(v) {
    RedisPubSub = v;
  }

}, 0);
let processForHTML5ServerOnly;
module.link("/imports/api/common/server/helpers", {
  processForHTML5ServerOnly(v) {
    processForHTML5ServerOnly = v;
  }

}, 1);
let handleGuestApproved;
module.link("./handlers/guestApproved", {
  default(v) {
    handleGuestApproved = v;
  }

}, 2);
let handleGuestsWaitingForApproval;
module.link("./handlers/guestsWaitingForApproval", {
  default(v) {
    handleGuestsWaitingForApproval = v;
  }

}, 3);
RedisPubSub.on('GuestsWaitingForApprovalEvtMsg', processForHTML5ServerOnly(handleGuestsWaitingForApproval));
RedisPubSub.on('GuestsWaitingApprovedEvtMsg', processForHTML5ServerOnly(handleGuestApproved));
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/guest-users/server/index.js                                                                             //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.link("./eventHandlers");
module.link("./methods");
module.link("./publishers");
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"methods.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/guest-users/server/methods.js                                                                           //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let allowPendingUsers;
module.link("/imports/api/guest-users/server/methods/allowPendingUsers", {
  default(v) {
    allowPendingUsers = v;
  }

}, 1);
let changeGuestPolicy;
module.link("/imports/api/guest-users/server/methods/changeGuestPolicy", {
  default(v) {
    changeGuestPolicy = v;
  }

}, 2);
Meteor.methods({
  allowPendingUsers,
  changeGuestPolicy
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"publishers.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/guest-users/server/publishers.js                                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let GuestUsers;
module.link("/imports/api/guest-users/", {
  default(v) {
    GuestUsers = v;
  }

}, 0);
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 1);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 2);
let extractCredentials;
module.link("/imports/api/common/server/helpers", {
  extractCredentials(v) {
    extractCredentials = v;
  }

}, 3);

function guestUsers() {
  if (!this.userId) {
    return GuestUsers.find({
      meetingId: ''
    });
  }

  const {
    meetingId,
    requesterUserId
  } = extractCredentials(this.userId);
  Logger.info(`Publishing Slides for ${meetingId} ${requesterUserId}`);
  return GuestUsers.find({
    meetingId
  });
}

function publish(...args) {
  const boundSlides = guestUsers.bind(this);
  return boundSlides(...args);
}

Meteor.publish('guestUser', publish);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"index.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/guest-users/index.js                                                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let Mongo;
module.link("meteor/mongo", {
  Mongo(v) {
    Mongo = v;
  }

}, 1);
const GuestUsers = new Mongo.Collection('guestUsers');
module.exportDefault(GuestUsers);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"local-settings":{"server":{"methods":{"userChangedLocalSettings.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/local-settings/server/methods/userChangedLocalSettings.js                                               //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => userChangedLocalSettings
});

let _;

module.link("lodash", {
  default(v) {
    _ = v;
  }

}, 0);
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 1);
let LocalSettings;
module.link("/imports/api/local-settings", {
  default(v) {
    LocalSettings = v;
  }

}, 2);
let setChangedLocalSettings;
module.link("../modifiers/setChangedLocalSettings", {
  default(v) {
    setChangedLocalSettings = v;
  }

}, 3);
let extractCredentials;
module.link("/imports/api/common/server/helpers", {
  extractCredentials(v) {
    extractCredentials = v;
  }

}, 4);

function userChangedLocalSettings(settings) {
  const {
    meetingId,
    requesterUserId
  } = extractCredentials(this.userId);
  if (!meetingId || !requesterUserId) return;
  check(settings, Object);
  const userLocalSettings = LocalSettings.findOne({
    meetingId,
    userId: requesterUserId
  }, {
    fields: {
      settings: 1
    }
  });

  if (!userLocalSettings || !_.isEqual(userLocalSettings.settings, settings)) {
    setChangedLocalSettings(meetingId, requesterUserId, settings);
  }
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"modifiers":{"clearLocalSettings.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/local-settings/server/modifiers/clearLocalSettings.js                                                   //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => clearLocalSettings
});
let LocalSettings;
module.link("/imports/api/local-settings", {
  default(v) {
    LocalSettings = v;
  }

}, 0);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 1);

function clearLocalSettings(meetingId) {
  return LocalSettings.remove({
    meetingId
  }, () => {
    Logger.info(`Cleared Local Settings (${meetingId})`);
  });
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"setChangedLocalSettings.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/local-settings/server/modifiers/setChangedLocalSettings.js                                              //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => setChangedLocalSettings
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let LocalSettings;
module.link("/imports/api/local-settings", {
  default(v) {
    LocalSettings = v;
  }

}, 1);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 2);

function setChangedLocalSettings(meetingId, userId, settings) {
  check(meetingId, String);
  check(userId, String);
  check(settings, Object);
  const selector = {
    meetingId,
    userId
  };
  const modifier = {
    $set: {
      settings
    }
  };

  const cb = (err, numChanged) => {
    if (err) {
      Logger.error(`${err}`);
    }

    if (numChanged) {
      Logger.info(`Updated settings for user ${userId} on meeting ${meetingId}`);
    }
  };

  return LocalSettings.upsert(selector, modifier, cb);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"index.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/local-settings/server/index.js                                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.link("./methods");
module.link("./publishers");
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"methods.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/local-settings/server/methods.js                                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let userChangedLocalSettings;
module.link("./methods/userChangedLocalSettings", {
  default(v) {
    userChangedLocalSettings = v;
  }

}, 1);
Meteor.methods({
  userChangedLocalSettings
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"publishers.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/local-settings/server/publishers.js                                                                     //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let LocalSettings;
module.link("/imports/api/local-settings", {
  default(v) {
    LocalSettings = v;
  }

}, 1);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 2);
let extractCredentials;
module.link("/imports/api/common/server/helpers", {
  extractCredentials(v) {
    extractCredentials = v;
  }

}, 3);

function localSettings() {
  if (!this.userId) {
    return LocalSettings.find({
      meetingId: ''
    });
  }

  const {
    meetingId,
    requesterUserId
  } = extractCredentials(this.userId);
  Logger.debug(`Publishing local settings for user=${requesterUserId}`);
  return LocalSettings.find({
    meetingId,
    userId: requesterUserId
  });
}

function publish(...args) {
  const boundLocalSettings = localSettings.bind(this);
  return boundLocalSettings(...args);
}

Meteor.publish('local-settings', publish);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"index.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/local-settings/index.js                                                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
const LocalSettings = new Mongo.Collection('local-settings');

if (Meteor.isServer) {
  LocalSettings._ensureIndex({
    meetingId: 1,
    userId: 1
  });
}

module.exportDefault(LocalSettings);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"log-client":{"server":{"methods":{"logClient.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/log-client/server/methods/logClient.js                                                                  //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 0);
let Users;
module.link("/imports/api/users", {
  default(v) {
    Users = v;
  }

}, 1);

const logClient = function (type, logDescription, logCode = 'was_not_provided', extraInfo = {}, userInfo = {}) {
  const connectionId = this.connection.id;
  const User = Users.findOne({
    connectionId
  });
  const logContents = {
    logCode,
    logDescription,
    connectionId,
    extraInfo,
    userInfo
  };

  if (User) {
    // TODO--
    if (userInfo.credentials && User.meetingId === userInfo.credentials.meetingId || userInfo.meetingId && User.meetingId === userInfo.meetingId) {
      logContents.extraInfo.validUser = 'valid';
    } else {
      logContents.extraInfo.validUser = 'invalid';
    }
  } else {
    logContents.extraInfo.validUser = 'notFound';
  } // If I don't pass message, logs will start with `undefined`


  Logger.log({
    message: JSON.stringify(logContents),
    level: type
  }); // Logger.log({ message: 'client->server', level: type, logContents });
};

module.exportDefault(logClient);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"index.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/log-client/server/index.js                                                                              //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.link("./methods");
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"methods.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/log-client/server/methods.js                                                                            //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let logClient;
module.link("./methods/logClient", {
  default(v) {
    logClient = v;
  }

}, 1);
Meteor.methods({
  logClient
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}},"meetings":{"server":{"handlers":{"getAllMeetings.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/meetings/server/handlers/getAllMeetings.js                                                              //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => handleGetAllMeetings
});
let handleMeetingCreation;
module.link("./meetingCreation", {
  default(v) {
    handleMeetingCreation = v;
  }

}, 0);

function handleGetAllMeetings({
  body
}) {
  return handleMeetingCreation({
    body
  });
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"meetingCreation.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/meetings/server/handlers/meetingCreation.js                                                             //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => handleMeetingCreation
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let addMeeting;
module.link("../modifiers/addMeeting", {
  default(v) {
    addMeeting = v;
  }

}, 1);

function handleMeetingCreation({
  body
}) {
  const meeting = body.props;
  const durationInSecods = meeting.durationProps.duration * 60;
  meeting.durationProps.timeRemaining = durationInSecods;
  check(meeting, Object);
  return addMeeting(meeting);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"meetingDestruction.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/meetings/server/handlers/meetingDestruction.js                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => handleMeetingDestruction
});
let RedisPubSub;
module.link("/imports/startup/server/redis", {
  default(v) {
    RedisPubSub = v;
  }

}, 0);
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 1);
let destroyExternalVideo;
module.link("/imports/api/external-videos/server/methods/destroyExternalVideo", {
  default(v) {
    destroyExternalVideo = v;
  }

}, 2);
let removeAnnotationsStreamer;
module.link("/imports/api/annotations/server/streamer", {
  removeAnnotationsStreamer(v) {
    removeAnnotationsStreamer = v;
  }

}, 3);
let removeCursorStreamer;
module.link("/imports/api/cursor/server/streamer", {
  removeCursorStreamer(v) {
    removeCursorStreamer = v;
  }

}, 4);

function handleMeetingDestruction({
  body
}) {
  check(body, Object);
  const {
    meetingId
  } = body;
  check(meetingId, String);
  destroyExternalVideo(meetingId);
  removeAnnotationsStreamer(meetingId);
  removeCursorStreamer(meetingId);
  return RedisPubSub.destroyMeetingQueue(meetingId);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"meetingEnd.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/meetings/server/handlers/meetingEnd.js                                                                  //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => handleMeetingEnd
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let meetingHasEnded;
module.link("../modifiers/meetingHasEnded", {
  default(v) {
    meetingHasEnded = v;
  }

}, 1);
let Meetings;
module.link("/imports/api/meetings", {
  default(v) {
    Meetings = v;
  }

}, 2);
let Breakouts;
module.link("/imports/api/breakouts", {
  default(v) {
    Breakouts = v;
  }

}, 3);
let Users;
module.link("/imports/api/users/", {
  default(v) {
    Users = v;
  }

}, 4);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 5);

function handleMeetingEnd({
  body
}) {
  check(body, Object);
  const {
    meetingId
  } = body;
  check(meetingId, String);

  const cb = (err, num, meetingType) => {
    if (err) {
      Logger.error(`${meetingType} ending error: ${err}`);
      return;
    }

    if (num) {
      Users.update({
        meetingId
      }, {
        $set: {
          connectionStatus: 'offline'
        }
      }, (error, numAffected) => {
        if (error) {
          Logger.error(`Error marking ending ${meetingType} users as offline: ${meetingId} ${err}`);
          return;
        }

        if (numAffected) {
          Logger.info(`Success marking ending ${meetingType} users as offline: ${meetingId}`);
        }
      });
      Meteor.setTimeout(() => {
        meetingHasEnded(meetingId);
      }, 10000);
    }
  };

  Meetings.update({
    meetingId
  }, {
    $set: {
      meetingEnded: true
    }
  }, (err, num) => {
    cb(err, num, 'Meeting');
  });
  Breakouts.update({
    parentMeetingId: meetingId
  }, {
    $set: {
      meetingEnded: true
    }
  }, (err, num) => {
    cb(err, num, 'Breakout');
  });
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"meetingLockChange.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/meetings/server/handlers/meetingLockChange.js                                                           //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => handleLockSettingsInMeeting
});
let changeLockSettings;
module.link("../modifiers/changeLockSettings", {
  default(v) {
    changeLockSettings = v;
  }

}, 0);

function handleLockSettingsInMeeting({
  body
}, meetingId) {
  return changeLockSettings(meetingId, body);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"recordingStatusChange.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/meetings/server/handlers/recordingStatusChange.js                                                       //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => handleRecordingStatusChange
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let RecordMeetings;
module.link("/imports/api/meetings", {
  RecordMeetings(v) {
    RecordMeetings = v;
  }

}, 1);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 2);

function handleRecordingStatusChange({
  body
}, meetingId) {
  const {
    recording
  } = body;
  check(recording, Boolean);
  const selector = {
    meetingId
  };
  const modifier = {
    $set: {
      recording
    }
  };

  const cb = (err, numChanged) => {
    if (err) {
      Logger.error(`Changing record status: ${err}`);
      return;
    }

    if (numChanged) {
      Logger.info(`Changed meeting record status id=${meetingId} recording=${recording}`);
    }
  };

  return RecordMeetings.upsert(selector, modifier, cb);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"recordingTimerChange.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/meetings/server/handlers/recordingTimerChange.js                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => handleRecordingStatusChange
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let RecordMeetings;
module.link("/imports/api/meetings", {
  RecordMeetings(v) {
    RecordMeetings = v;
  }

}, 1);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 2);

function handleRecordingStatusChange({
  body
}, meetingId) {
  const {
    time
  } = body;
  check(meetingId, String);
  check(body, {
    time: Number
  });
  const selector = {
    meetingId
  };
  const modifier = {
    $set: {
      time
    }
  };

  const cb = err => {
    if (err) {
      Logger.error(`Changing recording time: ${err}`);
    }
  };

  return RecordMeetings.upsert(selector, modifier, cb);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"timeRemainingUpdate.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/meetings/server/handlers/timeRemainingUpdate.js                                                         //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => handleTimeRemainingUpdate
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let MeetingTimeRemaining;
module.link("/imports/api/meetings", {
  MeetingTimeRemaining(v) {
    MeetingTimeRemaining = v;
  }

}, 1);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 2);

function handleTimeRemainingUpdate({
  body
}, meetingId) {
  check(meetingId, String);
  check(body, {
    timeLeftInSec: Number
  });
  const {
    timeLeftInSec
  } = body;
  const selector = {
    meetingId
  };
  const modifier = {
    $set: {
      timeRemaining: timeLeftInSec
    }
  };

  const cb = err => {
    if (err) {
      Logger.error(`Changing recording time: ${err}`);
    }
  };

  return MeetingTimeRemaining.upsert(selector, modifier, cb);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"userLockChange.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/meetings/server/handlers/userLockChange.js                                                              //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => handleLockSettingsInMeeting
});
let changeUserLock;
module.link("../modifiers/changeUserLock", {
  default(v) {
    changeUserLock = v;
  }

}, 0);

function handleLockSettingsInMeeting({
  body
}, meetingId) {
  return changeUserLock(meetingId, body);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"webcamOnlyModerator.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/meetings/server/handlers/webcamOnlyModerator.js                                                         //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => handleChangeWebcamOnlyModerator
});
let changeWebcamOnlyModerator;
module.link("../modifiers/webcamOnlyModerator", {
  default(v) {
    changeWebcamOnlyModerator = v;
  }

}, 0);

function handleChangeWebcamOnlyModerator({
  body
}, meetingId) {
  return changeWebcamOnlyModerator(meetingId, body);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"methods":{"endMeeting.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/meetings/server/methods/endMeeting.js                                                                   //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => endMeeting
});
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let RedisPubSub;
module.link("/imports/startup/server/redis", {
  default(v) {
    RedisPubSub = v;
  }

}, 1);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 2);
let extractCredentials;
module.link("/imports/api/common/server/helpers", {
  extractCredentials(v) {
    extractCredentials = v;
  }

}, 3);

function endMeeting() {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'LogoutAndEndMeetingCmdMsg';
  const {
    meetingId,
    requesterUserId
  } = extractCredentials(this.userId);
  const payload = {
    userId: requesterUserId
  };
  Logger.verbose(`Meeting '${meetingId}' is destroyed by '${requesterUserId}'`);
  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"toggleLockSettings.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/meetings/server/methods/toggleLockSettings.js                                                           //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => toggleLockSettings
});
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 1);
let RedisPubSub;
module.link("/imports/startup/server/redis", {
  default(v) {
    RedisPubSub = v;
  }

}, 2);
let extractCredentials;
module.link("/imports/api/common/server/helpers", {
  extractCredentials(v) {
    extractCredentials = v;
  }

}, 3);

function toggleLockSettings(lockSettingsProps) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'ChangeLockSettingsInMeetingCmdMsg';
  const {
    meetingId,
    requesterUserId
  } = extractCredentials(this.userId);
  check(lockSettingsProps, {
    disableCam: Boolean,
    disableMic: Boolean,
    disablePrivateChat: Boolean,
    disablePublicChat: Boolean,
    disableNote: Boolean,
    hideUserList: Boolean,
    lockedLayout: Boolean,
    lockOnJoin: Boolean,
    lockOnJoinConfigurable: Boolean,
    setBy: Match.Maybe(String)
  });
  const {
    disableCam,
    disableMic,
    disablePrivateChat: disablePrivChat,
    disablePublicChat: disablePubChat,
    disableNote,
    hideUserList,
    lockedLayout,
    lockOnJoin,
    lockOnJoinConfigurable
  } = lockSettingsProps;
  const payload = {
    disableCam,
    disableMic,
    disablePrivChat,
    disablePubChat,
    disableNote,
    hideUserList,
    lockedLayout,
    lockOnJoin,
    lockOnJoinConfigurable,
    setBy: requesterUserId
  };
  RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"toggleRecording.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/meetings/server/methods/toggleRecording.js                                                              //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => toggleRecording
});
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 0);
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 1);
let RedisPubSub;
module.link("/imports/startup/server/redis", {
  default(v) {
    RedisPubSub = v;
  }

}, 2);
let RecordMeetings;
module.link("/imports/api/meetings", {
  RecordMeetings(v) {
    RecordMeetings = v;
  }

}, 3);
let Users;
module.link("/imports/api/users", {
  default(v) {
    Users = v;
  }

}, 4);
let extractCredentials;
module.link("/imports/api/common/server/helpers", {
  extractCredentials(v) {
    extractCredentials = v;
  }

}, 5);

function toggleRecording() {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;
  const {
    meetingId,
    requesterUserId
  } = extractCredentials(this.userId);
  const EVENT_NAME = 'SetRecordingStatusCmdMsg';
  let meetingRecorded;
  let allowedToRecord;
  const recordObject = RecordMeetings.findOne({
    meetingId
  });

  if (recordObject != null) {
    const {
      allowStartStopRecording,
      recording,
      record
    } = recordObject;
    meetingRecorded = recording;
    allowedToRecord = record && allowStartStopRecording; // TODO-- remove some day
  }

  const payload = {
    recording: !meetingRecorded,
    setBy: requesterUserId
  };
  const selector = {
    meetingId,
    userId: requesterUserId
  };
  const user = Users.findOne(selector);

  if (allowedToRecord && !!user && user.role === ROLE_MODERATOR) {
    Logger.info(`Setting the record parameter to ${!meetingRecorded} for ${meetingId} by ${requesterUserId}`);
    return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
  }

  return null;
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"toggleWebcamsOnlyForModerator.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/meetings/server/methods/toggleWebcamsOnlyForModerator.js                                                //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => toggleWebcamsOnlyForModerator
});
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 1);
let RedisPubSub;
module.link("/imports/startup/server/redis", {
  default(v) {
    RedisPubSub = v;
  }

}, 2);
let extractCredentials;
module.link("../../../common/server/helpers", {
  extractCredentials(v) {
    extractCredentials = v;
  }

}, 3);

function toggleWebcamsOnlyForModerator(webcamsOnlyForModerator) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'UpdateWebcamsOnlyForModeratorCmdMsg';
  const {
    meetingId,
    requesterUserId
  } = extractCredentials(this.userId);
  check(webcamsOnlyForModerator, Boolean);
  const payload = {
    webcamsOnlyForModerator,
    setBy: requesterUserId
  };
  RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"transferUser.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/meetings/server/methods/transferUser.js                                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => transferUser
});
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let RedisPubSub;
module.link("/imports/startup/server/redis", {
  default(v) {
    RedisPubSub = v;
  }

}, 1);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 2);
let extractCredentials;
module.link("/imports/api/common/server/helpers", {
  extractCredentials(v) {
    extractCredentials = v;
  }

}, 3);

function transferUser(fromMeetingId, toMeetingId) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'TransferUserToMeetingRequestMsg';
  const {
    meetingId,
    requesterUserId
  } = extractCredentials(this.userId);
  const payload = {
    fromMeetingId,
    toMeetingId,
    userId: requesterUserId
  };
  Logger.verbose(`userId ${requesterUserId} was transferred from 
  meeting ${fromMeetingId}' to meeting '${toMeetingId}`);
  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"modifiers":{"addMeeting.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/meetings/server/modifiers/addMeeting.js                                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

module.export({
  default: () => addMeeting
});
let flat;
module.link("flat", {
  default(v) {
    flat = v;
  }

}, 0);
let check, Match;
module.link("meteor/check", {
  check(v) {
    check = v;
  },

  Match(v) {
    Match = v;
  }

}, 1);
let Meetings, RecordMeetings;
module.link("/imports/api/meetings", {
  default(v) {
    Meetings = v;
  },

  RecordMeetings(v) {
    RecordMeetings = v;
  }

}, 2);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 3);
let createNote;
module.link("/imports/api/note/server/methods/createNote", {
  default(v) {
    createNote = v;
  }

}, 4);
let createCaptions;
module.link("/imports/api/captions/server/methods/createCaptions", {
  default(v) {
    createCaptions = v;
  }

}, 5);
let addAnnotationsStreamer;
module.link("/imports/api/annotations/server/streamer", {
  addAnnotationsStreamer(v) {
    addAnnotationsStreamer = v;
  }

}, 6);
let addCursorStreamer;
module.link("/imports/api/cursor/server/streamer", {
  addCursorStreamer(v) {
    addCursorStreamer = v;
  }

}, 7);

function addMeeting(meeting) {
  const meetingId = meeting.meetingProp.intId;
  check(meetingId, String);
  check(meeting, {
    breakoutProps: {
      sequence: Number,
      freeJoin: Boolean,
      breakoutRooms: Array,
      parentId: String,
      enabled: Boolean,
      record: Boolean,
      privateChatEnabled: Boolean
    },
    meetingProp: {
      intId: String,
      extId: String,
      isBreakout: Boolean,
      name: String
    },
    usersProp: {
      webcamsOnlyForModerator: Boolean,
      guestPolicy: String,
      maxUsers: Number,
      allowModsToUnmuteUsers: Boolean
    },
    durationProps: {
      createdTime: Number,
      duration: Number,
      createdDate: String,
      maxInactivityTimeoutMinutes: Number,
      warnMinutesBeforeMax: Number,
      meetingExpireIfNoUserJoinedInMinutes: Number,
      meetingExpireWhenLastUserLeftInMinutes: Number,
      userInactivityInspectTimerInMinutes: Number,
      userInactivityThresholdInMinutes: Number,
      userActivitySignResponseDelayInMinutes: Number,
      timeRemaining: Number
    },
    welcomeProp: {
      welcomeMsg: String,
      modOnlyMessage: String,
      welcomeMsgTemplate: String
    },
    recordProp: Match.ObjectIncluding({
      allowStartStopRecording: Boolean,
      autoStartRecording: Boolean,
      record: Boolean
    }),
    password: {
      viewerPass: String,
      moderatorPass: String
    },
    voiceProp: {
      voiceConf: String,
      dialNumber: String,
      telVoice: String,
      muteOnStart: Boolean
    },
    screenshareProps: {
      red5ScreenshareIp: String,
      red5ScreenshareApp: String,
      screenshareConf: String
    },
    metadataProp: Object,
    lockSettingsProps: {
      disableCam: Boolean,
      disableMic: Boolean,
      disablePrivateChat: Boolean,
      disablePublicChat: Boolean,
      disableNote: Boolean,
      hideUserList: Boolean,
      lockOnJoin: Boolean,
      lockOnJoinConfigurable: Boolean,
      lockedLayout: Boolean
    }
  });
  const {
    recordProp
  } = meeting,
        restProps = (0, _objectWithoutProperties2.default)(meeting, ["recordProp"]);
  const newMeeting = restProps;
  const selector = {
    meetingId
  };
  newMeeting.lockSettingsProps = Object.assign(meeting.lockSettingsProps, {
    setBy: 'temp'
  });
  const meetingEnded = false;
  newMeeting.welcomeProp.welcomeMsg = newMeeting.welcomeProp.welcomeMsg.replace('href="event:', 'href="');

  const insertBlankTarget = (s, i) => `${s.substr(0, i)} target="_blank"${s.substr(i)}`;

  const linkWithoutTarget = new RegExp('<a href="(.*?)">', 'g');
  linkWithoutTarget.test(newMeeting.welcomeProp.welcomeMsg);

  if (linkWithoutTarget.lastIndex > 0) {
    newMeeting.welcomeProp.welcomeMsg = insertBlankTarget(newMeeting.welcomeProp.welcomeMsg, linkWithoutTarget.lastIndex - 1);
  }

  const modifier = {
    $set: Object.assign({
      meetingId,
      meetingEnded,
      publishedPoll: false
    }, flat(newMeeting, {
      safe: true
    }))
  };

  const cb = (err, numChanged) => {
    if (err) {
      Logger.error(`Adding meeting to collection: ${err}`);
      return;
    }

    const {
      insertedId
    } = numChanged;

    if (insertedId) {
      Logger.info(`Added meeting id=${meetingId}`); // TODO: Here we call Etherpad API to create this meeting notes. Is there a
      // better place we can run this post-creation routine?

      createNote(meetingId);
      createCaptions(meetingId);
    }

    if (numChanged) {
      Logger.info(`Upserted meeting id=${meetingId}`);
    }
  };

  const cbRecord = (err, numChanged) => {
    if (err) {
      Logger.error(`Adding record prop to collection: ${err}`);
      return;
    }

    const {
      insertedId
    } = numChanged;

    if (insertedId) {
      Logger.info(`Added record prop id=${meetingId}`);
    }

    if (numChanged) {
      Logger.info(`Upserted record prop id=${meetingId}`);
    }
  };

  RecordMeetings.upsert(selector, (0, _objectSpread2.default)({
    meetingId
  }, recordProp), cbRecord);
  addAnnotationsStreamer(meetingId);
  addCursorStreamer(meetingId);
  return Meetings.upsert(selector, modifier, cb);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"changeLockSettings.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/meetings/server/modifiers/changeLockSettings.js                                                         //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => changeLockSettings
});
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 0);
let Meetings;
module.link("/imports/api/meetings", {
  default(v) {
    Meetings = v;
  }

}, 1);
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 2);

function changeLockSettings(meetingId, payload) {
  check(meetingId, String);
  check(payload, {
    disableCam: Boolean,
    disableMic: Boolean,
    disablePrivChat: Boolean,
    disablePubChat: Boolean,
    disableNote: Boolean,
    hideUserList: Boolean,
    lockedLayout: Boolean,
    lockOnJoin: Boolean,
    lockOnJoinConfigurable: Boolean,
    setBy: Match.Maybe(String)
  });
  const {
    disableCam,
    disableMic,
    disablePrivChat,
    disablePubChat,
    disableNote,
    hideUserList,
    lockedLayout,
    lockOnJoin,
    lockOnJoinConfigurable,
    setBy
  } = payload;
  const selector = {
    meetingId
  };
  const modifier = {
    $set: {
      lockSettingsProps: {
        disableCam,
        disableMic,
        disablePrivateChat: disablePrivChat,
        disablePublicChat: disablePubChat,
        disableNote,
        hideUserList,
        lockedLayout,
        lockOnJoin,
        lockOnJoinConfigurable,
        setBy
      }
    }
  };

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Changing meeting={${meetingId}} lock settings: ${err}`);
    }

    if (!numChanged) {
      return Logger.info(`meeting={${meetingId}} lock settings were not updated`);
    }

    return Logger.info(`Changed meeting={${meetingId}} updated lock settings`);
  };

  return Meetings.upsert(selector, modifier, cb);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"changeUserLock.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/meetings/server/modifiers/changeUserLock.js                                                             //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => changeUserLock
});
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 0);
let Users;
module.link("/imports/api/users", {
  default(v) {
    Users = v;
  }

}, 1);
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 2);

function changeUserLock(meetingId, payload) {
  check(meetingId, String);
  check(payload, {
    userId: String,
    locked: Boolean,
    lockedBy: String
  });
  const {
    userId,
    locked,
    lockedBy
  } = payload;
  const selector = {
    meetingId,
    userId
  };
  const modifier = {
    $set: {
      locked
    }
  };

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Changing user lock setting: ${err}`);
    }

    if (!numChanged) {
      return Logger.info(`User's userId=${userId} lock status wasn't updated`);
    }

    return Logger.info(`User's userId=${userId} lock status was changed to: ${locked} by user userId=${lockedBy}`);
  };

  return Users.update(selector, modifier, cb);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"clearRecordMeeting.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/meetings/server/modifiers/clearRecordMeeting.js                                                         //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => meetingHasEnded
});
let RecordMeetings;
module.link("/imports/api/meetings", {
  RecordMeetings(v) {
    RecordMeetings = v;
  }

}, 0);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 1);

function meetingHasEnded(meetingId) {
  return RecordMeetings.remove({
    meetingId
  }, () => Logger.info(`Cleared record prop from meeting with id ${meetingId}`));
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"meetingHasEnded.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/meetings/server/modifiers/meetingHasEnded.js                                                            //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => meetingHasEnded
});
let Meetings;
module.link("/imports/api/meetings", {
  default(v) {
    Meetings = v;
  }

}, 0);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 1);
let removeAnnotationsStreamer;
module.link("/imports/api/annotations/server/streamer", {
  removeAnnotationsStreamer(v) {
    removeAnnotationsStreamer = v;
  }

}, 2);
let removeCursorStreamer;
module.link("/imports/api/cursor/server/streamer", {
  removeCursorStreamer(v) {
    removeCursorStreamer = v;
  }

}, 3);
let clearUsers;
module.link("/imports/api/users/server/modifiers/clearUsers", {
  default(v) {
    clearUsers = v;
  }

}, 4);
let clearUsersSettings;
module.link("/imports/api/users-settings/server/modifiers/clearUsersSettings", {
  default(v) {
    clearUsersSettings = v;
  }

}, 5);
let clearGroupChat;
module.link("/imports/api/group-chat/server/modifiers/clearGroupChat", {
  default(v) {
    clearGroupChat = v;
  }

}, 6);
let clearBreakouts;
module.link("/imports/api/breakouts/server/modifiers/clearBreakouts", {
  default(v) {
    clearBreakouts = v;
  }

}, 7);
let clearAnnotations;
module.link("/imports/api/annotations/server/modifiers/clearAnnotations", {
  default(v) {
    clearAnnotations = v;
  }

}, 8);
let clearSlides;
module.link("/imports/api/slides/server/modifiers/clearSlides", {
  default(v) {
    clearSlides = v;
  }

}, 9);
let clearPolls;
module.link("/imports/api/polls/server/modifiers/clearPolls", {
  default(v) {
    clearPolls = v;
  }

}, 10);
let clearCaptions;
module.link("/imports/api/captions/server/modifiers/clearCaptions", {
  default(v) {
    clearCaptions = v;
  }

}, 11);
let clearPresentationPods;
module.link("/imports/api/presentation-pods/server/modifiers/clearPresentationPods", {
  default(v) {
    clearPresentationPods = v;
  }

}, 12);
let clearVoiceUsers;
module.link("/imports/api/voice-users/server/modifiers/clearVoiceUsers", {
  default(v) {
    clearVoiceUsers = v;
  }

}, 13);
let clearUserInfo;
module.link("/imports/api/users-infos/server/modifiers/clearUserInfo", {
  default(v) {
    clearUserInfo = v;
  }

}, 14);
let clearNote;
module.link("/imports/api/note/server/modifiers/clearNote", {
  default(v) {
    clearNote = v;
  }

}, 15);
let clearNetworkInformation;
module.link("/imports/api/network-information/server/modifiers/clearNetworkInformation", {
  default(v) {
    clearNetworkInformation = v;
  }

}, 16);
let clearLocalSettings;
module.link("/imports/api/local-settings/server/modifiers/clearLocalSettings", {
  default(v) {
    clearLocalSettings = v;
  }

}, 17);
let clearRecordMeeting;
module.link("./clearRecordMeeting", {
  default(v) {
    clearRecordMeeting = v;
  }

}, 18);
let clearVoiceCallStates;
module.link("/imports/api/voice-call-states/server/modifiers/clearVoiceCallStates", {
  default(v) {
    clearVoiceCallStates = v;
  }

}, 19);

function meetingHasEnded(meetingId) {
  removeAnnotationsStreamer(meetingId);
  removeCursorStreamer(meetingId);
  return Meetings.remove({
    meetingId
  }, () => {
    clearCaptions(meetingId);
    clearGroupChat(meetingId);
    clearPresentationPods(meetingId);
    clearBreakouts(meetingId);
    clearPolls(meetingId);
    clearAnnotations(meetingId);
    clearSlides(meetingId);
    clearUsers(meetingId);
    clearUsersSettings(meetingId);
    clearVoiceUsers(meetingId);
    clearUserInfo(meetingId);
    clearNote(meetingId);
    clearNetworkInformation(meetingId);
    clearLocalSettings(meetingId);
    clearRecordMeeting(meetingId);
    clearVoiceCallStates(meetingId);
    return Logger.info(`Cleared Meetings with id ${meetingId}`);
  });
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"setPublishedPoll.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/meetings/server/modifiers/setPublishedPoll.js                                                           //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => setPublishedPoll
});
let Meetings;
module.link("/imports/api/meetings", {
  default(v) {
    Meetings = v;
  }

}, 0);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 1);
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 2);

function setPublishedPoll(meetingId, isPublished) {
  check(meetingId, String);
  check(isPublished, Boolean);
  const selector = {
    meetingId
  };
  const modifier = {
    $set: {
      publishedPoll: isPublished
    }
  };

  const cb = err => {
    if (err != null) {
      return Logger.error(`Setting publishedPoll=${isPublished} for meetingId=${meetingId}`);
    }

    return Logger.info(`Set publishedPoll=${isPublished} in meeitingId=${meetingId}`);
  };

  return Meetings.upsert(selector, modifier, cb);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"webcamOnlyModerator.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/meetings/server/modifiers/webcamOnlyModerator.js                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => changeWebcamOnlyModerator
});
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 0);
let Meetings;
module.link("/imports/api/meetings", {
  default(v) {
    Meetings = v;
  }

}, 1);
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 2);

function changeWebcamOnlyModerator(meetingId, payload) {
  check(meetingId, String);
  check(payload, {
    webcamsOnlyForModerator: Boolean,
    setBy: String
  });
  const {
    webcamsOnlyForModerator
  } = payload;
  const selector = {
    meetingId
  };
  const modifier = {
    $set: {
      'usersProp.webcamsOnlyForModerator': webcamsOnlyForModerator
    }
  };

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Changwing meeting={${meetingId}} webcam Only for Moderator: ${err}`);
    }

    if (!numChanged) {
      return Logger.info(`meeting={${meetingId}} webcam Only for Moderator were not updated`);
    }

    return Logger.info(`Changed meeting={${meetingId}} updated webcam Only for Moderator`);
  };

  return Meetings.upsert(selector, modifier, cb);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"eventHandlers.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/meetings/server/eventHandlers.js                                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let RedisPubSub;
module.link("/imports/startup/server/redis", {
  default(v) {
    RedisPubSub = v;
  }

}, 0);
let handleMeetingCreation;
module.link("./handlers/meetingCreation", {
  default(v) {
    handleMeetingCreation = v;
  }

}, 1);
let handleGetAllMeetings;
module.link("./handlers/getAllMeetings", {
  default(v) {
    handleGetAllMeetings = v;
  }

}, 2);
let handleMeetingEnd;
module.link("./handlers/meetingEnd", {
  default(v) {
    handleMeetingEnd = v;
  }

}, 3);
let handleMeetingDestruction;
module.link("./handlers/meetingDestruction", {
  default(v) {
    handleMeetingDestruction = v;
  }

}, 4);
let handleMeetingLocksChange;
module.link("./handlers/meetingLockChange", {
  default(v) {
    handleMeetingLocksChange = v;
  }

}, 5);
let handleUserLockChange;
module.link("./handlers/userLockChange", {
  default(v) {
    handleUserLockChange = v;
  }

}, 6);
let handleRecordingStatusChange;
module.link("./handlers/recordingStatusChange", {
  default(v) {
    handleRecordingStatusChange = v;
  }

}, 7);
let handleRecordingTimerChange;
module.link("./handlers/recordingTimerChange", {
  default(v) {
    handleRecordingTimerChange = v;
  }

}, 8);
let handleTimeRemainingUpdate;
module.link("./handlers/timeRemainingUpdate", {
  default(v) {
    handleTimeRemainingUpdate = v;
  }

}, 9);
let handleChangeWebcamOnlyModerator;
module.link("./handlers/webcamOnlyModerator", {
  default(v) {
    handleChangeWebcamOnlyModerator = v;
  }

}, 10);
RedisPubSub.on('MeetingCreatedEvtMsg', handleMeetingCreation);
RedisPubSub.on('SyncGetMeetingInfoRespMsg', handleGetAllMeetings);
RedisPubSub.on('MeetingEndingEvtMsg', handleMeetingEnd);
RedisPubSub.on('MeetingDestroyedEvtMsg', handleMeetingDestruction);
RedisPubSub.on('LockSettingsInMeetingChangedEvtMsg', handleMeetingLocksChange);
RedisPubSub.on('UserLockedInMeetingEvtMsg', handleUserLockChange);
RedisPubSub.on('RecordingStatusChangedEvtMsg', handleRecordingStatusChange);
RedisPubSub.on('UpdateRecordingTimerEvtMsg', handleRecordingTimerChange);
RedisPubSub.on('WebcamsOnlyForModeratorChangedEvtMsg', handleChangeWebcamOnlyModerator);
RedisPubSub.on('GetLockSettingsRespMsg', handleMeetingLocksChange);
RedisPubSub.on('MeetingTimeRemainingUpdateEvtMsg', handleTimeRemainingUpdate);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/meetings/server/index.js                                                                                //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.link("./eventHandlers");
module.link("./methods");
module.link("./publishers");
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"methods.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/meetings/server/methods.js                                                                              //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let endMeeting;
module.link("./methods/endMeeting", {
  default(v) {
    endMeeting = v;
  }

}, 1);
let toggleRecording;
module.link("./methods/toggleRecording", {
  default(v) {
    toggleRecording = v;
  }

}, 2);
let transferUser;
module.link("./methods/transferUser", {
  default(v) {
    transferUser = v;
  }

}, 3);
let toggleLockSettings;
module.link("./methods/toggleLockSettings", {
  default(v) {
    toggleLockSettings = v;
  }

}, 4);
let toggleWebcamsOnlyForModerator;
module.link("./methods/toggleWebcamsOnlyForModerator", {
  default(v) {
    toggleWebcamsOnlyForModerator = v;
  }

}, 5);
Meteor.methods({
  endMeeting,
  toggleRecording,
  toggleLockSettings,
  transferUser,
  toggleWebcamsOnlyForModerator
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"publishers.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/meetings/server/publishers.js                                                                           //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let Meetings, RecordMeetings, MeetingTimeRemaining;
module.link("/imports/api/meetings", {
  default(v) {
    Meetings = v;
  },

  RecordMeetings(v) {
    RecordMeetings = v;
  },

  MeetingTimeRemaining(v) {
    MeetingTimeRemaining = v;
  }

}, 1);
let Users;
module.link("/imports/api/users", {
  default(v) {
    Users = v;
  }

}, 2);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 3);
let extractCredentials;
module.link("/imports/api/common/server/helpers", {
  extractCredentials(v) {
    extractCredentials = v;
  }

}, 4);
const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;

function meetings(isModerator = false) {
  if (!this.userId) {
    return Meetings.find({
      meetingId: ''
    });
  }

  const {
    meetingId,
    requesterUserId
  } = extractCredentials(this.userId);
  Logger.debug(`Publishing meeting =${meetingId} ${requesterUserId}`);
  const selector = {
    $or: [{
      meetingId
    }]
  };

  if (isModerator) {
    const User = Users.findOne({
      userId: requesterUserId,
      meetingId
    });

    if (!!User && User.role === ROLE_MODERATOR) {
      selector.$or.push({
        'meetingProp.isBreakout': true,
        'breakoutProps.parentId': meetingId
      });
    }
  }

  const options = {
    fields: {
      password: false
    }
  };
  return Meetings.find(selector, options);
}

function publish(...args) {
  const boundMeetings = meetings.bind(this);
  return boundMeetings(...args);
}

Meteor.publish('meetings', publish);

function recordMeetings() {
  if (!this.userId) {
    return RecordMeetings.find({
      meetingId: ''
    });
  }

  const {
    meetingId
  } = extractCredentials(this.userId);
  return RecordMeetings.find({
    meetingId
  });
}

function recordPublish(...args) {
  const boundRecordMeetings = recordMeetings.bind(this);
  return boundRecordMeetings(...args);
}

Meteor.publish('record-meetings', recordPublish);

function meetingTimeRemaining() {
  if (!this.userId) {
    return MeetingTimeRemaining.find({
      meetingId: ''
    });
  }

  const {
    meetingId
  } = extractCredentials(this.userId);
  return MeetingTimeRemaining.find({
    meetingId
  });
}

function timeRemainingPublish(...args) {
  const boundtimeRemaining = meetingTimeRemaining.bind(this);
  return boundtimeRemaining(...args);
}

Meteor.publish('meeting-time-remaining', timeRemainingPublish);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"index.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/meetings/index.js                                                                                       //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  RecordMeetings: () => RecordMeetings,
  MeetingTimeRemaining: () => MeetingTimeRemaining
});
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
const Meetings = new Mongo.Collection('meetings');
const RecordMeetings = new Mongo.Collection('record-meetings');
const MeetingTimeRemaining = new Mongo.Collection('meeting-time-remaining');

if (Meteor.isServer) {
  // types of queries for the meetings:
  // 1. meetingId
  Meetings._ensureIndex({
    meetingId: 1
  });

  RecordMeetings._ensureIndex({
    meetingId: 1
  });

  MeetingTimeRemaining._ensureIndex({
    meetingId: 1
  });
}

module.exportDefault(Meetings);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"network-information":{"server":{"methods":{"userInstabilityDetected.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/network-information/server/methods/userInstabilityDetected.js                                           //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => userInstabilityDetected
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let NetworkInformation;
module.link("/imports/api/network-information", {
  default(v) {
    NetworkInformation = v;
  }

}, 1);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 2);
let extractCredentials;
module.link("/imports/api/common/server/helpers", {
  extractCredentials(v) {
    extractCredentials = v;
  }

}, 3);

function userInstabilityDetected(sender) {
  const {
    meetingId,
    requesterUserId: receiver
  } = extractCredentials(this.userId);
  check(sender, String);
  const payload = {
    time: new Date().getTime(),
    meetingId,
    receiver,
    sender
  };
  Logger.debug(`Receiver ${receiver} reported a network instability in meeting ${meetingId}`);
  return NetworkInformation.insert(payload);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"modifiers":{"clearNetworkInformation.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/network-information/server/modifiers/clearNetworkInformation.js                                         //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => clearNetworkInformation
});
let NetworkInformation;
module.link("/imports/api/network-information", {
  default(v) {
    NetworkInformation = v;
  }

}, 0);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 1);

function clearNetworkInformation(meetingId) {
  if (meetingId) {
    return NetworkInformation.remove({
      meetingId
    }, () => {
      Logger.info(`Cleared Network Information (${meetingId})`);
    });
  }

  return NetworkInformation.remove({}, () => {
    Logger.info('Cleared Network Information (all)');
  });
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"index.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/network-information/server/index.js                                                                     //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.link("./methods");
module.link("./publisher");
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"methods.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/network-information/server/methods.js                                                                   //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let userInstabilityDetected;
module.link("./methods/userInstabilityDetected", {
  default(v) {
    userInstabilityDetected = v;
  }

}, 1);
Meteor.methods({
  userInstabilityDetected
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"publisher.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/network-information/server/publisher.js                                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let NetworkInformation;
module.link("/imports/api/network-information", {
  default(v) {
    NetworkInformation = v;
  }

}, 1);
let extractCredentials;
module.link("/imports/api/common/server/helpers", {
  extractCredentials(v) {
    extractCredentials = v;
  }

}, 2);

function networkInformation() {
  if (!this.userId) {
    return NetworkInformation.find({
      meetingId: ''
    });
  }

  const {
    meetingId
  } = extractCredentials(this.userId);
  return NetworkInformation.find({
    meetingId
  });
}

function publish(...args) {
  const boundNetworkInformation = networkInformation.bind(this);
  return boundNetworkInformation(...args);
}

Meteor.publish('network-information', publish);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"index.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/network-information/index.js                                                                            //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
const NetworkInformation = new Mongo.Collection('network-information');

if (Meteor.isServer) {
  NetworkInformation._ensureIndex({
    meetingId: 1
  });
}

module.exportDefault(NetworkInformation);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"note":{"server":{"handlers":{"padUpdate.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/note/server/handlers/padUpdate.js                                                                       //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => handlePadUpdate
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let updateNote;
module.link("/imports/api/note/server/modifiers/updateNote", {
  default(v) {
    updateNote = v;
  }

}, 1);

function handlePadUpdate({
  body
}) {
  const {
    pad,
    revs
  } = body;
  const {
    id
  } = pad;
  check(id, String);
  check(revs, Number);
  updateNote(id, revs);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"methods":{"createNote.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/note/server/methods/createNote.js                                                                       //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => createNote
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 1);
let generateNoteId, createPadURL, getReadOnlyIdURL, isEnabled, getDataFromResponse;
module.link("/imports/api/note/server/helpers", {
  generateNoteId(v) {
    generateNoteId = v;
  },

  createPadURL(v) {
    createPadURL = v;
  },

  getReadOnlyIdURL(v) {
    getReadOnlyIdURL = v;
  },

  isEnabled(v) {
    isEnabled = v;
  },

  getDataFromResponse(v) {
    getDataFromResponse = v;
  }

}, 2);
let addNote;
module.link("/imports/api/note/server/modifiers/addNote", {
  default(v) {
    addNote = v;
  }

}, 3);
let axios;
module.link("axios", {
  default(v) {
    axios = v;
  }

}, 4);

function createNote(meetingId) {
  // Avoid note creation if this feature is disabled
  if (!isEnabled()) {
    Logger.warn(`Notes are disabled for ${meetingId}`);
    return;
  }

  check(meetingId, String);
  const noteId = generateNoteId(meetingId);
  const createURL = createPadURL(noteId);
  axios({
    method: 'get',
    url: createURL,
    responseType: 'json'
  }).then(responseOuter => {
    const {
      status
    } = responseOuter;

    if (status !== 200) {
      Logger.error(`Could not get note info for ${meetingId} ${status}`);
    }

    const readOnlyURL = getReadOnlyIdURL(noteId);
    axios({
      method: 'get',
      url: readOnlyURL,
      responseType: 'json'
    }).then(response => {
      const readOnlyNoteId = getDataFromResponse(response.data, 'readOnlyID');

      if (readOnlyNoteId) {
        addNote(meetingId, noteId, readOnlyNoteId);
      } else {
        Logger.error(`Could not get note readOnlyID for ${meetingId}`);
      }
    }).catch(error => Logger.error(`Could not get note readOnlyID for ${meetingId}: ${error}`));
  }).catch(error => Logger.error(`Could not create note for ${meetingId}: ${error}`));
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"modifiers":{"addNote.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/note/server/modifiers/addNote.js                                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => addNote
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let Note;
module.link("/imports/api/note", {
  default(v) {
    Note = v;
  }

}, 1);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 2);

function addNote(meetingId, noteId, readOnlyNoteId) {
  check(meetingId, String);
  check(noteId, String);
  check(readOnlyNoteId, String);
  const selector = {
    meetingId,
    noteId
  };
  const modifier = {
    meetingId,
    noteId,
    readOnlyNoteId,
    revs: 0
  };

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Adding note to the collection: ${err}`);
    }

    if (numChanged) {
      return Logger.info(`Added note id=${noteId} readOnlyId=${readOnlyNoteId} meeting=${meetingId}`);
    }

    return Logger.info(`Upserted note id=${noteId} readOnlyId=${readOnlyNoteId} meeting=${meetingId}`);
  };

  return Note.upsert(selector, modifier, cb);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"clearNote.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/note/server/modifiers/clearNote.js                                                                      //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => clearNote
});
let Note;
module.link("/imports/api/note", {
  default(v) {
    Note = v;
  }

}, 0);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 1);

function clearNote(meetingId) {
  if (meetingId) {
    return Note.remove({
      meetingId
    }, () => {
      Logger.info(`Cleared Note (${meetingId})`);
    });
  }

  return Note.remove({}, () => {
    Logger.info('Cleared Note (all)');
  });
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"updateNote.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/note/server/modifiers/updateNote.js                                                                     //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => updateNote
});
let Note;
module.link("/imports/api/note", {
  default(v) {
    Note = v;
  }

}, 0);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 1);
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 2);

function updateNote(noteId, revs) {
  check(noteId, String);
  check(revs, Number);
  const selector = {
    noteId
  };
  const modifier = {
    $set: {
      revs
    }
  };

  const cb = err => {
    if (err) {
      return Logger.error(`Updating note pad: ${err}`);
    }

    return Logger.verbose(`Update note pad=${noteId} revs=${revs}`);
  };

  return Note.update(selector, modifier, {
    multi: true
  }, cb);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"eventHandlers.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/note/server/eventHandlers.js                                                                            //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let RedisPubSub;
module.link("/imports/startup/server/redis", {
  default(v) {
    RedisPubSub = v;
  }

}, 0);
let processForNotePadOnly;
module.link("/imports/api/note/server/helpers", {
  processForNotePadOnly(v) {
    processForNotePadOnly = v;
  }

}, 1);
let handlePadUpdate;
module.link("./handlers/padUpdate", {
  default(v) {
    handlePadUpdate = v;
  }

}, 2);
RedisPubSub.on('PadUpdateSysMsg', processForNotePadOnly(handlePadUpdate));
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"helpers.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/note/server/helpers.js                                                                                  //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  generateNoteId: () => generateNoteId,
  createPadURL: () => createPadURL,
  getReadOnlyIdURL: () => getReadOnlyIdURL,
  isEnabled: () => isEnabled,
  getDataFromResponse: () => getDataFromResponse,
  appendTextURL: () => appendTextURL,
  processForNotePadOnly: () => processForNotePadOnly
});
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let hashFNV32a;
module.link("/imports/api/common/server/helpers", {
  hashFNV32a(v) {
    hashFNV32a = v;
  }

}, 1);
const ETHERPAD = Meteor.settings.private.etherpad;
const NOTE_CONFIG = Meteor.settings.public.note;
const BASE_URL = `http://${ETHERPAD.host}:${ETHERPAD.port}/api/${ETHERPAD.version}`;
const TOKEN = '_';

const createPadURL = padId => `${BASE_URL}/createPad?apikey=${ETHERPAD.apikey}&padID=${padId}`;

const getReadOnlyIdURL = padId => `${BASE_URL}/getReadOnlyID?apikey=${ETHERPAD.apikey}&padID=${padId}`;

const appendTextURL = (padId, text) => `${BASE_URL}/appendText?apikey=${ETHERPAD.apikey}&padID=${padId}&text=${encodeURIComponent(text)}`;

const generateNoteId = meetingId => {
  const noteId = hashFNV32a(meetingId, true);
  return noteId;
};

const isEnabled = () => NOTE_CONFIG.enabled;

const getDataFromResponse = (data, key) => {
  if (data) {
    const innerData = data.data;

    if (innerData && innerData[key]) {
      return innerData[key];
    }
  }

  return null;
};

const isNotePad = padId => padId.search(TOKEN);

const processForNotePadOnly = fn => (message, ...args) => {
  const {
    body
  } = message;
  const {
    pad
  } = body;
  const {
    id
  } = pad;
  check(id, String);
  if (isNotePad(id)) return fn(message, ...args);
  return () => {};
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/note/server/index.js                                                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.link("./publishers");
module.link("./eventHandlers");
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"publishers.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/note/server/publishers.js                                                                               //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 1);
let Note;
module.link("/imports/api/note", {
  default(v) {
    Note = v;
  }

}, 2);
let extractCredentials;
module.link("/imports/api/common/server/helpers", {
  extractCredentials(v) {
    extractCredentials = v;
  }

}, 3);

function note() {
  if (!this.userId) {
    return Note.find({
      meetingId: ''
    });
  }

  const {
    meetingId,
    requesterUserId
  } = extractCredentials(this.userId);
  Logger.info(`Publishing note for ${meetingId} ${requesterUserId}`);
  return Note.find({
    meetingId
  });
}

function publish(...args) {
  const boundNote = note.bind(this);
  return boundNote(...args);
}

Meteor.publish('note', publish);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"index.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/note/index.js                                                                                           //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
const Note = new Mongo.Collection('note');

if (Meteor.isServer) {
  Note._ensureIndex({
    meetingId: 1,
    noteId: 1
  });
}

module.exportDefault(Note);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"ping-pong":{"server":{"methods":{"ping.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/ping-pong/server/methods/ping.js                                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => ping
});
let Users;
module.link("/imports/api/users", {
  default(v) {
    Users = v;
  }

}, 0);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 1);
let extractCredentials;
module.link("/imports/api/common/server/helpers", {
  extractCredentials(v) {
    extractCredentials = v;
  }

}, 2);

function ping() {
  const {
    meetingId,
    requesterUserId
  } = extractCredentials(this.userId);
  const selector = {
    meetingId,
    userId: requesterUserId
  };
  const modifier = {
    $set: {
      lastPing: Date.now()
    }
  };

  const cb = err => {
    if (err) {
      return Logger.error(`Error updating lastPing for ${requesterUserId}: ${err}`);
    }
  };

  return Users.update(selector, modifier, cb);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"index.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/ping-pong/server/index.js                                                                               //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.link("./publishers");
module.link("./methods");
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"methods.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/ping-pong/server/methods.js                                                                             //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let ping;
module.link("./methods/ping", {
  default(v) {
    ping = v;
  }

}, 1);
Meteor.methods({
  ping
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"publishers.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/ping-pong/server/publishers.js                                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 1);

let _;

module.link("lodash", {
  default(v) {
    _ = v;
  }

}, 2);
let extractCredentials;
module.link("/imports/api/common/server/helpers", {
  extractCredentials(v) {
    extractCredentials = v;
  }

}, 3);
const COLLECTION_NAME = 'ping-pong';
const INTERVAL_IN_SETTINGS = Meteor.settings.public.pingPong.clearUsersInSeconds * 1000;
const INTERVAL_TIME = INTERVAL_IN_SETTINGS < 10000 ? 10000 : INTERVAL_IN_SETTINGS;
const PONG_INTERVAL_IN_SETTINGS = Meteor.settings.public.pingPong.pongTimeInSeconds * 1000;
const PONG_INTERVAL = PONG_INTERVAL_IN_SETTINGS >= INTERVAL_TIME / 2 ? INTERVAL_TIME / 2 : PONG_INTERVAL_IN_SETTINGS;

function pingPong() {
  if (!this.userId) {
    return; // TODO-- is there a more appropriate set to return?
  }

  const {
    meetingId,
    requesterUserId
  } = extractCredentials(this.userId);

  const id = _.uniqueId('pong-');

  Logger.info(`Starting ping-pong publish for userId: ${requesterUserId}`);

  const pongSender = interval => {
    const payload = {
      pong: {
        message: 'pong',
        time: Date.now(),
        meetingId
      }
    };
    let fn = this.added.bind(this);
    if (interval) fn = this.changed.bind(this);
    fn(COLLECTION_NAME, id, payload);
  };

  pongSender();
  this.ready();
  const interval = Meteor.setInterval(() => pongSender(true), PONG_INTERVAL);
  this.onStop(() => {
    Meteor.clearInterval(interval);
  });
}

Meteor.publish('ping-pong', pingPong);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}},"polls":{"server":{"handlers":{"pollPublished.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/polls/server/handlers/pollPublished.js                                                                  //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => pollPublished
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let removePoll;
module.link("../modifiers/removePoll", {
  default(v) {
    removePoll = v;
  }

}, 1);
let setPublishedPoll;
module.link("../../../meetings/server/modifiers/setPublishedPoll", {
  default(v) {
    setPublishedPoll = v;
  }

}, 2);

function pollPublished({
  body
}, meetingId) {
  const {
    pollId
  } = body;
  check(meetingId, String);
  check(pollId, String);
  setPublishedPoll(meetingId, true);
  return removePoll(meetingId, pollId);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"pollStarted.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/polls/server/handlers/pollStarted.js                                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => pollStarted
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let addPoll;
module.link("../modifiers/addPoll", {
  default(v) {
    addPoll = v;
  }

}, 1);
let setPublishedPoll;
module.link("../../../meetings/server/modifiers/setPublishedPoll", {
  default(v) {
    setPublishedPoll = v;
  }

}, 2);

function pollStarted({
  body
}, meetingId) {
  const {
    userId
  } = body;
  const {
    poll
  } = body;
  check(meetingId, String);
  check(userId, String);
  check(poll, Object);
  setPublishedPoll(meetingId, false);
  return addPoll(meetingId, userId, poll);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"pollStopped.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/polls/server/handlers/pollStopped.js                                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => pollStopped
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let removePoll;
module.link("../modifiers/removePoll", {
  default(v) {
    removePoll = v;
  }

}, 1);
let clearPolls;
module.link("../modifiers/clearPolls", {
  default(v) {
    clearPolls = v;
  }

}, 2);

function pollStopped({
  body
}, meetingId) {
  const {
    poll
  } = body;
  check(meetingId, String);

  if (poll) {
    const {
      pollId
    } = poll;
    check(pollId, String);
    return removePoll(meetingId, pollId);
  }

  return clearPolls(meetingId);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"userResponded.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/polls/server/handlers/userResponded.js                                                                  //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => userResponded
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let Polls;
module.link("/imports/api/polls", {
  default(v) {
    Polls = v;
  }

}, 1);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 2);

function userResponded({
  body
}) {
  const {
    pollId,
    userId,
    answerId
  } = body;
  check(pollId, String);
  check(userId, String);
  check(answerId, Number);
  const selector = {
    id: pollId
  };
  const modifier = {
    $pull: {
      users: userId
    },
    $push: {
      responses: {
        userId,
        answerId
      }
    }
  };

  const cb = err => {
    if (err) {
      return Logger.error(`Updating Poll responses: ${err}`);
    }

    return Logger.info(`Updating Poll response (userId: ${userId},` + `response: ${answerId}, pollId: ${pollId})`);
  };

  return Polls.update(selector, modifier, cb);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"userVoted.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/polls/server/handlers/userVoted.js                                                                      //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => userVoted
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let updateVotes;
module.link("../modifiers/updateVotes", {
  default(v) {
    updateVotes = v;
  }

}, 1);

function userVoted({
  body
}, meetingId) {
  const {
    poll
  } = body;
  check(meetingId, String);
  check(poll, {
    id: String,
    answers: [{
      id: Number,
      key: String,
      numVotes: Number
    }],
    numRespondents: Number,
    numResponders: Number
  });
  return updateVotes(poll, meetingId);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"methods":{"publishPoll.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/polls/server/methods/publishPoll.js                                                                     //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => publishPoll
});
let RedisPubSub;
module.link("/imports/startup/server/redis", {
  default(v) {
    RedisPubSub = v;
  }

}, 0);
let Polls;
module.link("/imports/api/polls", {
  default(v) {
    Polls = v;
  }

}, 1);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 2);
let extractCredentials;
module.link("/imports/api/common/server/helpers", {
  extractCredentials(v) {
    extractCredentials = v;
  }

}, 3);

function publishPoll() {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'ShowPollResultReqMsg';
  const {
    meetingId,
    requesterUserId
  } = extractCredentials(this.userId);
  const poll = Polls.findOne({
    meetingId
  }); // TODO--send pollid from client

  if (!poll) {
    Logger.error(`Attempted to publish inexisting poll for meetingId: ${meetingId}`);
    return false;
  }

  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, {
    requesterId: requesterUserId,
    pollId: poll.id
  });
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"publishVote.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/polls/server/methods/publishVote.js                                                                     //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => publishVote
});
let RedisPubSub;
module.link("/imports/startup/server/redis", {
  default(v) {
    RedisPubSub = v;
  }

}, 0);
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 1);
let Polls;
module.link("/imports/api/polls", {
  default(v) {
    Polls = v;
  }

}, 2);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 3);
let extractCredentials;
module.link("/imports/api/common/server/helpers", {
  extractCredentials(v) {
    extractCredentials = v;
  }

}, 4);

function publishVote(id, pollAnswerId) {
  // TODO discuss location
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'RespondToPollReqMsg';
  const {
    meetingId,
    requesterUserId
  } = extractCredentials(this.userId);
  /*
   We keep an array of people who were in the meeting at the time the poll
   was started. The poll is published to them only.
   Once they vote - their ID is removed and they cannot see the poll anymore
   */

  const currentPoll = Polls.findOne({
    users: requesterUserId,
    meetingId,
    'answers.id': pollAnswerId,
    id
  });
  check(pollAnswerId, Number);
  check(currentPoll, Object);
  check(currentPoll.meetingId, String);
  const payload = {
    requesterId: requesterUserId,
    pollId: currentPoll.id,
    questionId: 0,
    answerId: pollAnswerId
  };
  const selector = {
    users: requesterUserId,
    meetingId,
    'answers.id': pollAnswerId
  };
  const modifier = {
    $pull: {
      users: requesterUserId
    }
  };

  const cb = err => {
    if (err) {
      return Logger.error(`Updating Polls collection: ${err}`);
    }

    return Logger.info(`Updating Polls collection (meetingId: ${meetingId}, ` + `pollId: ${currentPoll.id}!)`);
  };

  Polls.update(selector, modifier, cb);
  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"startPoll.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/polls/server/methods/startPoll.js                                                                       //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => startPoll
});
let RedisPubSub;
module.link("/imports/startup/server/redis", {
  default(v) {
    RedisPubSub = v;
  }

}, 0);
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 1);
let extractCredentials;
module.link("/imports/api/common/server/helpers", {
  extractCredentials(v) {
    extractCredentials = v;
  }

}, 2);

function startPoll(pollType, pollId, answers) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  let EVENT_NAME = 'StartPollReqMsg';
  const {
    meetingId,
    requesterUserId
  } = extractCredentials(this.userId);
  check(pollId, String);
  check(pollType, String);
  const payload = {
    requesterId: requesterUserId,
    pollId: `${pollId}/${new Date().getTime()}`,
    pollType
  };

  if (pollType === 'custom') {
    EVENT_NAME = 'StartCustomPollReqMsg';
    check(answers, Array);
    payload.answers = answers;
  }

  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"stopPoll.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/polls/server/methods/stopPoll.js                                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => stopPoll
});
let RedisPubSub;
module.link("/imports/startup/server/redis", {
  default(v) {
    RedisPubSub = v;
  }

}, 0);
let extractCredentials;
module.link("/imports/api/common/server/helpers", {
  extractCredentials(v) {
    extractCredentials = v;
  }

}, 1);

function stopPoll() {
  const {
    meetingId,
    requesterUserId: requesterId
  } = extractCredentials(this.userId);
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'StopPollReqMsg';
  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterId, {
    requesterId
  });
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"modifiers":{"addPoll.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/polls/server/modifiers/addPoll.js                                                                       //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => addPoll
});
let Users;
module.link("/imports/api/users", {
  default(v) {
    Users = v;
  }

}, 0);
let Polls;
module.link("/imports/api/polls", {
  default(v) {
    Polls = v;
  }

}, 1);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 2);
let flat;
module.link("flat", {
  default(v) {
    flat = v;
  }

}, 3);
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 4);

function addPoll(meetingId, requesterId, poll) {
  check(requesterId, String);
  check(meetingId, String);
  check(poll, {
    id: String,
    answers: [{
      id: Number,
      key: String
    }]
  });
  const userSelector = {
    meetingId,
    userId: {
      $ne: requesterId
    },
    clientType: {
      $ne: 'dial-in-user'
    }
  };
  const userIds = Users.find(userSelector, {
    fields: {
      userId: 1
    }
  }).fetch().map(user => user.userId);
  const selector = {
    meetingId,
    requester: requesterId,
    id: poll.id
  };
  const modifier = Object.assign({
    meetingId
  }, {
    requester: requesterId
  }, {
    users: userIds
  }, flat(poll, {
    safe: true
  }));

  const cb = (err, numChanged) => {
    if (err != null) {
      return Logger.error(`Adding Poll to collection: ${poll.id}`);
    }

    const {
      insertedId
    } = numChanged;

    if (insertedId) {
      return Logger.info(`Added Poll id=${poll.id}`);
    }

    return Logger.info(`Upserted Poll id=${poll.id}`);
  };

  return Polls.upsert(selector, modifier, cb);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"clearPolls.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/polls/server/modifiers/clearPolls.js                                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => clearPolls
});
let Polls;
module.link("/imports/api/polls", {
  default(v) {
    Polls = v;
  }

}, 0);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 1);

function clearPolls(meetingId) {
  if (meetingId) {
    return Polls.remove({
      meetingId
    }, () => {
      Logger.info(`Cleared Polls (${meetingId})`);
    });
  }

  return Polls.remove({}, () => {
    Logger.info('Cleared Polls (all)');
  });
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"removePoll.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/polls/server/modifiers/removePoll.js                                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => removePoll
});
let Polls;
module.link("/imports/api/polls", {
  default(v) {
    Polls = v;
  }

}, 0);
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 1);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 2);

function removePoll(meetingId, id) {
  check(meetingId, String);
  check(id, String);
  const selector = {
    meetingId,
    id
  };

  const cb = err => {
    if (err) {
      return Logger.error(`Removing Poll from collection: ${err}`);
    }

    return Logger.info(`Removed Poll id=${id}`);
  };

  return Polls.remove(selector, cb);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"updateVotes.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/polls/server/modifiers/updateVotes.js                                                                   //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => updateVotes
});
let Polls;
module.link("/imports/api/polls", {
  default(v) {
    Polls = v;
  }

}, 0);
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 1);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 2);
let flat;
module.link("flat", {
  default(v) {
    flat = v;
  }

}, 3);

function updateVotes(poll, meetingId) {
  check(meetingId, String);
  check(poll, Object);
  const {
    id,
    answers,
    numResponders,
    numRespondents
  } = poll;
  check(id, String);
  check(answers, Array);
  check(numResponders, Number);
  check(numRespondents, Number);
  const selector = {
    meetingId,
    id
  };
  const modifier = {
    $set: flat(poll, {
      safe: true
    })
  };

  const cb = err => {
    if (err) {
      return Logger.error(`Updating Polls collection: ${err}`);
    }

    return Logger.info(`Updating Polls collection (meetingId: ${meetingId}, pollId: ${id}!)`);
  };

  return Polls.update(selector, modifier, cb);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"eventHandlers.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/polls/server/eventHandlers.js                                                                           //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let RedisPubSub;
module.link("/imports/startup/server/redis", {
  default(v) {
    RedisPubSub = v;
  }

}, 0);
let handlePollStarted;
module.link("./handlers/pollStarted", {
  default(v) {
    handlePollStarted = v;
  }

}, 1);
let handlePollStopped;
module.link("./handlers/pollStopped", {
  default(v) {
    handlePollStopped = v;
  }

}, 2);
let handlePollPublished;
module.link("./handlers/pollPublished", {
  default(v) {
    handlePollPublished = v;
  }

}, 3);
let handleUserVoted;
module.link("./handlers/userVoted", {
  default(v) {
    handleUserVoted = v;
  }

}, 4);
let handleUserResponded;
module.link("./handlers/userResponded", {
  default(v) {
    handleUserResponded = v;
  }

}, 5);
RedisPubSub.on('PollShowResultEvtMsg', handlePollPublished);
RedisPubSub.on('PollStartedEvtMsg', handlePollStarted);
RedisPubSub.on('PollStoppedEvtMsg', handlePollStopped);
RedisPubSub.on('PollUpdatedEvtMsg', handleUserVoted);
RedisPubSub.on('UserRespondedToPollRespMsg', handleUserResponded);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/polls/server/index.js                                                                                   //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.link("./eventHandlers");
module.link("./methods");
module.link("./publishers");
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"methods.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/polls/server/methods.js                                                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let publishVote;
module.link("./methods/publishVote", {
  default(v) {
    publishVote = v;
  }

}, 1);
let publishPoll;
module.link("./methods/publishPoll", {
  default(v) {
    publishPoll = v;
  }

}, 2);
let startPoll;
module.link("./methods/startPoll", {
  default(v) {
    startPoll = v;
  }

}, 3);
let stopPoll;
module.link("./methods/stopPoll", {
  default(v) {
    stopPoll = v;
  }

}, 4);
Meteor.methods({
  publishVote,
  publishPoll,
  startPoll,
  stopPoll
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"publishers.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/polls/server/publishers.js                                                                              //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 1);
let Polls;
module.link("/imports/api/polls", {
  default(v) {
    Polls = v;
  }

}, 2);
let extractCredentials;
module.link("/imports/api/common/server/helpers", {
  extractCredentials(v) {
    extractCredentials = v;
  }

}, 3);

function currentPoll() {
  if (!this.userId) {
    return Polls.find({
      meetingId: ''
    });
  }

  const {
    meetingId
  } = extractCredentials(this.userId);
  const selector = {
    meetingId
  };
  Logger.debug(`Publishing poll for meeting=${meetingId}`);
  return Polls.find(selector);
}

function publishCurrentPoll(...args) {
  const boundPolls = currentPoll.bind(this);
  return boundPolls(...args);
}

Meteor.publish('current-poll', publishCurrentPoll);

function polls() {
  if (!this.userId) {
    return Polls.find({
      meetingId: ''
    });
  }

  const {
    meetingId,
    requesterUserId
  } = extractCredentials(this.userId);
  Logger.debug(`Publishing polls =${meetingId} ${requesterUserId}`);
  const selector = {
    meetingId,
    users: requesterUserId
  };
  return Polls.find(selector);
}

function publish(...args) {
  const boundPolls = polls.bind(this);
  return boundPolls(...args);
}

Meteor.publish('polls', publish);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"index.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/polls/index.js                                                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
const Polls = new Mongo.Collection('polls');

if (Meteor.isServer) {
  // We can have just one active poll per meeting
  // makes no sense to index it by anything other than meetingId
  Polls._ensureIndex({
    meetingId: 1
  });
}

module.exportDefault(Polls);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"presentation-pods":{"server":{"handlers":{"createNewPresentationPod.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/presentation-pods/server/handlers/createNewPresentationPod.js                                           //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => handleCreateNewPresentationPod
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let addPresentationPod;
module.link("../modifiers/addPresentationPod", {
  default(v) {
    addPresentationPod = v;
  }

}, 1);

function handleCreateNewPresentationPod({
  body
}, meetingId) {
  check(body, {
    currentPresenterId: String,
    podId: String
  });
  check(meetingId, String);
  const {
    currentPresenterId,
    podId
  } = body;
  const pod = {
    currentPresenterId,
    podId
  };
  addPresentationPod(meetingId, pod);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"removePresentationPod.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/presentation-pods/server/handlers/removePresentationPod.js                                              //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => handleRemovePresentationPod
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let removePresentationPod;
module.link("../modifiers/removePresentationPod", {
  default(v) {
    removePresentationPod = v;
  }

}, 1);

function handleRemovePresentationPod({
  body
}, meetingId) {
  check(body, Object);
  check(meetingId, String);
  const {
    podId
  } = body;
  check(podId, String);
  removePresentationPod(meetingId, podId);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"setPresenterInPod.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/presentation-pods/server/handlers/setPresenterInPod.js                                                  //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => handleSetPresenterInPod
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let setPresenterInPod;
module.link("../modifiers/setPresenterInPod", {
  default(v) {
    setPresenterInPod = v;
  }

}, 1);

function handleSetPresenterInPod({
  body
}, meetingId) {
  check(body, Object);
  const {
    podId,
    nextPresenterId
  } = body;
  check(podId, String);
  check(nextPresenterId, String);
  setPresenterInPod(meetingId, podId, nextPresenterId);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"syncGetPresentationPods.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/presentation-pods/server/handlers/syncGetPresentationPods.js                                            //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => handleSyncGetPresentationPods
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let PresentationPods;
module.link("/imports/api/presentation-pods", {
  default(v) {
    PresentationPods = v;
  }

}, 1);
let removePresentationPod;
module.link("../modifiers/removePresentationPod", {
  default(v) {
    removePresentationPod = v;
  }

}, 2);
let addPresentationPod;
module.link("../modifiers/addPresentationPod", {
  default(v) {
    addPresentationPod = v;
  }

}, 3);

function handleSyncGetPresentationPods({
  body
}, meetingId) {
  check(body, Object);
  check(meetingId, String);
  const {
    pods
  } = body;
  check(pods, Array);
  const presentationPodIds = pods.map(pod => pod.id);
  const presentationPodsToRemove = PresentationPods.find({
    meetingId,
    podId: {
      $nin: presentationPodIds
    }
  }, {
    fields: {
      podId: 1
    }
  }).fetch();
  presentationPodsToRemove.forEach(p => removePresentationPod(meetingId, p.podId));
  pods.forEach(pod => {
    // 'podId' and 'currentPresenterId' for some reason called 'id' and 'currentPresenter'
    // in this message
    const {
      id: podId,
      currentPresenter: currentPresenterId,
      presentations
    } = pod;
    addPresentationPod(meetingId, {
      podId,
      currentPresenterId
    }, presentations);
  });
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"modifiers":{"addPresentationPod.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/presentation-pods/server/modifiers/addPresentationPod.js                                                //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => addPresentationPod
});
let Match, check;
module.link("meteor/check", {
  Match(v) {
    Match = v;
  },

  check(v) {
    check = v;
  }

}, 0);
let PresentationPods;
module.link("/imports/api/presentation-pods", {
  default(v) {
    PresentationPods = v;
  }

}, 1);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 2);
let addPresentation;
module.link("/imports/api/presentations/server/modifiers/addPresentation", {
  default(v) {
    addPresentation = v;
  }

}, 3);

function addPresentationPod(meetingId, pod, presentations = undefined) {
  check(meetingId, String);
  check(presentations, Match.Maybe(Array));
  check(pod, {
    currentPresenterId: String,
    podId: String
  });
  const {
    currentPresenterId,
    podId
  } = pod;
  const selector = {
    meetingId,
    podId
  };
  const modifier = {
    meetingId,
    podId,
    currentPresenterId
  };

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Adding presentation pod to the collection: ${err}`);
    } // if it's a Sync message - continue adding the attached presentations


    if (presentations) {
      presentations.forEach(presentation => addPresentation(meetingId, podId, presentation));
    }

    if (numChanged) {
      return Logger.info(`Added presentation pod id=${podId} meeting=${meetingId}`);
    }

    return Logger.info(`Upserted presentation pod id=${podId} meeting=${meetingId}`);
  };

  return PresentationPods.upsert(selector, modifier, cb);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"clearPresentationPods.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/presentation-pods/server/modifiers/clearPresentationPods.js                                             //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => clearPresentationPods
});
let PresentationPods;
module.link("/imports/api/presentation-pods", {
  default(v) {
    PresentationPods = v;
  }

}, 0);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 1);
let clearPresentations;
module.link("/imports/api/presentations/server/modifiers/clearPresentations", {
  default(v) {
    clearPresentations = v;
  }

}, 2);
let clearPresentationUploadToken;
module.link("/imports/api/presentation-upload-token/server/modifiers/clearPresentationUploadToken", {
  default(v) {
    clearPresentationUploadToken = v;
  }

}, 3);

function clearPresentationPods(meetingId) {
  if (meetingId) {
    return PresentationPods.remove({
      meetingId
    }, () => {
      clearPresentations(meetingId);
      clearPresentationUploadToken(meetingId);
      Logger.info(`Cleared Presentations Pods (${meetingId})`);
    });
  }

  return PresentationPods.remove({}, () => {
    clearPresentations();
    clearPresentationUploadToken();
    Logger.info('Cleared Presentations Pods (all)');
  });
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"removePresentationPod.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/presentation-pods/server/modifiers/removePresentationPod.js                                             //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => removePresentationPod
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let PresentationPods;
module.link("/imports/api/presentation-pods", {
  default(v) {
    PresentationPods = v;
  }

}, 1);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 2);
let clearPresentations;
module.link("/imports/api/presentations/server/modifiers/clearPresentations", {
  default(v) {
    clearPresentations = v;
  }

}, 3);
let clearPresentationUploadToken;
module.link("/imports/api/presentation-upload-token/server/modifiers/clearPresentationUploadToken", {
  default(v) {
    clearPresentationUploadToken = v;
  }

}, 4);

function removePresentationPod(meetingId, podId) {
  check(meetingId, String);
  check(podId, String);
  const selector = {
    meetingId,
    podId
  };

  const cb = err => {
    if (err) {
      Logger.error(`Removing presentation pod from collection: ${err}`);
      return;
    }

    if (podId) {
      Logger.info(`Removed presentation pod id=${podId} meeting=${meetingId}`);
      clearPresentations(meetingId, podId);
      clearPresentationUploadToken(meetingId, podId);
    }
  };

  return PresentationPods.remove(selector, cb);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"setPresenterInPod.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/presentation-pods/server/modifiers/setPresenterInPod.js                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => setPresenterInPod
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let PresentationPods;
module.link("/imports/api/presentation-pods", {
  default(v) {
    PresentationPods = v;
  }

}, 1);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 2);

function setPresenterInPod(meetingId, podId, nextPresenterId) {
  check(meetingId, String);
  check(podId, String);
  check(nextPresenterId, String);
  const selector = {
    meetingId,
    podId
  };
  const modifier = {
    $set: {
      currentPresenterId: nextPresenterId
    }
  };

  const cb = (err, numChanged) => {
    if (err) {
      Logger.error(`Setting a presenter in pod: ${err}`);
      return;
    }

    if (numChanged) {
      Logger.info(`Set a new presenter in pod id=${podId} meeting=${meetingId}`);
    }
  };

  return PresentationPods.upsert(selector, modifier, cb);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"eventHandlers.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/presentation-pods/server/eventHandlers.js                                                               //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let RedisPubSub;
module.link("/imports/startup/server/redis", {
  default(v) {
    RedisPubSub = v;
  }

}, 0);
let handleCreateNewPresentationPod;
module.link("./handlers/createNewPresentationPod", {
  default(v) {
    handleCreateNewPresentationPod = v;
  }

}, 1);
let handleRemovePresentationPod;
module.link("./handlers/removePresentationPod", {
  default(v) {
    handleRemovePresentationPod = v;
  }

}, 2);
let handleSyncGetPresentationPods;
module.link("./handlers/syncGetPresentationPods", {
  default(v) {
    handleSyncGetPresentationPods = v;
  }

}, 3);
let handleSetPresenterInPod;
module.link("./handlers/setPresenterInPod", {
  default(v) {
    handleSetPresenterInPod = v;
  }

}, 4);
RedisPubSub.on('CreateNewPresentationPodEvtMsg', handleCreateNewPresentationPod);
RedisPubSub.on('RemovePresentationPodEvtMsg', handleRemovePresentationPod);
RedisPubSub.on('SetPresenterInPodRespMsg', handleSetPresenterInPod);
RedisPubSub.on('SyncGetPresentationPodsRespMsg', handleSyncGetPresentationPods);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/presentation-pods/server/index.js                                                                       //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.link("./eventHandlers");
module.link("./methods");
module.link("./publishers");
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"methods.js":function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/presentation-pods/server/methods.js                                                                     //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"publishers.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/presentation-pods/server/publishers.js                                                                  //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let PresentationPods;
module.link("/imports/api/presentation-pods", {
  default(v) {
    PresentationPods = v;
  }

}, 1);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 2);
let extractCredentials;
module.link("/imports/api/common/server/helpers", {
  extractCredentials(v) {
    extractCredentials = v;
  }

}, 3);

function presentationPods() {
  if (!this.userId) {
    return PresentationPods.find({
      meetingId: ''
    });
  }

  const {
    meetingId,
    requesterUserId
  } = extractCredentials(this.userId);
  Logger.debug(`Publishing presentation-pods for ${meetingId} ${requesterUserId}`);
  return PresentationPods.find({
    meetingId
  });
}

function publish(...args) {
  const boundPresentationPods = presentationPods.bind(this);
  return boundPresentationPods(...args);
}

Meteor.publish('presentation-pods', publish);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"index.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/presentation-pods/index.js                                                                              //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
const PresentationPods = new Mongo.Collection('presentation-pods');

if (Meteor.isServer) {
  // types of queries for the presentation pods:
  // 1. meetingId, podId  ( 4 )
  PresentationPods._ensureIndex({
    meetingId: 1,
    podId: 1
  });
}

module.exportDefault(PresentationPods);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"presentation-upload-token":{"server":{"handlers":{"presentationUploadTokenFail.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/presentation-upload-token/server/handlers/presentationUploadTokenFail.js                                //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => handlePresentationUploadTokenFail
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 1);
let PresentationUploadToken;
module.link("/imports/api/presentation-upload-token", {
  default(v) {
    PresentationUploadToken = v;
  }

}, 2);

function handlePresentationUploadTokenFail({
  body,
  header
}, meetingId) {
  check(body, Object);
  const {
    userId
  } = header;
  const {
    podId,
    filename
  } = body;
  check(userId, String);
  check(podId, String);
  check(filename, String);
  const selector = {
    meetingId,
    userId,
    podId,
    filename
  };

  const cb = err => {
    if (err) {
      Logger.error(`Removing presentationToken from collection: ${err}`);
      return;
    }

    Logger.info(`Removing presentationToken filename=${filename} podId=${podId} meeting=${meetingId}`);
  };

  return PresentationUploadToken.upsert(selector, {
    failed: true,
    authzToken: null
  }, cb);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"presentationUploadTokenPass.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/presentation-upload-token/server/handlers/presentationUploadTokenPass.js                                //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => handlePresentationUploadTokenPass
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 1);
let PresentationUploadToken;
module.link("/imports/api/presentation-upload-token", {
  default(v) {
    PresentationUploadToken = v;
  }

}, 2);

function handlePresentationUploadTokenPass({
  body,
  header
}, meetingId) {
  check(body, Object);
  const {
    userId
  } = header;
  const {
    podId,
    authzToken,
    filename
  } = body;
  check(userId, String);
  check(podId, String);
  check(authzToken, String);
  check(filename, String);
  const selector = {
    meetingId,
    podId,
    userId,
    filename
  };
  const doc = {
    meetingId,
    podId,
    userId,
    filename,
    authzToken,
    failed: false,
    used: false
  };

  const cb = err => {
    if (err) {
      Logger.error(`Inserting presentationToken from collection: ${err}`);
      return;
    }

    Logger.info(`Inserting presentationToken filename=${filename} podId=${podId} meeting=${meetingId}`);
  };

  return PresentationUploadToken.upsert(selector, doc, cb);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"methods":{"requestPresentationUploadToken.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/presentation-upload-token/server/methods/requestPresentationUploadToken.js                              //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => requestPresentationUploadToken
});
let RedisPubSub;
module.link("/imports/startup/server/redis", {
  default(v) {
    RedisPubSub = v;
  }

}, 0);
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 1);
let extractCredentials;
module.link("/imports/api/common/server/helpers", {
  extractCredentials(v) {
    extractCredentials = v;
  }

}, 2);

function requestPresentationUploadToken(podId, filename) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'PresentationUploadTokenReqMsg';
  const {
    meetingId,
    requesterUserId
  } = extractCredentials(this.userId);
  check(podId, String);
  check(filename, String);
  const payload = {
    podId,
    filename
  };
  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"setUsedToken.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/presentation-upload-token/server/methods/setUsedToken.js                                                //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => setUsedToken
});
let PresentationUploadToken;
module.link("/imports/api/presentation-upload-token", {
  default(v) {
    PresentationUploadToken = v;
  }

}, 0);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 1);
let extractCredentials;
module.link("/imports/api/common/server/helpers", {
  extractCredentials(v) {
    extractCredentials = v;
  }

}, 2);

function setUsedToken(authzToken) {
  const {
    meetingId,
    requesterUserId
  } = extractCredentials(this.userId);
  const payload = {
    $set: {
      used: true
    }
  };

  const cb = err => {
    if (err) {
      Logger.error(`Unable to set token as used : ${err}`);
      return;
    }

    Logger.info(`Token: ${authzToken} has been set as used in meeting=${meetingId}`);
  };

  return PresentationUploadToken.update({
    meetingId,
    userId: requesterUserId,
    authzToken
  }, payload, cb);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"modifiers":{"clearPresentationUploadToken.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/presentation-upload-token/server/modifiers/clearPresentationUploadToken.js                              //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => clearPresentationUploadToken
});
let PresentationUploadToken;
module.link("/imports/api/presentation-upload-token", {
  default(v) {
    PresentationUploadToken = v;
  }

}, 0);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 1);

function clearPresentationUploadToken(meetingId, podId) {
  if (meetingId && podId) {
    return PresentationUploadToken.remove({
      meetingId,
      podId
    }, () => {
      Logger.info(`Cleared Presentations Upload Token (${meetingId}, ${podId})`);
    });
  }

  if (meetingId) {
    return PresentationUploadToken.remove({
      meetingId
    }, () => {
      Logger.info(`Cleared Presentations Upload Token (${meetingId})`);
    });
  } // clearing presentations for the whole server


  return PresentationUploadToken.remove({}, () => {
    Logger.info('Cleared Presentations Upload Token (all)');
  });
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"eventHandlers.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/presentation-upload-token/server/eventHandlers.js                                                       //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let RedisPubSub;
module.link("/imports/startup/server/redis", {
  default(v) {
    RedisPubSub = v;
  }

}, 0);
let processForHTML5ServerOnly;
module.link("/imports/api/common/server/helpers", {
  processForHTML5ServerOnly(v) {
    processForHTML5ServerOnly = v;
  }

}, 1);
let handlePresentationUploadTokenPass;
module.link("./handlers/presentationUploadTokenPass", {
  default(v) {
    handlePresentationUploadTokenPass = v;
  }

}, 2);
let handlePresentationUploadTokenFail;
module.link("./handlers/presentationUploadTokenFail", {
  default(v) {
    handlePresentationUploadTokenFail = v;
  }

}, 3);
RedisPubSub.on('PresentationUploadTokenPassRespMsg', processForHTML5ServerOnly(handlePresentationUploadTokenPass));
RedisPubSub.on('PresentationUploadTokenFailRespMsg', processForHTML5ServerOnly(handlePresentationUploadTokenFail));
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/presentation-upload-token/server/index.js                                                               //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.link("./eventHandlers");
module.link("./methods");
module.link("./publishers");
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"methods.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/presentation-upload-token/server/methods.js                                                             //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let requestPresentationUploadToken;
module.link("./methods/requestPresentationUploadToken", {
  default(v) {
    requestPresentationUploadToken = v;
  }

}, 1);
let setUsedToken;
module.link("./methods/setUsedToken", {
  default(v) {
    setUsedToken = v;
  }

}, 2);
Meteor.methods({
  requestPresentationUploadToken,
  setUsedToken
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"publishers.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/presentation-upload-token/server/publishers.js                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 1);
let PresentationUploadToken;
module.link("/imports/api/presentation-upload-token", {
  default(v) {
    PresentationUploadToken = v;
  }

}, 2);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 3);
let extractCredentials;
module.link("/imports/api/common/server/helpers", {
  extractCredentials(v) {
    extractCredentials = v;
  }

}, 4);

function presentationUploadToken(podId, filename) {
  if (!this.userId) {
    return PresentationUploadToken.find({
      meetingId: ''
    });
  }

  const {
    meetingId,
    requesterUserId
  } = extractCredentials(this.userId);
  check(podId, String);
  check(filename, String);
  const selector = {
    meetingId,
    podId,
    userId: requesterUserId,
    filename
  };
  Logger.debug(`Publishing PresentationUploadToken for ${meetingId} ${requesterUserId}`);
  return PresentationUploadToken.find(selector);
}

function publish(...args) {
  const boundPresentationUploadToken = presentationUploadToken.bind(this);
  return boundPresentationUploadToken(...args);
}

Meteor.publish('presentation-upload-token', publish);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"index.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/presentation-upload-token/index.js                                                                      //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
const PresentationUploadToken = new Mongo.Collection('presentation-upload-token');
module.exportDefault(PresentationUploadToken);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"presentations":{"server":{"handlers":{"presentationAdded.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/presentations/server/handlers/presentationAdded.js                                                      //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => handlePresentationAdded
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let addPresentation;
module.link("../modifiers/addPresentation", {
  default(v) {
    addPresentation = v;
  }

}, 1);

function handlePresentationAdded({
  body
}, meetingId) {
  check(body, Object);
  const {
    presentation,
    podId
  } = body;
  check(meetingId, String);
  check(podId, String);
  check(presentation, Object);
  return addPresentation(meetingId, podId, presentation);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"presentationConversionUpdate.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/presentations/server/handlers/presentationConversionUpdate.js                                           //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => handlePresentationConversionUpdate
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 1);
let Presentations;
module.link("/imports/api/presentations", {
  default(v) {
    Presentations = v;
  }

}, 2);
// const OFFICE_DOC_CONVERSION_SUCCESS_KEY = 'OFFICE_DOC_CONVERSION_SUCCESS';
const OFFICE_DOC_CONVERSION_FAILED_KEY = 'OFFICE_DOC_CONVERSION_FAILED';
const OFFICE_DOC_CONVERSION_INVALID_KEY = 'OFFICE_DOC_CONVERSION_INVALID';
const SUPPORTED_DOCUMENT_KEY = 'SUPPORTED_DOCUMENT';
const UNSUPPORTED_DOCUMENT_KEY = 'UNSUPPORTED_DOCUMENT';
const PAGE_COUNT_FAILED_KEY = 'PAGE_COUNT_FAILED';
const PAGE_COUNT_EXCEEDED_KEY = 'PAGE_COUNT_EXCEEDED';
const PDF_HAS_BIG_PAGE_KEY = 'PDF_HAS_BIG_PAGE';
const GENERATED_SLIDE_KEY = 'GENERATED_SLIDE'; // const GENERATING_THUMBNAIL_KEY = 'GENERATING_THUMBNAIL';
// const GENERATED_THUMBNAIL_KEY = 'GENERATED_THUMBNAIL';
// const GENERATING_TEXTFILES_KEY = 'GENERATING_TEXTFILES';
// const GENERATED_TEXTFILES_KEY = 'GENERATED_TEXTFILES';
// const GENERATING_SVGIMAGES_KEY = 'GENERATING_SVGIMAGES';
// const GENERATED_SVGIMAGES_KEY = 'GENERATED_SVGIMAGES';
// const CONVERSION_COMPLETED_KEY = 'CONVERSION_COMPLETED';

function handlePresentationConversionUpdate({
  body
}, meetingId) {
  check(body, Object);
  const {
    presentationId,
    podId,
    messageKey: status,
    presName: presentationName
  } = body;
  check(meetingId, String);
  check(presentationId, String);
  check(podId, String);
  check(status, String);
  const statusModifier = {
    'conversion.status': status,
    'conversion.error': false,
    'conversion.done': false
  };

  switch (status) {
    case SUPPORTED_DOCUMENT_KEY:
      statusModifier.id = presentationId;
      statusModifier.name = presentationName;
      break;

    case UNSUPPORTED_DOCUMENT_KEY:
    case OFFICE_DOC_CONVERSION_FAILED_KEY:
    case OFFICE_DOC_CONVERSION_INVALID_KEY:
    case PAGE_COUNT_FAILED_KEY:
    case PAGE_COUNT_EXCEEDED_KEY:
    case PDF_HAS_BIG_PAGE_KEY:
      statusModifier.id = presentationId;
      statusModifier.name = presentationName;
      statusModifier['conversion.error'] = true;
      break;

    case GENERATED_SLIDE_KEY:
      statusModifier['conversion.pagesCompleted'] = body.pagesCompleted;
      statusModifier['conversion.numPages'] = body.numberOfPages;
      break;

    default:
      break;
  }

  const selector = {
    meetingId,
    podId,
    id: presentationId
  };
  const modifier = {
    $set: Object.assign({
      meetingId,
      podId
    }, statusModifier)
  };

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Updating conversion status presentation to collection: ${err}`);
    }

    const {
      insertedId
    } = numChanged;

    if (insertedId) {
      return Logger.info(`Updated presentation conversion status=${status} id=${presentationId} meeting=${meetingId}`);
    }

    return Logger.debug(`Upserted presentation conversion status=${status} id=${presentationId} meeting=${meetingId}`);
  };

  return Presentations.upsert(selector, modifier, cb);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"presentationCurrentSet.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/presentations/server/handlers/presentationCurrentSet.js                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => handlePresentationCurrentSet
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let setCurrentPresentation;
module.link("../modifiers/setCurrentPresentation", {
  default(v) {
    setCurrentPresentation = v;
  }

}, 1);

function handlePresentationCurrentSet({
  body
}, meetingId) {
  check(body, Object);
  const {
    presentationId,
    podId
  } = body;
  check(meetingId, String);
  check(presentationId, String);
  check(podId, String);
  return setCurrentPresentation(meetingId, podId, presentationId);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"presentationDownloadableSet.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/presentations/server/handlers/presentationDownloadableSet.js                                            //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => handlePresentationDownloadableSet
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let setPresentationDownloadable;
module.link("../modifiers/setPresentationDownloadable", {
  default(v) {
    setPresentationDownloadable = v;
  }

}, 1);

function handlePresentationDownloadableSet({
  body
}, meetingId) {
  check(body, Object);
  const {
    presentationId,
    podId,
    downloadable
  } = body;
  check(meetingId, String);
  check(presentationId, String);
  check(podId, String);
  check(downloadable, Boolean);
  return setPresentationDownloadable(meetingId, podId, presentationId, downloadable);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"presentationRemove.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/presentations/server/handlers/presentationRemove.js                                                     //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => handlePresentationRemove
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let removePresentation;
module.link("../modifiers/removePresentation", {
  default(v) {
    removePresentation = v;
  }

}, 1);

function handlePresentationRemove({
  body
}, meetingId) {
  const {
    podId,
    presentationId
  } = body;
  check(meetingId, String);
  check(podId, String);
  check(presentationId, String);
  return removePresentation(meetingId, podId, presentationId);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"methods":{"removePresentation.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/presentations/server/methods/removePresentation.js                                                      //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => removePresentation
});
let RedisPubSub;
module.link("/imports/startup/server/redis", {
  default(v) {
    RedisPubSub = v;
  }

}, 0);
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 1);
let extractCredentials;
module.link("/imports/api/common/server/helpers", {
  extractCredentials(v) {
    extractCredentials = v;
  }

}, 2);

function removePresentation(presentationId, podId) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'RemovePresentationPubMsg';
  const {
    meetingId,
    requesterUserId
  } = extractCredentials(this.userId);
  check(presentationId, String);
  check(podId, String);
  const payload = {
    presentationId,
    podId
  };
  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"setPresentation.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/presentations/server/methods/setPresentation.js                                                         //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => setPresentation
});
let RedisPubSub;
module.link("/imports/startup/server/redis", {
  default(v) {
    RedisPubSub = v;
  }

}, 0);
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 1);
let extractCredentials;
module.link("/imports/api/common/server/helpers", {
  extractCredentials(v) {
    extractCredentials = v;
  }

}, 2);

function setPresentation(presentationId, podId) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'SetCurrentPresentationPubMsg';
  const {
    meetingId,
    requesterUserId
  } = extractCredentials(this.userId);
  check(presentationId, String);
  check(podId, String);
  const payload = {
    presentationId,
    podId
  };
  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"setPresentationDownloadable.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/presentations/server/methods/setPresentationDownloadable.js                                             //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => setPresentationDownloadable
});
let RedisPubSub;
module.link("/imports/startup/server/redis", {
  default(v) {
    RedisPubSub = v;
  }

}, 0);
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 1);
let extractCredentials;
module.link("/imports/api/common/server/helpers", {
  extractCredentials(v) {
    extractCredentials = v;
  }

}, 2);

function setPresentationDownloadable(presentationId, downloadable) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'SetPresentationDownloadablePubMsg';
  const {
    meetingId,
    requesterUserId
  } = extractCredentials(this.userId);
  check(downloadable, Boolean);
  check(presentationId, String);
  const payload = {
    presentationId,
    podId: 'DEFAULT_PRESENTATION_POD',
    downloadable
  };
  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"modifiers":{"addPresentation.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/presentations/server/modifiers/addPresentation.js                                                       //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => addPresentation
});
let HTTP;
module.link("meteor/http", {
  HTTP(v) {
    HTTP = v;
  }

}, 0);
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 1);
let Presentations;
module.link("/imports/api/presentations", {
  default(v) {
    Presentations = v;
  }

}, 2);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 3);
let flat;
module.link("flat", {
  default(v) {
    flat = v;
  }

}, 4);
let addSlide;
module.link("/imports/api/slides/server/modifiers/addSlide", {
  default(v) {
    addSlide = v;
  }

}, 5);
let setCurrentPresentation;
module.link("./setCurrentPresentation", {
  default(v) {
    setCurrentPresentation = v;
  }

}, 6);

const getSlideText = url => Promise.asyncApply(() => {
  let content = '';

  try {
    content = Promise.await(HTTP.get(url).content);
  } catch (error) {
    Logger.error(`No file found. ${error}`);
  }

  return content;
});

const addSlides = (meetingId, podId, presentationId, slides) => {
  slides.forEach(slide => Promise.asyncApply(() => {
    const content = Promise.await(getSlideText(slide.txtUri));
    Object.assign(slide, {
      content
    });
    addSlide(meetingId, podId, presentationId, slide);
  }));
};

function addPresentation(meetingId, podId, presentation) {
  check(meetingId, String);
  check(podId, String);
  check(presentation, {
    id: String,
    name: String,
    current: Boolean,
    pages: [{
      id: String,
      num: Number,
      thumbUri: String,
      swfUri: String,
      txtUri: String,
      svgUri: String,
      current: Boolean,
      xOffset: Number,
      yOffset: Number,
      widthRatio: Number,
      heightRatio: Number
    }],
    downloadable: Boolean
  });
  const selector = {
    meetingId,
    podId,
    id: presentation.id
  };
  const modifier = {
    $set: Object.assign({
      meetingId,
      podId,
      'conversion.done': true,
      'conversion.error': false
    }, flat(presentation, {
      safe: true
    }))
  };

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Adding presentation to collection: ${err}`);
    }

    addSlides(meetingId, podId, presentation.id, presentation.pages);
    const {
      insertedId
    } = numChanged;

    if (insertedId) {
      if (presentation.current) {
        setCurrentPresentation(meetingId, podId, presentation.id);
      }

      return Logger.info(`Added presentation id=${presentation.id} meeting=${meetingId}`);
    }

    return Logger.info(`Upserted presentation id=${presentation.id} meeting=${meetingId}`);
  };

  return Presentations.upsert(selector, modifier, cb);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"clearPresentations.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/presentations/server/modifiers/clearPresentations.js                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => clearPresentations
});
let Presentations;
module.link("/imports/api/presentations", {
  default(v) {
    Presentations = v;
  }

}, 0);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 1);

function clearPresentations(meetingId, podId) {
  // clearing presentations for 1 pod
  if (meetingId && podId) {
    return Presentations.remove({
      meetingId,
      podId
    }, () => {
      Logger.info(`Cleared Presentations (${meetingId}, ${podId})`);
    });
  } // clearing presentations for the whole meeting


  if (meetingId) {
    return Presentations.remove({
      meetingId
    }, () => {
      Logger.info(`Cleared Presentations (${meetingId})`);
    });
  } // clearing presentations for the whole server


  return Presentations.remove({}, () => {
    Logger.info('Cleared Presentations (all)');
  });
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"removePresentation.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/presentations/server/modifiers/removePresentation.js                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => removePresentation
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let Presentations;
module.link("/imports/api/presentations", {
  default(v) {
    Presentations = v;
  }

}, 1);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 2);
let clearSlidesPresentation;
module.link("/imports/api/slides/server/modifiers/clearSlidesPresentation", {
  default(v) {
    clearSlidesPresentation = v;
  }

}, 3);

function removePresentation(meetingId, podId, presentationId) {
  check(meetingId, String);
  check(presentationId, String);
  check(podId, String);
  const selector = {
    meetingId,
    podId,
    id: presentationId
  };

  const cb = (err, numChanged) => {
    if (err) {
      Logger.error(`Removing presentation from collection: ${err}`);
      return;
    }

    if (numChanged) {
      clearSlidesPresentation(meetingId, presentationId);
      Logger.info(`Removed presentation id=${presentationId} meeting=${meetingId}`);
    }
  };

  return Presentations.remove(selector, cb);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"setCurrentPresentation.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/presentations/server/modifiers/setCurrentPresentation.js                                                //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => setCurrentPresentation
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let Presentations;
module.link("/imports/api/presentations", {
  default(v) {
    Presentations = v;
  }

}, 1);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 2);

function setCurrentPresentation(meetingId, podId, presentationId) {
  check(meetingId, String);
  check(presentationId, String);
  check(podId, String);
  const oldCurrent = {
    selector: {
      meetingId,
      podId,
      current: true
    },
    modifier: {
      $set: {
        current: false
      }
    },
    callback: err => {
      if (err) {
        return Logger.error(`Unsetting the current presentation: ${err}`);
      }

      return Logger.info('Unsetted as current presentation');
    }
  };
  const newCurrent = {
    selector: {
      meetingId,
      podId,
      id: presentationId
    },
    modifier: {
      $set: {
        current: true
      }
    },
    callback: err => {
      if (err) {
        return Logger.error(`Setting as current presentation id=${presentationId}: ${err}`);
      }

      return Logger.info(`Setted as current presentation id=${presentationId}`);
    }
  };
  const oldPresentation = Presentations.findOne(oldCurrent.selector);
  const newPresentation = Presentations.findOne(newCurrent.selector); // Prevent bug with presentation being unset, same happens in the slide
  // See: https://github.com/bigbluebutton/bigbluebutton/pull/4431

  if (oldPresentation && newPresentation && oldPresentation._id === newPresentation._id) {
    return;
  }

  if (newPresentation) {
    Presentations.update(newPresentation._id, newCurrent.modifier, newCurrent.callback);
  }

  if (oldPresentation) {
    Presentations.update(oldPresentation._id, oldCurrent.modifier, oldCurrent.callback);
  }
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"setPresentationDownloadable.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/presentations/server/modifiers/setPresentationDownloadable.js                                           //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => setPresentationDownloadable
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let Presentations;
module.link("/imports/api/presentations", {
  default(v) {
    Presentations = v;
  }

}, 1);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 2);

function setPresentationDownloadable(meetingId, podId, presentationId, downloadable) {
  check(meetingId, String);
  check(presentationId, String);
  check(podId, String);
  check(downloadable, Boolean);
  const selector = {
    meetingId,
    podId,
    id: presentationId
  };
  const modifier = {
    $set: {
      downloadable
    }
  };

  const cb = (err, numChanged) => {
    if (err) {
      Logger.error(`Could not set downloadable on pres {${presentationId} in meeting {${meetingId}} ${err}`);
      return;
    }

    if (numChanged) {
      Logger.info(`Set downloadable status on presentation {${presentationId} in meeting {${meetingId}}`);
    }
  };

  return Presentations.upsert(selector, modifier, cb);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"eventHandlers.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/presentations/server/eventHandlers.js                                                                   //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let RedisPubSub;
module.link("/imports/startup/server/redis", {
  default(v) {
    RedisPubSub = v;
  }

}, 0);
let handlePresentationAdded;
module.link("./handlers/presentationAdded", {
  default(v) {
    handlePresentationAdded = v;
  }

}, 1);
let handlePresentationRemove;
module.link("./handlers/presentationRemove", {
  default(v) {
    handlePresentationRemove = v;
  }

}, 2);
let handlePresentationCurrentSet;
module.link("./handlers/presentationCurrentSet", {
  default(v) {
    handlePresentationCurrentSet = v;
  }

}, 3);
let handlePresentationConversionUpdate;
module.link("./handlers/presentationConversionUpdate", {
  default(v) {
    handlePresentationConversionUpdate = v;
  }

}, 4);
let handlePresentationDownloadableSet;
module.link("./handlers/presentationDownloadableSet", {
  default(v) {
    handlePresentationDownloadableSet = v;
  }

}, 5);
RedisPubSub.on('PdfConversionInvalidErrorEvtMsg', handlePresentationConversionUpdate);
RedisPubSub.on('PresentationPageGeneratedEvtMsg', handlePresentationConversionUpdate);
RedisPubSub.on('PresentationPageCountErrorEvtMsg', handlePresentationConversionUpdate);
RedisPubSub.on('PresentationConversionUpdateEvtMsg', handlePresentationConversionUpdate);
RedisPubSub.on('PresentationConversionCompletedEvtMsg', handlePresentationAdded);
RedisPubSub.on('RemovePresentationEvtMsg', handlePresentationRemove);
RedisPubSub.on('SetCurrentPresentationEvtMsg', handlePresentationCurrentSet);
RedisPubSub.on('SetPresentationDownloadableEvtMsg', handlePresentationDownloadableSet);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/presentations/server/index.js                                                                           //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.link("./eventHandlers");
module.link("./methods");
module.link("./publishers");
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"methods.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/presentations/server/methods.js                                                                         //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let removePresentation;
module.link("./methods/removePresentation", {
  default(v) {
    removePresentation = v;
  }

}, 1);
let setPresentation;
module.link("./methods/setPresentation", {
  default(v) {
    setPresentation = v;
  }

}, 2);
let setPresentationDownloadable;
module.link("./methods/setPresentationDownloadable", {
  default(v) {
    setPresentationDownloadable = v;
  }

}, 3);
Meteor.methods({
  removePresentation,
  setPresentation,
  setPresentationDownloadable
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"publishers.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/presentations/server/publishers.js                                                                      //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let Presentations;
module.link("/imports/api/presentations", {
  default(v) {
    Presentations = v;
  }

}, 1);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 2);
let extractCredentials;
module.link("/imports/api/common/server/helpers", {
  extractCredentials(v) {
    extractCredentials = v;
  }

}, 3);

function presentations() {
  if (!this.userId) {
    return Presentations.find({
      meetingId: ''
    });
  }

  const {
    meetingId,
    requesterUserId
  } = extractCredentials(this.userId);
  Logger.debug(`Publishing Presentations for ${meetingId} ${requesterUserId}`);
  return Presentations.find({
    meetingId
  });
}

function publish(...args) {
  const boundPresentations = presentations.bind(this);
  return boundPresentations(...args);
}

Meteor.publish('presentations', publish);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"index.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/presentations/index.js                                                                                  //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
const Presentations = new Mongo.Collection('presentations');

if (Meteor.isServer) {
  // types of queries for the presentations:
  // 1. meetingId, podId, id        ( 3 )
  // 2. meetingId, id               ( 1 )
  // 3. meetingId, id, current      ( 2 )
  // 4. meetingId                   ( 1 )
  Presentations._ensureIndex({
    meetingId: 1,
    podId: 1,
    id: 1
  });
}

module.exportDefault(Presentations);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"screenshare":{"server":{"handlers":{"screenshareStarted.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/screenshare/server/handlers/screenshareStarted.js                                                       //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => handleScreenshareStarted
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let Meetings;
module.link("/imports/api/meetings", {
  default(v) {
    Meetings = v;
  }

}, 1);
let Users;
module.link("/imports/api/users", {
  default(v) {
    Users = v;
  }

}, 2);
let addScreenshare;
module.link("../modifiers/addScreenshare", {
  default(v) {
    addScreenshare = v;
  }

}, 3);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 4);
let stopWatchingExternalVideo;
module.link("/imports/api/external-videos/server/methods/stopWatchingExternalVideo", {
  default(v) {
    stopWatchingExternalVideo = v;
  }

}, 5);

function handleScreenshareStarted({
  body
}, meetingId) {
  check(meetingId, String);
  check(body, Object);
  const meeting = Meetings.findOne({
    meetingId
  });
  const presenter = Users.findOne({
    meetingId,
    presenter: true
  });
  const presenterId = presenter && presenter.userId ? presenter.userId : 'system-screenshare-starting';

  if (meeting && meeting.externalVideoUrl) {
    Logger.info(`ScreenshareStarted: There is external video being shared. Stopping it due to presenter change, ${meeting.externalVideoUrl}`);
    stopWatchingExternalVideo({
      meetingId,
      requesterUserId: presenterId
    });
  }

  return addScreenshare(meetingId, body);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"screenshareStopped.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/screenshare/server/handlers/screenshareStopped.js                                                       //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => handleScreenshareStopped
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let clearScreenshare;
module.link("../modifiers/clearScreenshare", {
  default(v) {
    clearScreenshare = v;
  }

}, 1);

function handleScreenshareStopped({
  body
}, meetingId) {
  const {
    screenshareConf
  } = body;
  check(meetingId, String);
  check(screenshareConf, String);
  return clearScreenshare(meetingId, screenshareConf);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"modifiers":{"addScreenshare.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/screenshare/server/modifiers/addScreenshare.js                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => addScreenshare
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let flat;
module.link("flat", {
  default(v) {
    flat = v;
  }

}, 1);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 2);
let Screenshare;
module.link("/imports/api/screenshare", {
  default(v) {
    Screenshare = v;
  }

}, 3);

function addScreenshare(meetingId, body) {
  check(meetingId, String);
  const selector = {
    meetingId
  };
  const modifier = {
    $set: {
      meetingId,
      screenshare: flat(body)
    }
  };

  const cb = err => {
    if (err) {
      return Logger.error(`Adding screenshare to collection: ${err}`);
    }

    return Logger.info(`Upserted screenshare id=${body.screenshareConf}`);
  };

  return Screenshare.upsert(selector, modifier, cb);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"clearScreenshare.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/screenshare/server/modifiers/clearScreenshare.js                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => clearScreenshare
});
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 0);
let Screenshare;
module.link("/imports/api/screenshare", {
  default(v) {
    Screenshare = v;
  }

}, 1);

function clearScreenshare(meetingId, screenshareConf) {
  const cb = err => {
    if (err) {
      return Logger.error(`removing screenshare to collection: ${err}`);
    }

    return Logger.info(`removed screenshare meetingId=${meetingId} id=${screenshareConf}`);
  };

  if (meetingId && screenshareConf) {
    return Screenshare.remove({
      meetingId,
      'screenshare.screenshareConf': screenshareConf
    }, cb);
  }

  return Screenshare.remove({}, cb);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"eventHandlers.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/screenshare/server/eventHandlers.js                                                                     //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let RedisPubSub;
module.link("/imports/startup/server/redis", {
  default(v) {
    RedisPubSub = v;
  }

}, 0);
let handleScreenshareStarted;
module.link("./handlers/screenshareStarted", {
  default(v) {
    handleScreenshareStarted = v;
  }

}, 1);
let handleScreenshareStopped;
module.link("./handlers/screenshareStopped", {
  default(v) {
    handleScreenshareStopped = v;
  }

}, 2);
RedisPubSub.on('ScreenshareRtmpBroadcastStartedEvtMsg', handleScreenshareStarted);
RedisPubSub.on('ScreenshareRtmpBroadcastStoppedEvtMsg', handleScreenshareStopped);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/screenshare/server/index.js                                                                             //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.link("./eventHandlers");
module.link("./methods");
module.link("./publishers");
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"methods.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/screenshare/server/methods.js                                                                           //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
Meteor.methods({});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"publishers.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/screenshare/server/publishers.js                                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let Screenshare;
module.link("/imports/api/screenshare", {
  default(v) {
    Screenshare = v;
  }

}, 0);
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 1);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 2);
let extractCredentials;
module.link("/imports/api/common/server/helpers", {
  extractCredentials(v) {
    extractCredentials = v;
  }

}, 3);

function screenshare() {
  if (!this.userId) {
    return Screenshare.find({
      meetingId: ''
    });
  }

  const {
    meetingId,
    requesterUserId
  } = extractCredentials(this.userId);
  Logger.debug(`Publishing Screenshare for ${meetingId} ${requesterUserId}`);
  return Screenshare.find({
    meetingId
  });
}

function publish(...args) {
  const boundScreenshare = screenshare.bind(this);
  return boundScreenshare(...args);
}

Meteor.publish('screenshare', publish);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"index.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/screenshare/index.js                                                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
const Screenshare = new Mongo.Collection('screenshare');

if (Meteor.isServer) {
  // types of queries for the screenshare:
  // 1. meetingId
  Screenshare._ensureIndex({
    meetingId: 1
  });
}

module.exportDefault(Screenshare);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"slides":{"server":{"handlers":{"slideChange.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/slides/server/handlers/slideChange.js                                                                   //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => handleSlideChange
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let changeCurrentSlide;
module.link("../modifiers/changeCurrentSlide", {
  default(v) {
    changeCurrentSlide = v;
  }

}, 1);

function handleSlideChange({
  body
}, meetingId) {
  const {
    pageId,
    presentationId,
    podId
  } = body;
  check(pageId, String);
  check(presentationId, String);
  check(podId, String);
  return changeCurrentSlide(meetingId, podId, presentationId, pageId);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"slideResize.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/slides/server/handlers/slideResize.js                                                                   //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => handleSlideResize
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let resizeSlide;
module.link("../modifiers/resizeSlide", {
  default(v) {
    resizeSlide = v;
  }

}, 1);

function handleSlideResize({
  body
}, meetingId) {
  check(meetingId, String);
  check(body, Object);
  return resizeSlide(meetingId, body);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"methods":{"switchSlide.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/slides/server/methods/switchSlide.js                                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => switchSlide
});
let Presentations;
module.link("/imports/api/presentations", {
  default(v) {
    Presentations = v;
  }

}, 0);
let Slides;
module.link("/imports/api/slides", {
  Slides(v) {
    Slides = v;
  }

}, 1);
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 2);
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 3);
let RedisPubSub;
module.link("/imports/startup/server/redis", {
  default(v) {
    RedisPubSub = v;
  }

}, 4);
let extractCredentials;
module.link("/imports/api/common/server/helpers", {
  extractCredentials(v) {
    extractCredentials = v;
  }

}, 5);

function switchSlide(slideNumber, podId) {
  // TODO-- send presentationId and SlideId
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'SetCurrentPagePubMsg';
  const {
    meetingId,
    requesterUserId
  } = extractCredentials(this.userId);
  check(slideNumber, Number);
  const selector = {
    meetingId,
    podId,
    current: true
  };
  const Presentation = Presentations.findOne(selector);

  if (!Presentation) {
    throw new Meteor.Error('presentation-not-found', 'You need a presentation to be able to switch slides');
  }

  const Slide = Slides.findOne({
    meetingId,
    podId,
    presentationId: Presentation.id,
    num: slideNumber
  });

  if (!Slide) {
    throw new Meteor.Error('slide-not-found', `Slide number ${slideNumber} not found in the current presentation`);
  }

  const payload = {
    podId,
    presentationId: Presentation.id,
    pageId: Slide.id
  };
  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"zoomSlide.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/slides/server/methods/zoomSlide.js                                                                      //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => zoomSlide
});
let Presentations;
module.link("/imports/api/presentations", {
  default(v) {
    Presentations = v;
  }

}, 0);
let Slides;
module.link("/imports/api/slides", {
  Slides(v) {
    Slides = v;
  }

}, 1);
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 2);
let RedisPubSub;
module.link("/imports/startup/server/redis", {
  default(v) {
    RedisPubSub = v;
  }

}, 3);
let extractCredentials;
module.link("/imports/api/common/server/helpers", {
  extractCredentials(v) {
    extractCredentials = v;
  }

}, 4);

function zoomSlide(slideNumber, podId, widthRatio, heightRatio, x, y) {
  // TODO-- send presentationId and SlideId
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'ResizeAndMovePagePubMsg';
  const {
    meetingId,
    requesterUserId
  } = extractCredentials(this.userId);
  const selector = {
    meetingId,
    podId,
    current: true
  };
  const Presentation = Presentations.findOne(selector);

  if (!Presentation) {
    throw new Meteor.Error('presentation-not-found', 'You need a presentation to be able to switch slides');
  }

  const Slide = Slides.findOne({
    meetingId,
    podId,
    presentationId: Presentation.id,
    num: slideNumber
  });

  if (!Slide) {
    throw new Meteor.Error('slide-not-found', `Slide number ${slideNumber} not found in the current presentation`);
  }

  const payload = {
    podId,
    presentationId: Presentation.id,
    pageId: Slide.id,
    xOffset: x,
    yOffset: y,
    widthRatio,
    heightRatio
  };
  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"modifiers":{"addSlide.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/slides/server/modifiers/addSlide.js                                                                     //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

module.export({
  default: () => addSlide
});
let probe;
module.link("probe-image-size", {
  default(v) {
    probe = v;
  }

}, 0);
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 1);
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 2);
let flat;
module.link("flat", {
  default(v) {
    flat = v;
  }

}, 3);
let RedisPubSub;
module.link("/imports/startup/server/redis", {
  default(v) {
    RedisPubSub = v;
  }

}, 4);
let Slides;
module.link("/imports/api/slides", {
  Slides(v) {
    Slides = v;
  }

}, 5);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 6);
let SVG, PNG;
module.link("/imports/utils/mimeTypes", {
  SVG(v) {
    SVG = v;
  },

  PNG(v) {
    PNG = v;
  }

}, 7);
let calculateSlideData;
module.link("/imports/api/slides/server/helpers", {
  default(v) {
    calculateSlideData = v;
  }

}, 8);
let addSlidePositions;
module.link("./addSlidePositions", {
  default(v) {
    addSlidePositions = v;
  }

}, 9);
const loadSlidesFromHttpAlways = Meteor.settings.private.app.loadSlidesFromHttpAlways || false;

const requestWhiteboardHistory = (meetingId, slideId) => {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'GetWhiteboardAnnotationsReqMsg';
  const USER_ID = 'nodeJSapp';
  const payload = {
    whiteboardId: slideId
  };
  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, USER_ID, payload);
};

const SUPPORTED_TYPES = [SVG, PNG];

const fetchImageSizes = imageUri => probe(imageUri).then(result => {
  if (!SUPPORTED_TYPES.includes(result.mime)) {
    throw new Meteor.Error('invalid-image-type', `received ${result.mime} expecting ${SUPPORTED_TYPES.join()}`);
  }

  return {
    width: result.width,
    height: result.height
  };
}).catch(reason => {
  Logger.error(`Error parsing image size. ${reason}. uri=${imageUri}`);
  return reason;
});

function addSlide(meetingId, podId, presentationId, slide) {
  check(podId, String);
  check(presentationId, String);
  check(slide, {
    id: String,
    num: Number,
    thumbUri: String,
    swfUri: String,
    txtUri: String,
    svgUri: String,
    current: Boolean,
    xOffset: Number,
    yOffset: Number,
    widthRatio: Number,
    heightRatio: Number,
    content: String
  });
  const {
    id: slideId,
    xOffset,
    yOffset,
    widthRatio,
    heightRatio
  } = slide,
        restSlide = (0, _objectWithoutProperties2.default)(slide, ["id", "xOffset", "yOffset", "widthRatio", "heightRatio"]);
  const selector = {
    meetingId,
    podId,
    presentationId,
    id: slideId
  };
  const imageUri = slide.svgUri || slide.pngUri;
  const modifier = {
    $set: Object.assign({
      meetingId
    }, {
      podId
    }, {
      presentationId
    }, {
      id: slideId
    }, {
      imageUri
    }, flat(restSlide), {
      safe: true
    })
  };

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Adding slide to collection: ${err}`);
    }

    const {
      insertedId
    } = numChanged;
    requestWhiteboardHistory(meetingId, slideId);

    if (insertedId) {
      return Logger.info(`Added slide id=${slideId} pod=${podId} presentation=${presentationId}`);
    }

    return Logger.info(`Upserted slide id=${slideId} pod=${podId} presentation=${presentationId}`);
  };

  const imageSizeUri = loadSlidesFromHttpAlways ? imageUri.replace(/^https/i, 'http') : imageUri;
  return fetchImageSizes(imageSizeUri).then(({
    width,
    height
  }) => {
    // there is a rare case when for a very long not-active meeting the presentation
    // files just disappear and width/height can't be retrieved
    if (width && height) {
      // pre-calculating the width, height, and vieBox coordinates / dimensions
      // to unload the client-side
      const slideData = {
        width,
        height,
        xOffset,
        yOffset,
        widthRatio,
        heightRatio
      };
      const slidePosition = calculateSlideData(slideData);
      addSlidePositions(meetingId, podId, presentationId, slideId, slidePosition);
    }

    return Slides.upsert(selector, modifier, cb);
  }).catch(reason => Logger.error(`Error parsing image size. ${reason}. slide=${slideId} uri=${imageUri}`));
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"addSlidePositions.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/slides/server/modifiers/addSlidePositions.js                                                            //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => addSlidePositions
});
let SlidePositions;
module.link("/imports/api/slides", {
  SlidePositions(v) {
    SlidePositions = v;
  }

}, 0);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 1);
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 2);
let flat;
module.link("flat", {
  default(v) {
    flat = v;
  }

}, 3);

function addSlidePositions(meetingId, podId, presentationId, slideId, slidePosition) {
  check(meetingId, String);
  check(podId, String);
  check(presentationId, String);
  check(slideId, String);
  check(slidePosition, {
    width: Number,
    height: Number,
    x: Number,
    y: Number,
    viewBoxWidth: Number,
    viewBoxHeight: Number
  });
  const selector = {
    meetingId,
    podId,
    presentationId,
    id: slideId
  };
  const modifier = {
    $set: Object.assign({
      meetingId
    }, {
      podId
    }, {
      presentationId
    }, {
      id: slideId
    }, flat(slidePosition), {
      safe: true
    })
  };

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Adding slide position to collection: ${err}`);
    }

    const {
      insertedId
    } = numChanged;

    if (insertedId) {
      return Logger.info(`Added slide position id=${slideId} pod=${podId} presentation=${presentationId}`);
    }

    return Logger.info(`Upserted slide position id=${slideId} pod=${podId} presentation=${presentationId}`);
  };

  return SlidePositions.upsert(selector, modifier, cb);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"changeCurrentSlide.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/slides/server/modifiers/changeCurrentSlide.js                                                           //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => changeCurrentSlide
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let Slides;
module.link("/imports/api/slides", {
  Slides(v) {
    Slides = v;
  }

}, 1);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 2);

function changeCurrentSlide(meetingId, podId, presentationId, slideId) {
  check(meetingId, String);
  check(presentationId, String);
  check(slideId, String);
  check(podId, String);
  const oldCurrent = {
    selector: {
      meetingId,
      podId,
      presentationId,
      current: true
    },
    modifier: {
      $set: {
        current: false
      }
    },
    callback: err => {
      if (err) {
        return Logger.error(`Unsetting the current slide: ${err}`);
      }

      return Logger.info('Unsetted the current slide');
    }
  };
  const newCurrent = {
    selector: {
      meetingId,
      podId,
      presentationId,
      id: slideId
    },
    modifier: {
      $set: {
        current: true
      }
    },
    callback: err => {
      if (err) {
        return Logger.error(`Setting as current slide id=${slideId}: ${err}`);
      }

      return Logger.info(`Setted as current slide id=${slideId}`);
    }
  };
  const oldSlide = Slides.findOne(oldCurrent.selector);
  const newSlide = Slides.findOne(newCurrent.selector); // if the oldCurrent and newCurrent have the same ids

  if (oldSlide && newSlide && oldSlide._id === newSlide._id) {
    return;
  }

  if (newSlide) {
    Slides.update(newSlide._id, newCurrent.modifier, newCurrent.callback);
  }

  if (oldSlide) {
    Slides.update(oldSlide._id, oldCurrent.modifier, oldCurrent.callback);
  }
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"clearSlides.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/slides/server/modifiers/clearSlides.js                                                                  //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => clearSlides
});
let Slides, SlidePositions;
module.link("/imports/api/slides", {
  Slides(v) {
    Slides = v;
  },

  SlidePositions(v) {
    SlidePositions = v;
  }

}, 0);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 1);

function clearSlides(meetingId) {
  if (meetingId) {
    SlidePositions.remove({
      meetingId
    }, () => {
      Logger.info(`Cleared SlidePositions (${meetingId})`);
    });
    return Slides.remove({
      meetingId
    }, () => {
      Logger.info(`Cleared Slides (${meetingId})`);
    });
  }

  SlidePositions.remove({}, () => {
    Logger.info('Cleared SlidePositions (all)');
  });
  return Slides.remove({}, () => {
    Logger.info('Cleared Slides (all)');
  });
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"clearSlidesPresentation.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/slides/server/modifiers/clearSlidesPresentation.js                                                      //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => clearSlidesPresentation
});
let Slides, SlidePositions;
module.link("/imports/api/slides", {
  Slides(v) {
    Slides = v;
  },

  SlidePositions(v) {
    SlidePositions = v;
  }

}, 0);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 1);
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 2);
let clearAnnotations;
module.link("/imports/api/annotations/server/modifiers/clearAnnotations", {
  default(v) {
    clearAnnotations = v;
  }

}, 3);

function clearSlidesPresentation(meetingId, presentationId) {
  check(meetingId, String);
  check(presentationId, String);
  const selector = {
    meetingId,
    presentationId
  };
  const whiteboardIds = Slides.find(selector, {
    fields: {
      id: 1
    }
  }).map(row => row.id);

  const cb = err => {
    if (err) {
      return Logger.error(`Removing Slides from collection: ${err}`);
    }

    whiteboardIds.forEach(whiteboardId => clearAnnotations(meetingId, whiteboardId));
    return Logger.info(`Removed Slides where presentationId=${presentationId}`);
  };

  SlidePositions.remove(selector);
  return Slides.remove(selector, cb);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"resizeSlide.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/slides/server/modifiers/resizeSlide.js                                                                  //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => resizeSlide
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let SlidePositions;
module.link("/imports/api/slides", {
  SlidePositions(v) {
    SlidePositions = v;
  }

}, 1);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 2);
let calculateSlideData;
module.link("/imports/api/slides/server/helpers", {
  default(v) {
    calculateSlideData = v;
  }

}, 3);

function resizeSlide(meetingId, slide) {
  check(meetingId, String);
  const {
    podId,
    presentationId,
    pageId,
    widthRatio,
    heightRatio,
    xOffset,
    yOffset
  } = slide;
  const selector = {
    meetingId,
    podId,
    presentationId,
    id: pageId
  }; // fetching the current slide data
  // and pre-calculating the width, height, and vieBox coordinates / sizes
  // to reduce the client-side load

  const SlidePosition = SlidePositions.findOne(selector);

  if (SlidePosition) {
    const {
      width,
      height
    } = SlidePosition;
    const slideData = {
      width,
      height,
      xOffset,
      yOffset,
      widthRatio,
      heightRatio
    };
    const calculatedData = calculateSlideData(slideData);
    const modifier = {
      $set: calculatedData
    };

    const cb = (err, numChanged) => {
      if (err) {
        return Logger.error(`Resizing slide positions id=${pageId}: ${err}`);
      }

      if (numChanged) {
        return Logger.debug(`Resized slide positions id=${pageId}`);
      }

      return Logger.info(`No slide positions found with id=${pageId}`);
    };

    return SlidePositions.update(selector, modifier, cb);
  }
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"eventHandlers.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/slides/server/eventHandlers.js                                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let RedisPubSub;
module.link("/imports/startup/server/redis", {
  default(v) {
    RedisPubSub = v;
  }

}, 0);
let handleSlideResize;
module.link("./handlers/slideResize", {
  default(v) {
    handleSlideResize = v;
  }

}, 1);
let handleSlideChange;
module.link("./handlers/slideChange", {
  default(v) {
    handleSlideChange = v;
  }

}, 2);
RedisPubSub.on('ResizeAndMovePageEvtMsg', handleSlideResize);
RedisPubSub.on('SetCurrentPageEvtMsg', handleSlideChange);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"helpers.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/slides/server/helpers.js                                                                                //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
const calculateSlideData = slideData => {
  const {
    width,
    height,
    xOffset,
    yOffset,
    widthRatio,
    heightRatio
  } = slideData; // calculating viewBox and offsets for the current presentation

  return {
    width,
    height,
    x: -xOffset * 2 * width / 100,
    y: -yOffset * 2 * height / 100,
    viewBoxWidth: width * widthRatio / 100,
    viewBoxHeight: height * heightRatio / 100
  };
};

module.exportDefault(calculateSlideData);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/slides/server/index.js                                                                                  //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.link("./eventHandlers");
module.link("./methods");
module.link("./publishers");
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"methods.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/slides/server/methods.js                                                                                //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let switchSlide;
module.link("./methods/switchSlide", {
  default(v) {
    switchSlide = v;
  }

}, 1);
let zoomSlide;
module.link("./methods/zoomSlide", {
  default(v) {
    zoomSlide = v;
  }

}, 2);
Meteor.methods({
  switchSlide,
  zoomSlide
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"publishers.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/slides/server/publishers.js                                                                             //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let Slides, SlidePositions;
module.link("/imports/api/slides", {
  Slides(v) {
    Slides = v;
  },

  SlidePositions(v) {
    SlidePositions = v;
  }

}, 0);
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 1);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 2);
let extractCredentials;
module.link("/imports/api/common/server/helpers", {
  extractCredentials(v) {
    extractCredentials = v;
  }

}, 3);

function slides() {
  if (!this.userId) {
    return Slides.find({
      meetingId: ''
    });
  }

  const {
    meetingId,
    requesterUserId
  } = extractCredentials(this.userId);
  Logger.debug(`Publishing Slides for ${meetingId} ${requesterUserId}`);
  return Slides.find({
    meetingId
  });
}

function publish(...args) {
  const boundSlides = slides.bind(this);
  return boundSlides(...args);
}

Meteor.publish('slides', publish);

function slidePositions() {
  if (!this.userId) {
    return SlidePositions.find({
      meetingId: ''
    });
  }

  const {
    meetingId,
    requesterUserId
  } = extractCredentials(this.userId);
  Logger.debug(`Publishing SlidePositions for ${meetingId} ${requesterUserId}`);
  return SlidePositions.find({
    meetingId
  });
}

function publishPositions(...args) {
  const boundSlidePositions = slidePositions.bind(this);
  return boundSlidePositions(...args);
}

Meteor.publish('slide-positions', publishPositions);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"index.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/slides/index.js                                                                                         //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  Slides: () => Slides,
  SlidePositions: () => SlidePositions
});
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
const Slides = new Mongo.Collection('slides');
const SlidePositions = new Mongo.Collection('slide-positions');

if (Meteor.isServer) {
  // types of queries for the slides:
  // 1. meetingId                                  ( 1 )
  // 2. meetingId, podId                           ( 1 )
  // 3. meetingId, presentationId                  ( 1 )
  // 3. meetingId, presentationId, num             ( 1 )
  // 4. meetingId, podId, presentationId, id       ( 3 ) - incl. resizeSlide, which can be intense
  // 5. meetingId, podId, presentationId, current  ( 1 )
  Slides._ensureIndex({
    meetingId: 1,
    podId: 1,
    presentationId: 1,
    id: 1
  });

  SlidePositions._ensureIndex({
    meetingId: 1,
    podId: 1,
    presentationId: 1,
    id: 1
  });
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"users":{"server":{"handlers":{"changeRole.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/users/server/handlers/changeRole.js                                                                     //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => handleChangeRole
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let changeRole;
module.link("/imports/api/users/server/modifiers/changeRole", {
  default(v) {
    changeRole = v;
  }

}, 1);

function handleChangeRole(payload, meetingId) {
  check(payload.body, Object);
  check(meetingId, String);
  const {
    userId,
    role,
    changedBy
  } = payload.body;
  return changeRole(role, userId, meetingId, changedBy);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"emojiStatus.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/users/server/handlers/emojiStatus.js                                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => handleEmojiStatus
});
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 0);
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 1);
let Users;
module.link("/imports/api/users", {
  default(v) {
    Users = v;
  }

}, 2);

function handleEmojiStatus({
  body
}, meetingId) {
  const {
    userId,
    emoji
  } = body;
  check(userId, String);
  check(emoji, String);
  const selector = {
    meetingId,
    userId
  };
  const modifier = {
    $set: {
      emojiTime: new Date().getTime(),
      emoji
    }
  };

  const cb = (err, numChanged) => {
    if (err) {
      Logger.error(`Assigning user emoji status: ${err}`);
      return;
    }

    if (numChanged) {
      Logger.info(`Assigned user emoji status ${emoji} id=${userId} meeting=${meetingId}`);
    }
  };

  return Users.update(selector, modifier, cb);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"getUsers.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/users/server/handlers/getUsers.js                                                                       //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => handleGetUsers
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let Users;
module.link("/imports/api/users/", {
  default(v) {
    Users = v;
  }

}, 1);
let addUser;
module.link("../modifiers/addUser", {
  default(v) {
    addUser = v;
  }

}, 2);
let removeUser;
module.link("../modifiers/removeUser", {
  default(v) {
    removeUser = v;
  }

}, 3);

function handleGetUsers({
  body
}, meetingId) {
  const {
    users
  } = body;
  check(meetingId, String);
  check(users, Array);
  const usersIds = users.map(m => m.intId);
  const usersToRemove = Users.find({
    meetingId,
    userId: {
      $nin: usersIds
    }
  }, {
    fields: {
      userId: 1
    }
  }).fetch();
  usersToRemove.forEach(user => removeUser(meetingId, user.userId));
  const usersAdded = [];
  users.forEach(user => {
    usersAdded.push(addUser(meetingId, user));
  });
  return usersAdded;
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"presenterAssigned.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/users/server/handlers/presenterAssigned.js                                                              //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => handlePresenterAssigned
});
let Users;
module.link("/imports/api/users", {
  default(v) {
    Users = v;
  }

}, 0);
let PresentationPods;
module.link("/imports/api/presentation-pods", {
  default(v) {
    PresentationPods = v;
  }

}, 1);
let changePresenter;
module.link("/imports/api/users/server/modifiers/changePresenter", {
  default(v) {
    changePresenter = v;
  }

}, 2);
let RedisPubSub;
module.link("/imports/startup/server/redis", {
  default(v) {
    RedisPubSub = v;
  }

}, 3);

function setPresenterInPodReqMsg(credentials) {
  // TODO-- switch to meetingId, etc
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'SetPresenterInPodReqMsg';
  const {
    meetingId,
    requesterUserId,
    presenterId
  } = credentials;
  const payload = {
    podId: 'DEFAULT_PRESENTATION_POD',
    nextPresenterId: presenterId
  };
  RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}

function handlePresenterAssigned({
  body
}, meetingId) {
  const {
    presenterId,
    assignedBy
  } = body;
  changePresenter(true, presenterId, meetingId, assignedBy);
  const selector = {
    meetingId,
    userId: {
      $ne: presenterId
    },
    presenter: true
  };
  const prevPresenter = Users.findOne(selector); // no previous presenters
  // The below code is responsible for set Meeting presenter to be default pod presenter as well.
  // It's been handled here because right now akka-apps don't handle all cases scenarios.

  if (!prevPresenter) {
    const setPresenterPayload = {
      meetingId,
      requesterUserId: assignedBy,
      presenterId
    };
    const defaultPodSelector = {
      meetingId,
      podId: 'DEFAULT_PRESENTATION_POD'
    };
    const currentDefaultPodPresenter = PresentationPods.findOne(defaultPodSelector);
    const {
      currentPresenterId
    } = currentDefaultPodPresenter;

    if (currentPresenterId === '') {
      return setPresenterInPodReqMsg(setPresenterPayload);
    }

    const oldPresenter = Users.findOne({
      meetingId,
      userId: currentPresenterId,
      connectionStatus: 'offline'
    });

    if (oldPresenter) {
      return setPresenterInPodReqMsg(setPresenterPayload);
    }

    return true;
  }

  return changePresenter(false, prevPresenter.userId, meetingId, assignedBy);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"removeUser.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/users/server/handlers/removeUser.js                                                                     //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => handleRemoveUser
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let removeUser;
module.link("../modifiers/removeUser", {
  default(v) {
    removeUser = v;
  }

}, 1);

function handleRemoveUser({
  body
}, meetingId) {
  const {
    intId
  } = body;
  check(meetingId, String);
  check(intId, String);
  return removeUser(meetingId, intId);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"userEjected.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/users/server/handlers/userEjected.js                                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => handleEjectedUser
});
let userEjected;
module.link("../modifiers/userEjected", {
  default(v) {
    userEjected = v;
  }

}, 0);

function handleEjectedUser({
  header,
  body
}) {
  const {
    meetingId,
    userId
  } = header;
  const {
    reasonCode
  } = body;
  return userEjected(meetingId, userId, reasonCode);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"userInactivityInspect.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/users/server/handlers/userInactivityInspect.js                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => handleUserInactivityInspect
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let userInactivityInspect;
module.link("../modifiers/userInactivityInspect", {
  default(v) {
    userInactivityInspect = v;
  }

}, 1);

function handleUserInactivityInspect({
  header,
  body
}, meetingId) {
  const {
    userId
  } = header;
  const {
    responseDelay
  } = body;
  check(userId, String);
  check(responseDelay, Match.Integer);
  check(meetingId, String);
  return userInactivityInspect(userId, responseDelay);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"userJoin.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/users/server/handlers/userJoin.js                                                                       //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => userJoin
});
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 1);
let RedisPubSub;
module.link("/imports/startup/server/redis", {
  default(v) {
    RedisPubSub = v;
  }

}, 2);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 3);

function userJoin(meetingId, userId, authToken) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'UserJoinMeetingReqMsg';
  check(authToken, String);
  const payload = {
    userId,
    authToken,
    clientType: 'HTML5'
  };
  Logger.info(`User='${userId}' is joining meeting='${meetingId}' authToken='${authToken}'`);
  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, userId, payload);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"userJoined.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/users/server/handlers/userJoined.js                                                                     //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => handleUserJoined
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let addUser;
module.link("../modifiers/addUser", {
  default(v) {
    addUser = v;
  }

}, 1);

function handleUserJoined({
  body
}, meetingId) {
  const user = body;
  check(user, Object);
  return addUser(meetingId, user);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"validateAuthToken.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/users/server/handlers/validateAuthToken.js                                                              //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => handleValidateAuthToken
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 1);
let Users;
module.link("/imports/api/users", {
  default(v) {
    Users = v;
  }

}, 2);
let userJoin;
module.link("./userJoin", {
  default(v) {
    userJoin = v;
  }

}, 3);
let pendingAuthenticationsStore;
module.link("../store/pendingAuthentications", {
  default(v) {
    pendingAuthenticationsStore = v;
  }

}, 4);
let createDummyUser;
module.link("../modifiers/createDummyUser", {
  default(v) {
    createDummyUser = v;
  }

}, 5);
let setConnectionIdAndAuthToken;
module.link("../modifiers/setConnectionIdAndAuthToken", {
  default(v) {
    setConnectionIdAndAuthToken = v;
  }

}, 6);

const clearOtherSessions = (sessionUserId, current = false) => {
  const serverSessions = Meteor.server.sessions;
  Object.keys(serverSessions).filter(i => serverSessions[i].userId === sessionUserId).filter(i => i !== current).forEach(i => serverSessions[i].close());
};

function handleValidateAuthToken({
  body
}, meetingId) {
  const {
    userId,
    valid,
    authToken,
    waitForApproval
  } = body;
  check(userId, String);
  check(authToken, String);
  check(valid, Boolean);
  check(waitForApproval, Boolean);
  const pendingAuths = pendingAuthenticationsStore.take(meetingId, userId, authToken);

  if (!valid) {
    pendingAuths.forEach(pendingAuth => {
      try {
        const {
          methodInvocationObject
        } = pendingAuth;
        const connectionId = methodInvocationObject.connection.id;
        methodInvocationObject.connection.close();
        Logger.info(`Closed connection ${connectionId} due to invalid auth token.`);
      } catch (e) {
        Logger.error(`Error closing socket for meetingId '${meetingId}', userId '${userId}', authToken ${authToken}`);
      }
    });
    return;
  }

  if (valid) {
    // Define user ID on connections
    pendingAuths.forEach(pendingAuth => {
      const {
        methodInvocationObject
      } = pendingAuth;
      /* Logic migrated from validateAuthToken method ( postponed to only run in case of success response ) - Begin */

      const sessionId = `${meetingId}--${userId}`;
      methodInvocationObject.setUserId(sessionId);
      const User = Users.findOne({
        meetingId,
        userId: userId
      });

      if (!User) {
        createDummyUser(meetingId, userId, authToken);
      }

      setConnectionIdAndAuthToken(meetingId, userId, methodInvocationObject.connection.id, authToken);
      /* End of logic migrated from validateAuthToken */
    });
  }

  const selector = {
    meetingId,
    userId,
    clientType: 'HTML5'
  };
  const User = Users.findOne(selector); // If we dont find the user on our collection is a flash user and we can skip

  if (!User) return; // Publish user join message

  if (valid && !waitForApproval) {
    Logger.info('User=', User);
    userJoin(meetingId, userId, User.authToken);
  }

  const modifier = {
    $set: {
      validated: valid,
      approved: !waitForApproval,
      loginTime: Date.now(),
      inactivityCheck: false
    }
  };

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Validating auth token: ${err}`);
    }

    if (numChanged) {
      if (valid) {
        const sessionUserId = `${meetingId}-${userId}`;
        const currentConnectionId = User.connectionId ? User.connectionId : false;
        clearOtherSessions(sessionUserId, currentConnectionId);
      }

      return Logger.info(`Validated auth token as ${valid} user=${userId} meeting=${meetingId}`);
    }

    return Logger.info('No auth to validate');
  };

  Users.update(selector, modifier, cb);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"methods":{"assignPresenter.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/users/server/methods/assignPresenter.js                                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => assignPresenter
});
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 1);
let RedisPubSub;
module.link("/imports/startup/server/redis", {
  default(v) {
    RedisPubSub = v;
  }

}, 2);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 3);
let Users;
module.link("/imports/api/users", {
  default(v) {
    Users = v;
  }

}, 4);
let extractCredentials;
module.link("/imports/api/common/server/helpers", {
  extractCredentials(v) {
    extractCredentials = v;
  }

}, 5);

function assignPresenter(userId) {
  // TODO-- send username from client side
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'AssignPresenterReqMsg';
  const {
    meetingId,
    requesterUserId
  } = extractCredentials(this.userId);
  check(userId, String);
  const User = Users.findOne({
    meetingId,
    userId
  });

  if (!User) {
    throw new Meteor.Error('user-not-found', 'You need a valid user to be able to set presenter');
  }

  const payload = {
    newPresenterId: userId,
    newPresenterName: User.name,
    assignedBy: requesterUserId,
    requesterId: requesterUserId
  };
  Logger.verbose(`User '${userId}' setted as presenter by '${requesterUserId}' from meeting '${meetingId}'`);
  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"changeRole.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/users/server/methods/changeRole.js                                                                      //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => changeRole
});
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 1);
let RedisPubSub;
module.link("/imports/startup/server/redis", {
  default(v) {
    RedisPubSub = v;
  }

}, 2);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 3);
let extractCredentials;
module.link("/imports/api/common/server/helpers", {
  extractCredentials(v) {
    extractCredentials = v;
  }

}, 4);

function changeRole(userId, role) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'ChangeUserRoleCmdMsg';
  const {
    meetingId,
    requesterUserId
  } = extractCredentials(this.userId);
  check(userId, String);
  check(role, String);
  const payload = {
    userId,
    role,
    changedBy: requesterUserId
  };
  Logger.verbose(`User '${userId}' set as '${role} role by '${requesterUserId}' from meeting '${meetingId}'`);
  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"removeUser.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/users/server/methods/removeUser.js                                                                      //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => removeUser
});
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 1);
let RedisPubSub;
module.link("/imports/startup/server/redis", {
  default(v) {
    RedisPubSub = v;
  }

}, 2);
let extractCredentials;
module.link("/imports/api/common/server/helpers", {
  extractCredentials(v) {
    extractCredentials = v;
  }

}, 3);

function removeUser(userId) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'EjectUserFromMeetingCmdMsg';
  const {
    meetingId,
    requesterUserId: ejectedBy
  } = extractCredentials(this.userId);
  check(userId, String);
  const payload = {
    userId,
    ejectedBy
  };
  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, ejectedBy, payload);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"setEmojiStatus.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/users/server/methods/setEmojiStatus.js                                                                  //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => setEmojiStatus
});
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 1);
let RedisPubSub;
module.link("/imports/startup/server/redis", {
  default(v) {
    RedisPubSub = v;
  }

}, 2);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 3);
let extractCredentials;
module.link("/imports/api/common/server/helpers", {
  extractCredentials(v) {
    extractCredentials = v;
  }

}, 4);

function setEmojiStatus(userId, status) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'ChangeUserEmojiCmdMsg';
  const {
    meetingId,
    requesterUserId
  } = extractCredentials(this.userId);
  check(userId, String);
  const payload = {
    emoji: status,
    userId
  };
  Logger.verbose(`User '${userId}' emoji status updated to '${status}' by '${requesterUserId}' from meeting '${meetingId}'`);
  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"setUserEffectiveConnectionType.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/users/server/methods/setUserEffectiveConnectionType.js                                                  //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => setUserEffectiveConnectionType
});
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 1);
let RedisPubSub;
module.link("/imports/startup/server/redis", {
  default(v) {
    RedisPubSub = v;
  }

}, 2);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 3);
let extractCredentials;
module.link("/imports/api/common/server/helpers", {
  extractCredentials(v) {
    extractCredentials = v;
  }

}, 4);
let setEffectiveConnectionType;
module.link("../modifiers/setUserEffectiveConnectionType", {
  default(v) {
    setEffectiveConnectionType = v;
  }

}, 5);

function setUserEffectiveConnectionType(effectiveConnectionType) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'ChangeUserEffectiveConnectionMsg';
  const {
    meetingId,
    requesterUserId
  } = extractCredentials(this.userId);
  check(effectiveConnectionType, String);
  const payload = {
    meetingId,
    userId: requesterUserId,
    effectiveConnectionType
  };
  setEffectiveConnectionType(meetingId, requesterUserId, effectiveConnectionType);
  Logger.verbose(`User ${requesterUserId} effective connection updated to ${effectiveConnectionType}`);
  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"toggleUserLock.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/users/server/methods/toggleUserLock.js                                                                  //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => toggleUserLock
});
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 1);
let RedisPubSub;
module.link("/imports/startup/server/redis", {
  default(v) {
    RedisPubSub = v;
  }

}, 2);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 3);
let extractCredentials;
module.link("/imports/api/common/server/helpers", {
  extractCredentials(v) {
    extractCredentials = v;
  }

}, 4);

function toggleUserLock(userId, lock) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'LockUserInMeetingCmdMsg';
  const {
    meetingId,
    requesterUserId: lockedBy
  } = extractCredentials(this.userId);
  check(lockedBy, String);
  check(userId, String);
  check(lock, Boolean);
  const payload = {
    lockedBy,
    userId,
    lock
  };
  Logger.verbose(`User ${lockedBy} updated lock status from ${userId} to ${lock}
  in meeting ${meetingId}`);
  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, lockedBy, payload);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"userActivitySign.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/users/server/methods/userActivitySign.js                                                                //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => userActivitySign
});
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let Users;
module.link("/imports/api/users", {
  default(v) {
    Users = v;
  }

}, 1);
let RedisPubSub;
module.link("/imports/startup/server/redis", {
  default(v) {
    RedisPubSub = v;
  }

}, 2);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 3);
let extractCredentials;
module.link("/imports/api/common/server/helpers", {
  extractCredentials(v) {
    extractCredentials = v;
  }

}, 4);

function userActivitySign() {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'UserActivitySignCmdMsg';
  const {
    meetingId,
    requesterUserId: userId
  } = extractCredentials(this.userId);
  const payload = {
    userId
  };
  const selector = {
    userId
  };
  const modifier = {
    $set: {
      inactivityCheck: false
    }
  };
  Users.update(selector, modifier); // TODO-- we should move this to a modifier

  Logger.info(`User ${userId} sent a activity sign for meeting ${meetingId}`);
  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, userId, payload);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"userLeaving.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/users/server/methods/userLeaving.js                                                                     //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => userLeaving
});
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 1);
let RedisPubSub;
module.link("/imports/startup/server/redis", {
  default(v) {
    RedisPubSub = v;
  }

}, 2);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 3);
let Users;
module.link("/imports/api/users", {
  default(v) {
    Users = v;
  }

}, 4);

function userLeaving(meetingId, userId, connectionId) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'UserLeaveReqMsg';
  check(userId, String);
  const selector = {
    meetingId,
    userId
  };
  const User = Users.findOne(selector);

  if (!User) {
    return Logger.info(`Skipping userLeaving. Could not find ${userId} in ${meetingId}`);
  } // If the current user connection is not the same that triggered the leave we skip


  if (User.connectionId !== connectionId) {
    return false;
  }

  const payload = {
    userId,
    sessionId: meetingId
  };
  Logger.info(`User '${userId}' is leaving meeting '${meetingId}'`);
  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, userId, payload);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"userLeftMeeting.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/users/server/methods/userLeftMeeting.js                                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => userLeftMeeting
});
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 0);
let Users;
module.link("/imports/api/users", {
  default(v) {
    Users = v;
  }

}, 1);
let extractCredentials;
module.link("/imports/api/common/server/helpers", {
  extractCredentials(v) {
    extractCredentials = v;
  }

}, 2);

function userLeftMeeting() {
  // TODO-- spread the code to method/modifier/handler
  // so we don't update the db in a method
  const {
    meetingId,
    requesterUserId
  } = extractCredentials(this.userId);
  const selector = {
    meetingId,
    userId: requesterUserId
  };

  const cb = (err, numChanged) => {
    if (err) {
      Logger.error(`leaving dummy user to collection: ${err}`);
      return;
    }

    if (numChanged) {
      Logger.info(`user left id=${requesterUserId} meeting=${meetingId}`);
    }
  };

  return Users.update(selector, {
    $set: {
      loggedOut: true
    }
  }, cb);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"validateAuthToken.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/users/server/methods/validateAuthToken.js                                                               //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => validateAuthToken
});
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let RedisPubSub;
module.link("/imports/startup/server/redis", {
  default(v) {
    RedisPubSub = v;
  }

}, 1);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 2);
let pendingAuthenticationsStore;
module.link("../store/pendingAuthentications", {
  default(v) {
    pendingAuthenticationsStore = v;
  }

}, 3);

function validateAuthToken(meetingId, requesterUserId, requesterToken) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'ValidateAuthTokenReqMsg'; // Store reference of methodInvocationObject ( to postpone the connection userId definition )

  pendingAuthenticationsStore.add(meetingId, requesterUserId, requesterToken, this);
  const payload = {
    userId: requesterUserId,
    authToken: requesterToken
  };
  Logger.info(`User '${requesterUserId}' is trying to validate auth token for meeting '${meetingId}' from connection '${this.connection.id}'`);
  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"modifiers":{"addDialInUser.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/users/server/modifiers/addDialInUser.js                                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => addDialInUser
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let addUser;
module.link("/imports/api/users/server/modifiers/addUser", {
  default(v) {
    addUser = v;
  }

}, 1);

function addDialInUser(meetingId, voiceUser) {
  check(meetingId, String);
  check(voiceUser, Object);
  const USER_CONFIG = Meteor.settings.public.user;
  const ROLE_VIEWER = USER_CONFIG.role_viewer;
  const {
    intId,
    callerName
  } = voiceUser;
  const voiceOnlyUser = {
    intId,
    extId: intId,
    // TODO
    name: callerName,
    role: ROLE_VIEWER.toLowerCase(),
    guest: false,
    authed: true,
    waitingForAcceptance: false,
    guestStatus: 'ALLOW',
    emoji: 'none',
    presenter: false,
    locked: false,
    // TODO
    avatar: '',
    clientType: 'dial-in-user'
  };
  return addUser(meetingId, voiceOnlyUser);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"addUser.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/users/server/modifiers/addUser.js                                                                       //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => addUser
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 1);
let Users;
module.link("/imports/api/users", {
  default(v) {
    Users = v;
  }

}, 2);
let Meetings;
module.link("/imports/api/meetings", {
  default(v) {
    Meetings = v;
  }

}, 3);
let VoiceUsers;
module.link("/imports/api/voice-users/", {
  default(v) {
    VoiceUsers = v;
  }

}, 4);
let stringHash;
module.link("string-hash", {
  default(v) {
    stringHash = v;
  }

}, 5);
let flat;
module.link("flat", {
  default(v) {
    flat = v;
  }

}, 6);
let addVoiceUser;
module.link("/imports/api/voice-users/server/modifiers/addVoiceUser", {
  default(v) {
    addVoiceUser = v;
  }

}, 7);
const COLOR_LIST = ['#7b1fa2', '#6a1b9a', '#4a148c', '#5e35b1', '#512da8', '#4527a0', '#311b92', '#3949ab', '#303f9f', '#283593', '#1a237e', '#1976d2', '#1565c0', '#0d47a1', '#0277bd', '#01579b'];

function addUser(meetingId, user) {
  check(meetingId, String);
  check(user, {
    intId: String,
    extId: String,
    name: String,
    role: String,
    guest: Boolean,
    authed: Boolean,
    waitingForAcceptance: Match.Maybe(Boolean),
    guestStatus: String,
    emoji: String,
    presenter: Boolean,
    locked: Boolean,
    avatar: String,
    clientType: String
  });
  const userId = user.intId;
  const selector = {
    meetingId,
    userId
  };
  const Meeting = Meetings.findOne({
    meetingId
  });
  /* While the akka-apps dont generate a color we just pick one
    from a list based on the userId */

  const color = COLOR_LIST[stringHash(user.intId) % COLOR_LIST.length];
  const modifier = {
    $set: Object.assign({
      meetingId,
      connectionStatus: 'online',
      sortName: user.name.trim().toLowerCase(),
      color,
      breakoutProps: {
        isBreakoutUser: Meeting.meetingProp.isBreakout,
        parentId: Meeting.breakoutProps.parentId
      },
      effectiveConnectionType: null,
      inactivityCheck: false,
      responseDelay: 0,
      loggedOut: false
    }, flat(user))
  }; // Only add an empty VoiceUser if there isn't one already and if the user coming in isn't a
  // dial-in user. We want to avoid overwriting good data

  if (user.clientType !== 'dial-in-user' && !VoiceUsers.findOne({
    meetingId,
    intId: userId
  })) {
    addVoiceUser(meetingId, {
      voiceUserId: '',
      intId: userId,
      callerName: user.name,
      callerNum: '',
      muted: false,
      talking: false,
      callingWith: '',
      listenOnly: false,
      voiceConf: '',
      joined: false
    });
  }

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Adding user to collection: ${err}`);
    }

    const {
      insertedId
    } = numChanged;

    if (insertedId) {
      return Logger.info(`Added user id=${userId} meeting=${meetingId}`);
    }

    return Logger.info(`Upserted user id=${userId} meeting=${meetingId}`);
  };

  return Users.upsert(selector, modifier, cb);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"changePresenter.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/users/server/modifiers/changePresenter.js                                                               //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => changePresenter
});
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 0);
let Users;
module.link("/imports/api/users", {
  default(v) {
    Users = v;
  }

}, 1);
let Meetings;
module.link("/imports/api/meetings", {
  default(v) {
    Meetings = v;
  }

}, 2);
let stopWatchingExternalVideo;
module.link("/imports/api/external-videos/server/methods/stopWatchingExternalVideo", {
  default(v) {
    stopWatchingExternalVideo = v;
  }

}, 3);

function changePresenter(presenter, userId, meetingId, changedBy) {
  const selector = {
    meetingId,
    userId
  };
  const modifier = {
    $set: {
      presenter
    }
  };

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Changed user role: ${err}`);
    }

    if (numChanged) {
      return Logger.info(`Changed presenter=${presenter} id=${userId} meeting=${meetingId}` + `${changedBy ? ` changedBy=${changedBy}` : ''}`);
    }

    return null;
  };

  const meeting = Meetings.findOne({
    meetingId
  });

  if (meeting && meeting.externalVideoUrl) {
    Logger.info(`ChangePresenter:There is external video being shared. Stopping it due to presenter change, ${meeting.externalVideoUrl}`);
    stopWatchingExternalVideo({
      meetingId,
      requesterUserId: userId
    });
  }

  return Users.update(selector, modifier, cb);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"changeRole.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/users/server/modifiers/changeRole.js                                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => changeRole
});
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 0);
let Users;
module.link("/imports/api/users", {
  default(v) {
    Users = v;
  }

}, 1);

function changeRole(role, userId, meetingId, changedBy) {
  const selector = {
    meetingId,
    userId
  };
  const modifier = {
    $set: {
      role
    }
  };

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Changed user role: ${err}`);
    }

    if (numChanged) {
      return Logger.info(`Changed user role=${role} id=${userId} meeting=${meetingId}` + `${changedBy ? ` changedBy=${changedBy}` : ''}`);
    }

    return null;
  };

  return Users.update(selector, modifier, cb);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"clearUsers.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/users/server/modifiers/clearUsers.js                                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 0);
let Users;
module.link("/imports/api/users/index", {
  default(v) {
    Users = v;
  }

}, 1);

const clearUsers = meetingId => {
  if (meetingId) {
    return Users.remove({
      meetingId
    }, () => {
      Logger.info(`Cleared Users (${meetingId})`);
    });
  }

  return Users.remove({}, () => {
    Logger.info('Cleared Users (all)');
  });
};

module.exportDefault(clearUsers);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"createDummyUser.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/users/server/modifiers/createDummyUser.js                                                               //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => createDummyUser
});
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 1);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 2);
let Users;
module.link("/imports/api/users", {
  default(v) {
    Users = v;
  }

}, 3);

function createDummyUser(meetingId, userId, authToken) {
  check(meetingId, String);
  check(userId, String);
  check(authToken, String);
  const User = Users.findOne({
    meetingId,
    userId
  });

  if (User) {
    throw new Meteor.Error('existing-user', 'Tried to create a dummy user for an existing user');
  }

  const doc = {
    meetingId,
    userId,
    authToken,
    clientType: 'HTML5',
    validated: null
  };

  const cb = (err, numChanged) => {
    if (err) {
      Logger.error(`Creating dummy user to collection: ${err}`);
      return;
    }

    if (numChanged) {
      Logger.info(`Created dummy user id=${userId} token=${authToken} meeting=${meetingId}`);
    }
  };

  return Users.insert(doc, cb);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"removeUser.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/users/server/modifiers/removeUser.js                                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => removeUser
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let Users;
module.link("/imports/api/users", {
  default(v) {
    Users = v;
  }

}, 1);
let VideoStreams;
module.link("/imports/api/video-streams", {
  default(v) {
    VideoStreams = v;
  }

}, 2);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 3);
let stopWatchingExternalVideo;
module.link("/imports/api/external-videos/server/methods/stopWatchingExternalVideo", {
  default(v) {
    stopWatchingExternalVideo = v;
  }

}, 4);
let clearUserInfoForRequester;
module.link("/imports/api/users-infos/server/modifiers/clearUserInfoForRequester", {
  default(v) {
    clearUserInfoForRequester = v;
  }

}, 5);

const clearAllSessions = sessionUserId => {
  const serverSessions = Meteor.server.sessions;
  Object.keys(serverSessions).filter(i => serverSessions[i].userId === sessionUserId).forEach(i => serverSessions[i].close());
};

function removeUser(meetingId, userId) {
  check(meetingId, String);
  check(userId, String);
  const userToRemove = Users.findOne({
    userId,
    meetingId
  });

  if (userToRemove) {
    const {
      presenter
    } = userToRemove;

    if (presenter) {
      stopWatchingExternalVideo({
        meetingId,
        requesterUserId: userId
      });
    }
  }

  const selector = {
    meetingId,
    userId
  };
  const modifier = {
    $set: {
      connectionStatus: 'offline',
      validated: false,
      emoji: 'none',
      presenter: false,
      role: 'VIEWER'
    }
  };

  const cb = err => {
    if (err) {
      return Logger.error(`Removing user from collection: ${err}`);
    }

    const sessionUserId = `${meetingId}-${userId}`;
    clearAllSessions(sessionUserId);
    clearUserInfoForRequester(meetingId, userId);
    return Logger.info(`Removed user id=${userId} meeting=${meetingId}`);
  };

  VideoStreams.remove({
    meetingId,
    userId
  });
  return Users.update(selector, modifier, cb);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"setConnectionIdAndAuthToken.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/users/server/modifiers/setConnectionIdAndAuthToken.js                                                   //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => setConnectionIdAndAuthToken
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let Users;
module.link("/imports/api/users", {
  default(v) {
    Users = v;
  }

}, 1);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 2);

function setConnectionIdAndAuthToken(meetingId, userId, connectionId, authToken) {
  check(meetingId, String);
  check(userId, String);
  check(authToken, String);
  check(connectionId, String);
  const selector = {
    meetingId,
    userId
  };
  const modifier = {
    $set: {
      connectionId,
      authToken
    }
  };

  const cb = (err, numChanged) => {
    if (err) {
      Logger.error(`Updating connectionId user=${userId}: ${err}`);
      return;
    }

    if (numChanged) {
      Logger.info(`Updated connectionId and authToken user=${userId} connectionId=${connectionId} meeting=${meetingId} authToken=${authToken}`);
    }
  };

  return Users.update(selector, modifier, cb);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"setUserEffectiveConnectionType.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/users/server/modifiers/setUserEffectiveConnectionType.js                                                //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => setUserEffectiveConnectionType
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let Users;
module.link("/imports/api/users", {
  default(v) {
    Users = v;
  }

}, 1);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 2);

function setUserEffectiveConnectionType(meetingId, userId, effectiveConnectionType) {
  check(meetingId, String);
  check(userId, String);
  check(effectiveConnectionType, String);
  const selector = {
    meetingId,
    userId,
    effectiveConnectionType: {
      $ne: effectiveConnectionType
    }
  };
  const modifier = {
    $set: {
      effectiveConnectionType
    }
  };

  const cb = (err, numChanged) => {
    if (err) {
      Logger.error(`Updating user ${userId}: ${err}`);
    }

    if (numChanged) {
      Logger.info(`Updated user ${userId} effective connection to ${effectiveConnectionType} in meeting ${meetingId}`);
    }
  };

  return Users.update(selector, modifier, cb);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"userEjected.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/users/server/modifiers/userEjected.js                                                                   //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => userEjected
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 1);
let Users;
module.link("/imports/api/users", {
  default(v) {
    Users = v;
  }

}, 2);
let clearUserInfoForRequester;
module.link("/imports/api/users-infos/server/modifiers/clearUserInfoForRequester", {
  default(v) {
    clearUserInfoForRequester = v;
  }

}, 3);

function userEjected(meetingId, userId, ejectedReason) {
  check(meetingId, String);
  check(userId, String);
  check(ejectedReason, String);
  const selector = {
    meetingId,
    userId
  };
  const modifier = {
    $set: {
      ejected: true,
      ejectedReason
    }
  };

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Ejecting user from collection: ${err}`);
    }

    if (numChanged) {
      clearUserInfoForRequester(meetingId, userId);
      return Logger.info(`Ejected user id=${userId} meeting=${meetingId} reason=${ejectedReason}`);
    }

    return null;
  };

  return Users.update(selector, modifier, cb);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"userInactivityInspect.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/users/server/modifiers/userInactivityInspect.js                                                         //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => userInactivityInspect
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 1);
let Users;
module.link("/imports/api/users", {
  default(v) {
    Users = v;
  }

}, 2);

function userInactivityInspect(userId, responseDelay) {
  check(userId, String);
  check(responseDelay, Match.Integer);
  const selector = {
    userId,
    inactivityCheck: false
  };
  const modifier = {
    $set: {
      inactivityCheck: true,
      responseDelay
    }
  };

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Inactivity check for user ${userId}: ${err}`);
    }

    if (numChanged) {
      return Logger.info(`Updated user ${userId} with inactivity inspect`);
    }

    return null;
  };

  return Users.update(selector, modifier, cb);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"store":{"pendingAuthentications.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/users/server/store/pendingAuthentications.js                                                            //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 0);

class PendingAuthentitcations {
  constructor() {
    Logger.debug("PendingAuthentitcations :: constructor");
    this.store = [];
  }

  generateKey(meetingId, userId, authToken) {
    // Protect against separator injection
    meetingId = meetingId.replace(/ /g, '');
    userId = userId.replace(/ /g, '');
    authToken = authToken.replace(/ /g, ''); // Space separated key

    return '${meetingId} ${userId} ${authToken}';
  }

  add(meetingId, userId, authToken, methodInvocationObject) {
    Logger.debug("PendingAuthentitcations :: add", {
      meetingId,
      userId,
      authToken
    });
    this.store.push({
      key: this.generateKey(meetingId, userId, authToken),
      meetingId,
      userId,
      authToken,
      methodInvocationObject
    });
  }

  take(meetingId, userId, authToken) {
    Logger.debug("PendingAuthentitcations :: take", {
      meetingId,
      userId,
      authToken
    });
    const key = this.generateKey(meetingId, userId, authToken); // find matches

    const matches = this.store.filter(e => e.key === key); // remove matches (if any)

    if (matches.length) {
      this.store = this.store.filter(e => e.key !== key);
    } // return matches


    return matches;
  }

}

module.exportDefault(new PendingAuthentitcations());
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"eventHandlers.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/users/server/eventHandlers.js                                                                           //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let RedisPubSub;
module.link("/imports/startup/server/redis", {
  default(v) {
    RedisPubSub = v;
  }

}, 0);
let handleRemoveUser;
module.link("./handlers/removeUser", {
  default(v) {
    handleRemoveUser = v;
  }

}, 1);
let handleUserJoined;
module.link("./handlers/userJoined", {
  default(v) {
    handleUserJoined = v;
  }

}, 2);
let handleValidateAuthToken;
module.link("./handlers/validateAuthToken", {
  default(v) {
    handleValidateAuthToken = v;
  }

}, 3);
let handlePresenterAssigned;
module.link("./handlers/presenterAssigned", {
  default(v) {
    handlePresenterAssigned = v;
  }

}, 4);
let handleEmojiStatus;
module.link("./handlers/emojiStatus", {
  default(v) {
    handleEmojiStatus = v;
  }

}, 5);
let handleGetUsers;
module.link("./handlers/getUsers", {
  default(v) {
    handleGetUsers = v;
  }

}, 6);
let handleUserEjected;
module.link("./handlers/userEjected", {
  default(v) {
    handleUserEjected = v;
  }

}, 7);
let handleChangeRole;
module.link("./handlers/changeRole", {
  default(v) {
    handleChangeRole = v;
  }

}, 8);
let handleUserInactivityInspect;
module.link("./handlers/userInactivityInspect", {
  default(v) {
    handleUserInactivityInspect = v;
  }

}, 9);
RedisPubSub.on('PresenterAssignedEvtMsg', handlePresenterAssigned);
RedisPubSub.on('UserJoinedMeetingEvtMsg', handleUserJoined);
RedisPubSub.on('UserLeftMeetingEvtMsg', handleRemoveUser);
RedisPubSub.on('ValidateAuthTokenRespMsg', handleValidateAuthToken);
RedisPubSub.on('UserEmojiChangedEvtMsg', handleEmojiStatus);
RedisPubSub.on('SyncGetUsersMeetingRespMsg', handleGetUsers);
RedisPubSub.on('UserEjectedFromMeetingEvtMsg', handleUserEjected);
RedisPubSub.on('UserRoleChangedEvtMsg', handleChangeRole);
RedisPubSub.on('UserInactivityInspectMsg', handleUserInactivityInspect);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/users/server/index.js                                                                                   //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.link("./eventHandlers");
module.link("./methods");
module.link("./publishers");
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"methods.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/users/server/methods.js                                                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let validateAuthToken;
module.link("./methods/validateAuthToken", {
  default(v) {
    validateAuthToken = v;
  }

}, 1);
let setEmojiStatus;
module.link("./methods/setEmojiStatus", {
  default(v) {
    setEmojiStatus = v;
  }

}, 2);
let assignPresenter;
module.link("./methods/assignPresenter", {
  default(v) {
    assignPresenter = v;
  }

}, 3);
let changeRole;
module.link("./methods/changeRole", {
  default(v) {
    changeRole = v;
  }

}, 4);
let removeUser;
module.link("./methods/removeUser", {
  default(v) {
    removeUser = v;
  }

}, 5);
let toggleUserLock;
module.link("./methods/toggleUserLock", {
  default(v) {
    toggleUserLock = v;
  }

}, 6);
let setUserEffectiveConnectionType;
module.link("./methods/setUserEffectiveConnectionType", {
  default(v) {
    setUserEffectiveConnectionType = v;
  }

}, 7);
let userActivitySign;
module.link("./methods/userActivitySign", {
  default(v) {
    userActivitySign = v;
  }

}, 8);
let userLeftMeeting;
module.link("./methods/userLeftMeeting", {
  default(v) {
    userLeftMeeting = v;
  }

}, 9);
Meteor.methods({
  setEmojiStatus,
  assignPresenter,
  changeRole,
  removeUser,
  validateAuthToken,
  toggleUserLock,
  setUserEffectiveConnectionType,
  userActivitySign,
  userLeftMeeting
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"publishers.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/users/server/publishers.js                                                                              //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let _;

module.link("lodash", {
  default(v) {
    _ = v;
  }

}, 0);
let Users;
module.link("/imports/api/users", {
  default(v) {
    Users = v;
  }

}, 1);
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 2);
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 3);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 4);
let userLeaving;
module.link("./methods/userLeaving", {
  default(v) {
    userLeaving = v;
  }

}, 5);
let extractCredentials;
module.link("/imports/api/common/server/helpers", {
  extractCredentials(v) {
    extractCredentials = v;
  }

}, 6);
const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;

function currentUser() {
  if (!this.userId) {
    return Users.find({
      meetingId: ''
    });
  }

  const {
    meetingId,
    requesterUserId
  } = extractCredentials(this.userId);
  check(meetingId, String);
  check(requesterUserId, String);
  const connectionId = this.connection.id;
  const onCloseConnection = Meteor.bindEnvironment(() => {
    try {
      userLeaving(meetingId, requesterUserId, connectionId);
    } catch (e) {
      Logger.error(`Exception while executing userLeaving: ${e}`);
    }
  });

  this._session.socket.on('close', _.debounce(onCloseConnection, 100));

  const selector = {
    meetingId,
    userId: requesterUserId
  };
  const options = {
    fields: {
      user: false,
      authToken: false // Not asking for authToken from client side but also not exposing it

    }
  };
  return Users.find(selector, options);
}

function publishCurrentUser(...args) {
  const boundUsers = currentUser.bind(this);
  return boundUsers(...args);
}

Meteor.publish('current-user', publishCurrentUser);

function users(isModerator = false) {
  if (!this.userId) {
    return Users.find({
      meetingId: ''
    });
  }

  const {
    meetingId,
    requesterUserId
  } = extractCredentials(this.userId);
  const selector = {
    $or: [{
      meetingId
    }]
  };

  if (isModerator) {
    const User = Users.findOne({
      userId: requesterUserId,
      meetingId
    });

    if (!!User && User.role === ROLE_MODERATOR) {
      selector.$or.push({
        'breakoutProps.isBreakoutUser': true,
        'breakoutProps.parentId': meetingId,
        connectionStatus: 'online'
      });
    }
  }

  const options = {
    fields: {
      authToken: false,
      lastPing: false
    }
  };
  Logger.debug(`Publishing Users for ${meetingId} ${requesterUserId}`);
  return Users.find(selector, options);
}

function publish(...args) {
  const boundUsers = users.bind(this);
  return boundUsers(...args);
}

Meteor.publish('users', publish);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"index.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/users/index.js                                                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
const Users = new Mongo.Collection('users');

if (Meteor.isServer) {
  // types of queries for the users:
  // 1. meetingId
  // 2. meetingId, userId
  Users._ensureIndex({
    meetingId: 1,
    userId: 1
  });
}

module.exportDefault(Users);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"users-infos":{"server":{"handlers":{"userInformation.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/users-infos/server/handlers/userInformation.js                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => handleUserInformation
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let addUserInfo;
module.link("../modifiers/addUserInfo", {
  default(v) {
    addUserInfo = v;
  }

}, 1);

function handleUserInformation({
  header,
  body
}) {
  check(body, Object);
  check(header, Object);
  const {
    userInfo
  } = body;
  const {
    userId,
    meetingId
  } = header;
  check(userInfo, Array);
  check(userId, String);
  check(meetingId, String);
  return addUserInfo(userInfo, userId, meetingId);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"methods":{"removeUserInformation.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/users-infos/server/methods/removeUserInformation.js                                                     //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => removeUserInformation
});
let UserInfos;
module.link("/imports/api/users-infos", {
  default(v) {
    UserInfos = v;
  }

}, 0);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 1);
let extractCredentials;
module.link("/imports/api/common/server/helpers", {
  extractCredentials(v) {
    extractCredentials = v;
  }

}, 2);

function removeUserInformation() {
  const {
    meetingId,
    requesterUserId
  } = extractCredentials(this.userId);
  const selector = {
    meetingId,
    requesterUserId
  };

  const cb = err => {
    if (err) {
      return Logger.error(`Removing user information from collection: ${err}`);
    }

    return Logger.info(`Removed user information: requester id=${requesterUserId} meeting=${meetingId}`);
  };

  return UserInfos.remove(selector, cb);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"requestUserInformation.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/users-infos/server/methods/requestUserInformation.js                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => getUserInformation
});
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 1);
let RedisPubSub;
module.link("/imports/startup/server/redis", {
  default(v) {
    RedisPubSub = v;
  }

}, 2);
let extractCredentials;
module.link("/imports/api/common/server/helpers", {
  extractCredentials(v) {
    extractCredentials = v;
  }

}, 3);

function getUserInformation(externalUserId) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toThirdParty;
  const EVENT_NAME = 'LookUpUserReqMsg';
  const {
    meetingId,
    requesterUserId
  } = extractCredentials(this.userId);
  check(externalUserId, String);
  const payload = {
    externalUserId
  };
  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"modifiers":{"addUserInfo.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/users-infos/server/modifiers/addUserInfo.js                                                             //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => addUserInfo
});
let UserInfos;
module.link("/imports/api/users-infos", {
  default(v) {
    UserInfos = v;
  }

}, 0);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 1);

function addUserInfo(userInfo, requesterUserId, meetingId) {
  const info = {
    meetingId,
    requesterUserId,
    userInfo
  };

  const cb = err => {
    if (err) {
      return Logger.error(`Adding user information to collection: ${err}`);
    }

    return Logger.info(`Added user information: requester id=${requesterUserId} meeting=${meetingId}`);
  };

  return UserInfos.insert(info, cb);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"clearUserInfo.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/users-infos/server/modifiers/clearUserInfo.js                                                           //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => clearUsersInfo
});
let UserInfos;
module.link("/imports/api/users-infos", {
  default(v) {
    UserInfos = v;
  }

}, 0);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 1);

function clearUsersInfo(meetingId) {
  return UserInfos.remove({
    meetingId
  }, () => {
    Logger.info(`Cleared User Infos (${meetingId})`);
  });
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"clearUserInfoForRequester.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/users-infos/server/modifiers/clearUserInfoForRequester.js                                               //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => clearUsersInfoForRequester
});
let UserInfos;
module.link("/imports/api/users-infos", {
  default(v) {
    UserInfos = v;
  }

}, 0);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 1);

function clearUsersInfoForRequester(meetingId, requesterUserId) {
  return UserInfos.remove({
    meetingId
  }, () => {
    Logger.info(`Cleared User Infos requested by user=${requesterUserId}`);
  });
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"eventHandlers.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/users-infos/server/eventHandlers.js                                                                     //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let RedisPubSub;
module.link("/imports/startup/server/redis", {
  default(v) {
    RedisPubSub = v;
  }

}, 0);
let handleUserInformation;
module.link("./handlers/userInformation", {
  default(v) {
    handleUserInformation = v;
  }

}, 1);
RedisPubSub.on('LookUpUserRespMsg', handleUserInformation);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/users-infos/server/index.js                                                                             //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.link("./eventHandlers");
module.link("./methods");
module.link("./publishers");
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"methods.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/users-infos/server/methods.js                                                                           //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let requestUserInformation;
module.link("./methods/requestUserInformation", {
  default(v) {
    requestUserInformation = v;
  }

}, 1);
let removeUserInformation;
module.link("./methods/removeUserInformation", {
  default(v) {
    removeUserInformation = v;
  }

}, 2);
Meteor.methods({
  requestUserInformation,
  removeUserInformation
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"publishers.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/users-infos/server/publishers.js                                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let UserInfos;
module.link("/imports/api/users-infos", {
  default(v) {
    UserInfos = v;
  }

}, 1);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 2);
let extractCredentials;
module.link("/imports/api/common/server/helpers", {
  extractCredentials(v) {
    extractCredentials = v;
  }

}, 3);

function userInfos() {
  if (!this.userId) {
    return UserInfos.find({
      meetingId: ''
    });
  }

  const {
    meetingId,
    requesterUserId
  } = extractCredentials(this.userId);
  Logger.debug(`Publishing user infos requested by user=${requesterUserId}`);
  return UserInfos.find({
    meetingId,
    requesterUserId
  });
}

function publish(...args) {
  const boundUserInfos = userInfos.bind(this);
  return boundUserInfos(...args);
}

Meteor.publish('users-infos', publish);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"index.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/users-infos/index.js                                                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
const UserInfos = new Mongo.Collection('users-infos');

if (Meteor.isServer) {
  UserInfos._ensureIndex({
    meetingId: 1,
    userId: 1
  });
}

module.exportDefault(UserInfos);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"users-settings":{"server":{"methods":{"addUserSettings.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/users-settings/server/methods/addUserSettings.js                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread"));

module.export({
  default: () => addUserSettings
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let addUserSetting;
module.link("/imports/api/users-settings/server/modifiers/addUserSetting", {
  default(v) {
    addUserSetting = v;
  }

}, 1);
let logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    logger = v;
  }

}, 2);
let extractCredentials;
module.link("/imports/api/common/server/helpers", {
  extractCredentials(v) {
    extractCredentials = v;
  }

}, 3);
const oldParameters = {
  askForFeedbackOnLogout: 'bbb_ask_for_feedback_on_logout',
  autoJoin: 'bbb_auto_join_audio',
  autoShareWebcam: 'bbb_auto_share_webcam',
  autoSwapLayout: 'bbb_auto_swap_layout',
  clientTitle: 'bbb_client_title',
  customStyle: 'bbb_custom_style',
  customStyleUrl: 'bbb_custom_style_url',
  displayBrandingArea: 'bbb_display_branding_area',
  enableScreensharing: 'bbb_enable_screen_sharing',
  enableVideo: 'bbb_enable_video',
  enableVideoStats: 'bbb_enable_video_stats',
  forceListenOnly: 'bbb_force_listen_only',
  hidePresentation: 'bbb_hide_presentation',
  listenOnlyMode: 'bbb_listen_only_mode',
  multiUserPenOnly: 'bbb_multi_user_pen_only',
  multiUserTools: 'bbb_multi_user_tools',
  outsideToggleRecording: 'bbb_outside_toggle_recording',
  outsideToggleSelfVoice: 'bbb_outside_toggle_self_voice',
  presenterTools: 'bbb_presenter_tools',
  shortcuts: 'bbb_shortcuts',
  skipCheck: 'bbb_skip_check_audio'
};
const oldParametersKeys = Object.keys(oldParameters);
const currentParameters = [// APP
'bbb_ask_for_feedback_on_logout', 'bbb_auto_join_audio', 'bbb_client_title', 'bbb_force_listen_only', 'bbb_listen_only_mode', 'bbb_skip_check_audio', // BRANDING
'bbb_display_branding_area', // SHORTCUTS
'bbb_shortcuts', // KURENTO
'bbb_auto_share_webcam', 'bbb_preferred_camera_profile', 'bbb_enable_screen_sharing', 'bbb_enable_video', 'bbb_enable_video_stats', 'bbb_skip_video_preview', // WHITEBOARD
'bbb_multi_user_pen_only', 'bbb_presenter_tools', 'bbb_multi_user_tools', // SKINNING/THEMMING
'bbb_custom_style', 'bbb_custom_style_url', // LAYOUT
'bbb_auto_swap_layout', 'bbb_hide_presentation', 'bbb_show_participants_on_login', // OUTSIDE COMMANDS
'bbb_outside_toggle_self_voice', 'bbb_outside_toggle_recording'];

function valueParser(val) {
  try {
    const parsedValue = JSON.parse(val.toLowerCase());
    return parsedValue;
  } catch (error) {
    logger.error('Parameter value could not ber parsed');
    return val;
  }
}

function addUserSettings(settings) {
  check(settings, [Object]);
  const {
    meetingId,
    requesterUserId: userId
  } = extractCredentials(this.userId);
  let parameters = {};
  settings.forEach(el => {
    const settingKey = Object.keys(el).shift();

    if (currentParameters.includes(settingKey)) {
      if (!Object.keys(parameters).includes(settingKey)) {
        parameters = (0, _objectSpread2.default)({
          [settingKey]: valueParser(el[settingKey])
        }, parameters);
      } else {
        parameters[settingKey] = el[settingKey];
      }

      return;
    }

    if (oldParametersKeys.includes(settingKey)) {
      const matchingNewKey = oldParameters[settingKey];

      if (!Object.keys(parameters).includes(matchingNewKey)) {
        parameters = (0, _objectSpread2.default)({
          [matchingNewKey]: valueParser(el[settingKey])
        }, parameters);
      }

      return;
    }

    logger.warn(`Parameter ${settingKey} not handled`);
  });
  const settingsAdded = [];
  Object.entries(parameters).forEach(el => {
    const setting = el[0];
    const value = el[1];
    settingsAdded.push(addUserSetting(meetingId, userId, setting, value));
  });
  return settingsAdded;
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"modifiers":{"addUserSetting.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/users-settings/server/modifiers/addUserSetting.js                                                       //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => addUserSetting
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let UserSettings;
module.link("/imports/api/users-settings", {
  default(v) {
    UserSettings = v;
  }

}, 1);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 2);

function addUserSetting(meetingId, userId, setting, value) {
  check(meetingId, String);
  check(userId, String);
  check(setting, String);
  check(value, Match.Any);
  const selector = {
    meetingId,
    userId,
    setting
  };
  const modifier = {
    $set: {
      meetingId,
      userId,
      setting,
      value
    }
  };

  const cb = err => {
    if (err) {
      return Logger.error(`Adding user setting to collection: ${err}`);
    }

    return Logger.verbose(`Upserted user setting for meetingId=${meetingId} userId=${userId} setting=${setting}`);
  };

  return UserSettings.upsert(selector, modifier, cb);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"clearUsersSettings.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/users-settings/server/modifiers/clearUsersSettings.js                                                   //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => clearUsersSettings
});
let UserSettings;
module.link("/imports/api/users-settings", {
  default(v) {
    UserSettings = v;
  }

}, 0);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 1);

function clearUsersSettings(meetingId) {
  return UserSettings.remove({
    meetingId
  }, () => {
    Logger.info(`Cleared User Settings (${meetingId})`);
  });
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"index.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/users-settings/server/index.js                                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.link("./methods");
module.link("./publishers");
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"methods.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/users-settings/server/methods.js                                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let addUserSettings;
module.link("./methods/addUserSettings", {
  default(v) {
    addUserSettings = v;
  }

}, 1);
Meteor.methods({
  addUserSettings
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"publishers.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/users-settings/server/publishers.js                                                                     //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let UserSettings;
module.link("/imports/api/users-settings", {
  default(v) {
    UserSettings = v;
  }

}, 1);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 2);
let extractCredentials;
module.link("/imports/api/common/server/helpers", {
  extractCredentials(v) {
    extractCredentials = v;
  }

}, 3);

function userSettings() {
  if (!this.userId) {
    return UserSettings.find({
      meetingId: ''
    });
  }

  const {
    meetingId,
    requesterUserId
  } = extractCredentials(this.userId);
  Logger.debug(`Publishing user settings for user=${requesterUserId}`);
  return UserSettings.find({
    meetingId,
    userId: requesterUserId
  });
}

function publish(...args) {
  const boundUserSettings = userSettings.bind(this);
  return boundUserSettings(...args);
}

Meteor.publish('users-settings', publish);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"index.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/users-settings/index.js                                                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
const UserSettings = new Mongo.Collection('users-settings');

if (Meteor.isServer) {
  UserSettings._ensureIndex({
    meetingId: 1,
    userId: 1
  });
}

module.exportDefault(UserSettings);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"video-streams":{"server":{"handlers":{"userSharedHtml5Webcam.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/video-streams/server/handlers/userSharedHtml5Webcam.js                                                  //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => handleUserSharedHtml5Webcam
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let sharedWebcam;
module.link("../modifiers/sharedWebcam", {
  default(v) {
    sharedWebcam = v;
  }

}, 1);

function handleUserSharedHtml5Webcam({
  header,
  body
}, meetingId) {
  const {
    userId,
    stream
  } = body;

  const isValidStream = testString => {
    // Checking if the stream name is a flash one
    const regexp = /^([A-z0-9]+)-([A-z0-9]+)-([A-z0-9]+)(-recorded)?$/;
    return !regexp.test(testString);
  };

  check(header, Object);
  check(meetingId, String);
  check(userId, String);
  check(stream, String);
  if (!isValidStream(stream)) return false;
  return sharedWebcam(meetingId, userId, stream);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"userUnsharedHtml5Webcam.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/video-streams/server/handlers/userUnsharedHtml5Webcam.js                                                //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => handleUserUnsharedHtml5Webcam
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let unsharedWebcam;
module.link("../modifiers/unsharedWebcam", {
  default(v) {
    unsharedWebcam = v;
  }

}, 1);

function handleUserUnsharedHtml5Webcam({
  header,
  body
}, meetingId) {
  const {
    userId,
    stream
  } = body;

  const isValidStream = testString => {
    // Checking if the stream name is a flash one
    const regexp = /^([A-z0-9]+)-([A-z0-9]+)-([A-z0-9]+)(-recorded)?$/;
    return !regexp.test(testString);
  };

  check(header, Object);
  check(meetingId, String);
  check(userId, String);
  check(stream, String);
  if (!isValidStream(stream)) return false;
  return unsharedWebcam(meetingId, userId);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"methods":{"userShareWebcam.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/video-streams/server/methods/userShareWebcam.js                                                         //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => userShareWebcam
});
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 1);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 2);
let RedisPubSub;
module.link("/imports/startup/server/redis", {
  default(v) {
    RedisPubSub = v;
  }

}, 3);
let extractCredentials;
module.link("/imports/api/common/server/helpers", {
  extractCredentials(v) {
    extractCredentials = v;
  }

}, 4);

function userShareWebcam(stream) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'UserBroadcastCamStartMsg';
  const {
    meetingId,
    requesterUserId
  } = extractCredentials(this.userId);
  Logger.info(`user sharing webcam: ${meetingId} ${requesterUserId}`);
  check(stream, String); // const actionName = 'joinVideo';

  /* TODO throw an error if user has no permission to share webcam
  if (!isAllowedTo(actionName, credentials)) {
    throw new Meteor.Error('not-allowed', `You are not allowed to share webcam`);
  } */

  const payload = {
    stream
  };
  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"userUnshareWebcam.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/video-streams/server/methods/userUnshareWebcam.js                                                       //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => userUnshareWebcam
});
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 1);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 2);
let RedisPubSub;
module.link("/imports/startup/server/redis", {
  default(v) {
    RedisPubSub = v;
  }

}, 3);
let extractCredentials;
module.link("/imports/api/common/server/helpers", {
  extractCredentials(v) {
    extractCredentials = v;
  }

}, 4);

function userUnshareWebcam(stream) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'UserBroadcastCamStopMsg';
  const {
    meetingId,
    requesterUserId
  } = extractCredentials(this.userId);
  Logger.info(`user unsharing webcam: ${meetingId} ${requesterUserId}`);
  check(stream, String); // const actionName = 'joinVideo';

  /* TODO throw an error if user has no permission to share webcam
  if (!isAllowedTo(actionName, credentials)) {
    throw new Meteor.Error('not-allowed', `You are not allowed to share webcam`);
  } */

  const payload = {
    stream
  };
  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"modifiers":{"sharedWebcam.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/video-streams/server/modifiers/sharedWebcam.js                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => sharedWebcam
});
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 0);
let VideoStreams;
module.link("/imports/api/video-streams", {
  default(v) {
    VideoStreams = v;
  }

}, 1);
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 2);

function sharedWebcam(meetingId, userId, stream) {
  check(meetingId, String);
  check(userId, String);
  const selector = {
    meetingId,
    userId
  };
  const modifier = {
    $set: {
      stream
    }
  };

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Error setting hasStream to true: ${err}`);
    }

    if (numChanged) {
      return Logger.info(`Updated hasStream for user id=${userId} meeting=${meetingId}`);
    }
  };

  return VideoStreams.upsert(selector, modifier, cb);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"unsharedWebcam.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/video-streams/server/modifiers/unsharedWebcam.js                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => unsharedWebcam
});
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 0);
let VideoStreams;
module.link("/imports/api/video-streams", {
  default(v) {
    VideoStreams = v;
  }

}, 1);
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 2);

function unsharedWebcam(meetingId, userId) {
  check(meetingId, String);
  check(userId, String);
  const selector = {
    meetingId,
    userId
  };

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Error setting hasStream to false: ${err}`);
    }

    if (numChanged) {
      return Logger.info(`Updated hasStream for user id=${userId} meeting=${meetingId}`);
    }
  };

  return VideoStreams.remove(selector, cb);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"eventHandlers.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/video-streams/server/eventHandlers.js                                                                   //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let RedisPubSub;
module.link("/imports/startup/server/redis", {
  default(v) {
    RedisPubSub = v;
  }

}, 0);
let handleUserSharedHtml5Webcam;
module.link("./handlers/userSharedHtml5Webcam", {
  default(v) {
    handleUserSharedHtml5Webcam = v;
  }

}, 1);
let handleUserUnsharedHtml5Webcam;
module.link("./handlers/userUnsharedHtml5Webcam", {
  default(v) {
    handleUserUnsharedHtml5Webcam = v;
  }

}, 2);
RedisPubSub.on('UserBroadcastCamStartedEvtMsg', handleUserSharedHtml5Webcam);
RedisPubSub.on('UserBroadcastCamStoppedEvtMsg', handleUserUnsharedHtml5Webcam);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/video-streams/server/index.js                                                                           //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.link("./eventHandlers");
module.link("./methods");
module.link("./publisher");
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"methods.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/video-streams/server/methods.js                                                                         //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let userShareWebcam;
module.link("./methods/userShareWebcam", {
  default(v) {
    userShareWebcam = v;
  }

}, 1);
let userUnshareWebcam;
module.link("./methods/userUnshareWebcam", {
  default(v) {
    userUnshareWebcam = v;
  }

}, 2);
Meteor.methods({
  userShareWebcam,
  userUnshareWebcam
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"publisher.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/video-streams/server/publisher.js                                                                       //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 1);
let VideoStreams;
module.link("/imports/api/video-streams", {
  default(v) {
    VideoStreams = v;
  }

}, 2);
let extractCredentials;
module.link("/imports/api/common/server/helpers", {
  extractCredentials(v) {
    extractCredentials = v;
  }

}, 3);

function videoStreams() {
  if (!this.userId) {
    return VideoStreams.find({
      meetingId: ''
    });
  }

  const {
    meetingId
  } = extractCredentials(this.userId);
  Logger.debug(`video users of meeting id=${meetingId}`);
  const selector = {
    meetingId
  };
  return VideoStreams.find(selector);
}

function publish(...args) {
  const boundVideoStreams = videoStreams.bind(this);
  return boundVideoStreams(...args);
}

Meteor.publish('video-streams', publish);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"index.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/video-streams/index.js                                                                                  //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
const VideoStreams = new Mongo.Collection('video-streams');

if (Meteor.isServer) {
  // types of queries for the video users:
  // 2. meetingId
  VideoStreams._ensureIndex({
    meetingId: 1
  });
}

module.exportDefault(VideoStreams);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"voice-call-states":{"server":{"handlers":{"voiceCallStateEvent.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/voice-call-states/server/handlers/voiceCallStateEvent.js                                                //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => handleVoiceCallStateEvent
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let VoiceCallState;
module.link("/imports/api/voice-call-states", {
  default(v) {
    VoiceCallState = v;
  }

}, 1);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 2);

function handleVoiceCallStateEvent({
  body
}, meetingId) {
  const {
    voiceConf,
    clientSession,
    userId,
    callerName,
    callState
  } = body;
  check(meetingId, String);
  check(voiceConf, String);
  check(clientSession, String);
  check(userId, String);
  check(callerName, String);
  check(callState, String);
  const selector = {
    meetingId,
    userId,
    clientSession
  };
  const modifier = {
    $set: {
      meetingId,
      userId,
      voiceConf,
      clientSession,
      callState
    }
  };

  const cb = err => {
    if (err) {
      return Logger.error(`Update voice call state=${userId}: ${err}`);
    }

    return Logger.debug(`Update voice call state=${userId} meeting=${meetingId} clientSession=${clientSession} callState=${callState}`);
  };

  return VoiceCallState.upsert(selector, modifier, cb);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"modifiers":{"clearVoiceCallStates.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/voice-call-states/server/modifiers/clearVoiceCallStates.js                                              //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => clearVoiceCallStates
});
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 0);
let VoiceCallStates;
module.link("/imports/api/voice-users", {
  default(v) {
    VoiceCallStates = v;
  }

}, 1);

function clearVoiceCallStates(meetingId) {
  if (meetingId) {
    return VoiceCallStates.remove({
      meetingId
    }, () => {
      Logger.info(`Cleared VoiceCallStates in (${meetingId})`);
    });
  }

  return VoiceCallStates.remove({}, () => {
    Logger.info('Cleared VoiceCallStates in all meetings');
  });
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"eventHandlers.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/voice-call-states/server/eventHandlers.js                                                               //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let RedisPubSub;
module.link("/imports/startup/server/redis", {
  default(v) {
    RedisPubSub = v;
  }

}, 0);
let handleVoiceCallStateEvent;
module.link("./handlers/voiceCallStateEvent", {
  default(v) {
    handleVoiceCallStateEvent = v;
  }

}, 1);
RedisPubSub.on('VoiceCallStateEvtMsg', handleVoiceCallStateEvent);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/voice-call-states/server/index.js                                                                       //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.link("./eventHandlers");
module.link("./publishers");
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"publishers.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/voice-call-states/server/publishers.js                                                                  //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let VoiceCallStates;
module.link("/imports/api/voice-call-states", {
  default(v) {
    VoiceCallStates = v;
  }

}, 0);
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 1);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 2);
let extractCredentials;
module.link("/imports/api/common/server/helpers", {
  extractCredentials(v) {
    extractCredentials = v;
  }

}, 3);

function voiceCallStates() {
  if (!this.userId) {
    return VoiceCallStates.find({
      meetingId: ''
    });
  }

  const {
    meetingId,
    requesterUserId
  } = extractCredentials(this.userId);
  Logger.debug(`Publishing Voice Call States for ${meetingId} ${requesterUserId}`);
  return VoiceCallStates.find({
    meetingId,
    userId: requesterUserId
  });
}

function publish(...args) {
  const boundVoiceCallStates = voiceCallStates.bind(this);
  return boundVoiceCallStates(...args);
}

Meteor.publish('voice-call-states', publish);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"index.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/voice-call-states/index.js                                                                              //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
const VoiceCallStates = new Mongo.Collection('voiceCallStates');

if (Meteor.isServer) {
  // types of queries for the voice users:
  // 1. intId
  // 2. meetingId, intId
  VoiceCallStates._ensureIndex({
    meetingId: 1,
    userId: 1
  });
}

module.exportDefault(VoiceCallStates);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"voice-users":{"server":{"handlers":{"getVoiceUsers.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/voice-users/server/handlers/getVoiceUsers.js                                                            //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => handleGetVoiceUsers
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let VoiceUsers;
module.link("/imports/api/voice-users/", {
  default(v) {
    VoiceUsers = v;
  }

}, 1);
let Meetings;
module.link("/imports/api/meetings", {
  default(v) {
    Meetings = v;
  }

}, 2);
let addVoiceUser;
module.link("../modifiers/addVoiceUser", {
  default(v) {
    addVoiceUser = v;
  }

}, 3);
let removeVoiceUser;
module.link("../modifiers/removeVoiceUser", {
  default(v) {
    removeVoiceUser = v;
  }

}, 4);
let updateVoiceUser;
module.link("../modifiers/updateVoiceUser", {
  default(v) {
    updateVoiceUser = v;
  }

}, 5);

function handleGetVoiceUsers({
  body
}, meetingId) {
  const {
    users
  } = body;
  check(meetingId, String);
  check(users, Array);
  const meeting = Meetings.findOne({
    meetingId
  }, {
    fields: {
      'voiceProp.voiceConf': 1
    }
  });
  const usersIds = users.map(m => m.intId);
  const voiceUsersIdsToUpdate = VoiceUsers.find({
    meetingId,
    intId: {
      $in: usersIds
    }
  }, {
    fields: {
      intId: 1
    }
  }).fetch().map(m => m.intId);
  const voiceUsersUpdated = [];
  users.forEach(user => {
    if (voiceUsersIdsToUpdate.indexOf(user.intId) >= 0) {
      // user already exist, then update
      voiceUsersUpdated.push(updateVoiceUser(meetingId, {
        intId: user.intId,
        voiceUserId: user.voiceUserId,
        talking: user.talking,
        muted: user.muted,
        voiceConf: meeting.voiceProp.voiceConf,
        joined: true
      }));
    } else {
      // user doesn't exist yet, then add it
      addVoiceUser(meetingId, {
        voiceUserId: user.voiceUserId,
        intId: user.intId,
        callerName: user.callerName,
        callerNum: user.callerNum,
        muted: user.muted,
        talking: user.talking,
        callingWith: user.callingWith,
        listenOnly: user.listenOnly,
        voiceConf: meeting.voiceProp.voiceConf,
        joined: true
      });
    }
  }); // removing extra users already existing in Mongo

  const voiceUsersToRemove = VoiceUsers.find({
    meetingId,
    intId: {
      $nin: usersIds
    }
  }).fetch();
  voiceUsersToRemove.forEach(user => removeVoiceUser(meetingId, {
    voiceConf: meeting.voiceProp.voiceConf,
    voiceUserId: user.voiceUserId,
    intId: user.intId
  }));
  return voiceUsersUpdated;
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"joinVoiceUser.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/voice-users/server/handlers/joinVoiceUser.js                                                            //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => handleJoinVoiceUser
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let Users;
module.link("/imports/api/users", {
  default(v) {
    Users = v;
  }

}, 1);
let addDialInUser;
module.link("/imports/api/users/server/modifiers/addDialInUser", {
  default(v) {
    addDialInUser = v;
  }

}, 2);
let addVoiceUser;
module.link("../modifiers/addVoiceUser", {
  default(v) {
    addVoiceUser = v;
  }

}, 3);

function handleJoinVoiceUser({
  body
}, meetingId) {
  const voiceUser = body;
  voiceUser.joined = true;
  check(meetingId, String);
  check(voiceUser, {
    voiceConf: String,
    intId: String,
    voiceUserId: String,
    callerName: String,
    callerNum: String,
    muted: Boolean,
    talking: Boolean,
    callingWith: String,
    listenOnly: Boolean,
    joined: Boolean
  });
  const {
    intId
  } = voiceUser;
  const User = Users.findOne({
    meetingId,
    intId,
    connectionStatus: 'online'
  });

  if (!User) {
    /* voice-only user - called into the conference */
    addDialInUser(meetingId, voiceUser);
  }

  return addVoiceUser(meetingId, voiceUser);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"leftVoiceUser.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/voice-users/server/handlers/leftVoiceUser.js                                                            //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => handleVoiceUpdate
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let removeVoiceUser;
module.link("/imports/api/voice-users/server/modifiers/removeVoiceUser", {
  default(v) {
    removeVoiceUser = v;
  }

}, 1);
let removeUser;
module.link("/imports/api/users/server/modifiers/removeUser", {
  default(v) {
    removeUser = v;
  }

}, 2);
let Users;
module.link("/imports/api/users", {
  default(v) {
    Users = v;
  }

}, 3);

function handleVoiceUpdate({
  body
}, meetingId) {
  const voiceUser = body;
  check(meetingId, String);
  check(voiceUser, {
    voiceConf: String,
    intId: String,
    voiceUserId: String
  });
  const {
    intId,
    voiceUserId
  } = voiceUser;

  const isDialInUser = (userId, meetingID) => !!Users.findOne({
    meetingId: meetingID,
    userId,
    clientType: 'dial-in-user'
  }); // if the user is dial-in, leaving voice also means leaving userlist


  if (isDialInUser(voiceUserId, meetingId)) removeUser(meetingId, intId);
  return removeVoiceUser(meetingId, voiceUser);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"meetingMuted.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/voice-users/server/handlers/meetingMuted.js                                                             //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => handleMeetingMuted
});
let changeMuteMeeting;
module.link("../modifiers/changeMuteMeeting", {
  default(v) {
    changeMuteMeeting = v;
  }

}, 0);

function handleMeetingMuted({
  body
}, meetingId) {
  return changeMuteMeeting(meetingId, body);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"mutedVoiceUser.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/voice-users/server/handlers/mutedVoiceUser.js                                                           //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => handleVoiceUpdate
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let updateVoiceUser;
module.link("../modifiers/updateVoiceUser", {
  default(v) {
    updateVoiceUser = v;
  }

}, 1);

function handleVoiceUpdate({
  body
}, meetingId) {
  const voiceUser = body;
  check(meetingId, String); // If a person is muted we have to force them to not talking

  if (voiceUser.muted) {
    voiceUser.talking = false;
  }

  return updateVoiceUser(meetingId, voiceUser);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"talkingVoiceUser.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/voice-users/server/handlers/talkingVoiceUser.js                                                         //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => handleVoiceUpdate
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let updateVoiceUser;
module.link("../modifiers/updateVoiceUser", {
  default(v) {
    updateVoiceUser = v;
  }

}, 1);

function handleVoiceUpdate({
  body
}, meetingId) {
  const voiceUser = body;
  check(meetingId, String);
  return updateVoiceUser(meetingId, voiceUser);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"voiceUsers.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/voice-users/server/handlers/voiceUsers.js                                                               //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => handleVoiceUsers
});
let VoiceUsers;
module.link("/imports/api/voice-users/", {
  default(v) {
    VoiceUsers = v;
  }

}, 0);
let Meetings;
module.link("/imports/api/meetings", {
  default(v) {
    Meetings = v;
  }

}, 1);
let addDialInUser;
module.link("/imports/api/users/server/modifiers/addDialInUser", {
  default(v) {
    addDialInUser = v;
  }

}, 2);
let removeVoiceUser;
module.link("../modifiers/removeVoiceUser", {
  default(v) {
    removeVoiceUser = v;
  }

}, 3);
let updateVoiceUser;
module.link("../modifiers/updateVoiceUser", {
  default(v) {
    updateVoiceUser = v;
  }

}, 4);
let addVoiceUser;
module.link("../modifiers/addVoiceUser", {
  default(v) {
    addVoiceUser = v;
  }

}, 5);

function handleVoiceUsers({
  header,
  body
}) {
  const {
    voiceUsers
  } = body;
  const {
    meetingId
  } = header;
  const meeting = Meetings.findOne({
    meetingId
  }, {
    fields: {
      'voiceProp.voiceConf': 1
    }
  });
  const usersIds = voiceUsers.map(m => m.intId);
  const voiceUsersIdsToUpdate = VoiceUsers.find({
    meetingId,
    intId: {
      $in: usersIds
    }
  }, {
    fields: {
      intId: 1
    }
  }).fetch().map(m => m.intId);
  const voiceUsersUpdated = [];
  voiceUsers.forEach(voice => {
    if (voiceUsersIdsToUpdate.indexOf(voice.intId) >= 0) {
      // user already exist, then update
      voiceUsersUpdated.push(updateVoiceUser(meetingId, {
        intId: voice.intId,
        voiceUserId: voice.voiceUserId,
        talking: voice.talking,
        muted: voice.muted,
        voiceConf: meeting.voiceProp.voiceConf,
        joined: true
      }));
    } else {
      // user doesn't exist yet, then add it
      addVoiceUser(meetingId, {
        voiceUserId: voice.voiceUserId,
        intId: voice.intId,
        callerName: voice.callerName,
        callerNum: voice.callerNum,
        muted: voice.muted,
        talking: voice.talking,
        callingWith: voice.callingWith,
        listenOnly: voice.listenOnly,
        voiceConf: meeting.voiceProp.voiceConf,
        joined: true
      });
      addDialInUser(meetingId, voice);
    }
  }); // removing extra users already existing in Mongo

  const voiceUsersToRemove = VoiceUsers.find({
    meetingId,
    intId: {
      $nin: usersIds
    }
  }, {
    fields: {
      voiceUserId: 1,
      intId: 1
    }
  }).fetch();
  voiceUsersToRemove.forEach(user => removeVoiceUser(meetingId, {
    voiceConf: meeting.voiceProp.voiceConf,
    voiceUserId: user.voiceUserId,
    intId: user.intId
  }));
  return voiceUsersUpdated;
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"methods":{"ejectUserFromVoice.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/voice-users/server/methods/ejectUserFromVoice.js                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => ejectUserFromVoice
});
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 1);
let RedisPubSub;
module.link("/imports/startup/server/redis", {
  default(v) {
    RedisPubSub = v;
  }

}, 2);
let extractCredentials;
module.link("/imports/api/common/server/helpers", {
  extractCredentials(v) {
    extractCredentials = v;
  }

}, 3);

function ejectUserFromVoice(userId) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'EjectUserFromVoiceCmdMsg';
  const {
    meetingId,
    requesterUserId
  } = extractCredentials(this.userId);
  check(userId, String);
  const payload = {
    userId,
    ejectedBy: requesterUserId
  };
  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"muteAllExceptPresenterToggle.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/voice-users/server/methods/muteAllExceptPresenterToggle.js                                              //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => muteAllExceptPresenterToggle
});
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let RedisPubSub;
module.link("/imports/startup/server/redis", {
  default(v) {
    RedisPubSub = v;
  }

}, 1);
let Meetings;
module.link("/imports/api/meetings", {
  default(v) {
    Meetings = v;
  }

}, 2);
let extractCredentials;
module.link("/imports/api/common/server/helpers", {
  extractCredentials(v) {
    extractCredentials = v;
  }

}, 3);

function muteAllExceptPresenterToggle() {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'MuteAllExceptPresentersCmdMsg';
  const {
    meetingId,
    requesterUserId
  } = extractCredentials(this.userId);
  const meeting = Meetings.findOne({
    meetingId
  });
  const toggleMeetingMuted = !meeting.voiceProp.muteOnStart;
  const payload = {
    mutedBy: requesterUserId,
    mute: toggleMeetingMuted
  };
  RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"muteAllToggle.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/voice-users/server/methods/muteAllToggle.js                                                             //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => muteAllToggle
});
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let RedisPubSub;
module.link("/imports/startup/server/redis", {
  default(v) {
    RedisPubSub = v;
  }

}, 1);
let Meetings;
module.link("/imports/api/meetings", {
  default(v) {
    Meetings = v;
  }

}, 2);
let extractCredentials;
module.link("/imports/api/common/server/helpers", {
  extractCredentials(v) {
    extractCredentials = v;
  }

}, 3);

function muteAllToggle() {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'MuteMeetingCmdMsg';
  const {
    meetingId,
    requesterUserId
  } = extractCredentials(this.userId);
  const meeting = Meetings.findOne({
    meetingId
  });
  const toggleMeetingMuted = !meeting.voiceProp.muteOnStart;
  const payload = {
    mutedBy: requesterUserId,
    mute: toggleMeetingMuted
  };
  RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"muteToggle.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/voice-users/server/methods/muteToggle.js                                                                //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => muteToggle
});
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let extractCredentials;
module.link("/imports/api/common/server/helpers", {
  extractCredentials(v) {
    extractCredentials = v;
  }

}, 1);
let RedisPubSub;
module.link("/imports/startup/server/redis", {
  default(v) {
    RedisPubSub = v;
  }

}, 2);
let Users;
module.link("/imports/api/users", {
  default(v) {
    Users = v;
  }

}, 3);
let VoiceUsers;
module.link("/imports/api/voice-users", {
  default(v) {
    VoiceUsers = v;
  }

}, 4);

function muteToggle(uId) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'MuteUserCmdMsg';
  const {
    meetingId,
    requesterUserId
  } = extractCredentials(this.userId);
  const userToMute = uId || requesterUserId;
  const requester = Users.findOne({
    meetingId,
    userId: requesterUserId
  });
  const voiceUser = VoiceUsers.findOne({
    intId: userToMute,
    meetingId
  });
  if (!requester || !voiceUser) return;
  const {
    listenOnly,
    muted
  } = voiceUser;
  if (listenOnly) return;
  const payload = {
    userId: userToMute,
    mutedBy: requesterUserId,
    mute: !muted
  };
  RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"modifiers":{"addVoiceUser.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/voice-users/server/modifiers/addVoiceUser.js                                                            //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => addVoiceUser
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 1);
let VoiceUsers;
module.link("/imports/api/voice-users", {
  default(v) {
    VoiceUsers = v;
  }

}, 2);
let Users;
module.link("/imports/api/users", {
  default(v) {
    Users = v;
  }

}, 3);
let flat;
module.link("flat", {
  default(v) {
    flat = v;
  }

}, 4);

function addVoiceUser(meetingId, voiceUser) {
  check(meetingId, String);
  check(voiceUser, {
    voiceUserId: String,
    intId: String,
    callerName: String,
    callerNum: String,
    muted: Boolean,
    talking: Boolean,
    callingWith: String,
    listenOnly: Boolean,
    voiceConf: String,
    joined: Boolean // This is a HTML5 only param.

  });
  const {
    intId,
    talking
  } = voiceUser;
  const selector = {
    meetingId,
    intId
  };
  const modifier = {
    $set: Object.assign({
      meetingId,
      spoke: talking
    }, flat(voiceUser))
  };
  const user = Users.findOne({
    meetingId,
    userId: intId
  }, {
    fields: {
      color: 1
    }
  });
  if (user) modifier.$set.color = user.color;

  const cb = err => {
    if (err) {
      return Logger.error(`Add voice user=${intId}: ${err}`);
    }

    return Logger.info(`Add voice user=${intId} meeting=${meetingId}`);
  };

  return VoiceUsers.upsert(selector, modifier, cb);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"changeMuteMeeting.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/voice-users/server/modifiers/changeMuteMeeting.js                                                       //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => changeMuteMeeting
});
let Meetings;
module.link("/imports/api/meetings", {
  default(v) {
    Meetings = v;
  }

}, 0);
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 1);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 2);

function changeMuteMeeting(meetingId, payload) {
  check(meetingId, String);
  check(payload, {
    muted: Boolean,
    mutedBy: String
  });
  const selector = {
    meetingId
  };
  const modifier = {
    $set: {
      'voiceProp.muteOnStart': payload.muted
    }
  };

  const cb = (err, numChanged) => {
    if (err) {
      Logger.error(`Changing meeting mute status meeting={${meetingId}} ${err}`);
      return;
    }

    if (numChanged) {
      Logger.info(`Changed meeting mute status meeting=${meetingId}`);
    }
  };

  return Meetings.upsert(selector, modifier, cb);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"clearVoiceUsers.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/voice-users/server/modifiers/clearVoiceUsers.js                                                         //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => clearVoiceUser
});
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 0);
let VoiceUsers;
module.link("/imports/api/voice-users", {
  default(v) {
    VoiceUsers = v;
  }

}, 1);

function clearVoiceUser(meetingId) {
  if (meetingId) {
    return VoiceUsers.remove({
      meetingId
    }, () => {
      Logger.info(`Cleared VoiceUsers in (${meetingId})`);
    });
  }

  return VoiceUsers.remove({}, () => {
    Logger.info('Cleared VoiceUsers in all meetings');
  });
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"removeVoiceUser.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/voice-users/server/modifiers/removeVoiceUser.js                                                         //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => removeVoiceUser
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 1);
let VoiceUsers;
module.link("/imports/api/voice-users", {
  default(v) {
    VoiceUsers = v;
  }

}, 2);
let clearSpokeTimeout;
module.link("/imports/api/common/server/helpers", {
  clearSpokeTimeout(v) {
    clearSpokeTimeout = v;
  }

}, 3);

function removeVoiceUser(meetingId, voiceUser) {
  check(meetingId, String);
  check(voiceUser, {
    voiceConf: String,
    voiceUserId: String,
    intId: String
  });
  const {
    intId
  } = voiceUser;
  const selector = {
    meetingId,
    intId
  };
  const modifier = {
    $set: {
      muted: false,
      talking: false,
      listenOnly: false,
      joined: false,
      spoke: false
    }
  };
  clearSpokeTimeout(meetingId, intId);

  const cb = err => {
    if (err) {
      return Logger.error(`Remove voiceUser=${intId}: ${err}`);
    }

    return Logger.info(`Remove voiceUser=${intId} meeting=${meetingId}`);
  };

  return VoiceUsers.update(selector, modifier, cb);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"updateVoiceUser.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/voice-users/server/modifiers/updateVoiceUser.js                                                         //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => updateVoiceUser
});
let Match, check;
module.link("meteor/check", {
  Match(v) {
    Match = v;
  },

  check(v) {
    check = v;
  }

}, 0);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 1);
let VoiceUsers;
module.link("/imports/api/voice-users", {
  default(v) {
    VoiceUsers = v;
  }

}, 2);
let flat;
module.link("flat", {
  default(v) {
    flat = v;
  }

}, 3);
let spokeTimeoutHandles, clearSpokeTimeout;
module.link("/imports/api/common/server/helpers", {
  spokeTimeoutHandles(v) {
    spokeTimeoutHandles = v;
  },

  clearSpokeTimeout(v) {
    clearSpokeTimeout = v;
  }

}, 4);
const TALKING_TIMEOUT = 6000;

function updateVoiceUser(meetingId, voiceUser) {
  check(meetingId, String);
  check(voiceUser, {
    intId: String,
    voiceUserId: String,
    talking: Match.Maybe(Boolean),
    muted: Match.Maybe(Boolean),
    voiceConf: String,
    joined: Match.Maybe(Boolean)
  });
  const {
    intId
  } = voiceUser;
  const selector = {
    meetingId,
    intId
  };
  const modifier = {
    $set: Object.assign(flat(voiceUser))
  };

  if (voiceUser.talking) {
    const user = VoiceUsers.findOne({
      meetingId,
      intId
    }, {
      fields: {
        startTime: 1
      }
    });
    if (user && !user.startTime) modifier.$set.startTime = Date.now();
    modifier.$set.spoke = true;
    modifier.$set.endTime = null;
    clearSpokeTimeout(meetingId, intId);
  }

  const cb = err => {
    if (err) {
      return Logger.error(`Update voiceUser=${intId}: ${err}`);
    }

    return Logger.debug(`Update voiceUser=${intId} meeting=${meetingId}`);
  };

  if (!voiceUser.talking) {
    const timeoutHandle = Meteor.setTimeout(() => {
      const user = VoiceUsers.findOne({
        meetingId,
        intId
      }, {
        fields: {
          endTime: 1,
          talking: 1
        }
      });

      if (user) {
        const {
          endTime,
          talking
        } = user;
        const spokeDelay = Date.now() - endTime < TALKING_TIMEOUT;
        if (talking || spokeDelay) return;
        modifier.$set.spoke = false;
        modifier.$set.startTime = null;
        VoiceUsers.update(selector, modifier, cb);
      }
    }, TALKING_TIMEOUT);
    spokeTimeoutHandles[`${meetingId}-${intId}`] = timeoutHandle;
    modifier.$set.endTime = Date.now();
  }

  return VoiceUsers.update(selector, modifier, cb);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"eventHandlers.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/voice-users/server/eventHandlers.js                                                                     //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let RedisPubSub;
module.link("/imports/startup/server/redis", {
  default(v) {
    RedisPubSub = v;
  }

}, 0);
let processForHTML5ServerOnly;
module.link("/imports/api/common/server/helpers", {
  processForHTML5ServerOnly(v) {
    processForHTML5ServerOnly = v;
  }

}, 1);
let handleJoinVoiceUser;
module.link("./handlers/joinVoiceUser", {
  default(v) {
    handleJoinVoiceUser = v;
  }

}, 2);
let handleLeftVoiceUser;
module.link("./handlers/leftVoiceUser", {
  default(v) {
    handleLeftVoiceUser = v;
  }

}, 3);
let handleTalkingVoiceUser;
module.link("./handlers/talkingVoiceUser", {
  default(v) {
    handleTalkingVoiceUser = v;
  }

}, 4);
let handleMutedVoiceUser;
module.link("./handlers/mutedVoiceUser", {
  default(v) {
    handleMutedVoiceUser = v;
  }

}, 5);
let handleGetVoiceUsers;
module.link("./handlers/getVoiceUsers", {
  default(v) {
    handleGetVoiceUsers = v;
  }

}, 6);
let handleVoiceUsers;
module.link("./handlers/voiceUsers", {
  default(v) {
    handleVoiceUsers = v;
  }

}, 7);
let handleMeetingMuted;
module.link("./handlers/meetingMuted", {
  default(v) {
    handleMeetingMuted = v;
  }

}, 8);
RedisPubSub.on('UserLeftVoiceConfToClientEvtMsg', handleLeftVoiceUser);
RedisPubSub.on('UserJoinedVoiceConfToClientEvtMsg', handleJoinVoiceUser);
RedisPubSub.on('UserTalkingVoiceEvtMsg', handleTalkingVoiceUser);
RedisPubSub.on('UserMutedVoiceEvtMsg', handleMutedVoiceUser);
RedisPubSub.on('GetVoiceUsersMeetingRespMsg', processForHTML5ServerOnly(handleGetVoiceUsers));
RedisPubSub.on('SyncGetVoiceUsersRespMsg', handleVoiceUsers);
RedisPubSub.on('MeetingMutedEvtMsg', handleMeetingMuted);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/voice-users/server/index.js                                                                             //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.link("./eventHandlers");
module.link("./publishers");
module.link("./methods");
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"methods.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/voice-users/server/methods.js                                                                           //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let muteToggle;
module.link("./methods/muteToggle", {
  default(v) {
    muteToggle = v;
  }

}, 1);
let muteAllToggle;
module.link("./methods/muteAllToggle", {
  default(v) {
    muteAllToggle = v;
  }

}, 2);
let muteAllExceptPresenterToggle;
module.link("./methods/muteAllExceptPresenterToggle", {
  default(v) {
    muteAllExceptPresenterToggle = v;
  }

}, 3);
let ejectUserFromVoice;
module.link("./methods/ejectUserFromVoice", {
  default(v) {
    ejectUserFromVoice = v;
  }

}, 4);
Meteor.methods({
  toggleVoice: muteToggle,
  muteAllUsers: muteAllToggle,
  muteAllExceptPresenter: muteAllExceptPresenterToggle,
  ejectUserFromVoice
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"publishers.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/voice-users/server/publishers.js                                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let VoiceUsers;
module.link("/imports/api/voice-users", {
  default(v) {
    VoiceUsers = v;
  }

}, 0);
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 1);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 2);
let extractCredentials;
module.link("/imports/api/common/server/helpers", {
  extractCredentials(v) {
    extractCredentials = v;
  }

}, 3);

function voiceUser() {
  if (!this.userId) {
    return VoiceUsers.find({
      meetingId: ''
    });
  }

  const {
    meetingId,
    requesterUserId
  } = extractCredentials(this.userId);
  Logger.debug(`Publishing Voice User for ${meetingId} ${requesterUserId}`);
  return VoiceUsers.find({
    meetingId
  });
}

function publish(...args) {
  const boundVoiceUser = voiceUser.bind(this);
  return boundVoiceUser(...args);
}

Meteor.publish('voiceUsers', publish);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"index.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/voice-users/index.js                                                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
const VoiceUsers = new Mongo.Collection('voiceUsers');

if (Meteor.isServer) {
  // types of queries for the voice users:
  // 1. intId
  // 2. meetingId, intId
  VoiceUsers._ensureIndex({
    intId: 1
  });

  VoiceUsers._ensureIndex({
    meetingId: 1,
    intId: 1
  });
}

module.exportDefault(VoiceUsers);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"whiteboard-multi-user":{"server":{"handlers":{"modifyWhiteboardAccess.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/whiteboard-multi-user/server/handlers/modifyWhiteboardAccess.js                                         //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => handleModifyWhiteboardAccess
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let modifyWhiteboardAccess;
module.link("../modifiers/modifyWhiteboardAccess", {
  default(v) {
    modifyWhiteboardAccess = v;
  }

}, 1);

function handleModifyWhiteboardAccess({
  body
}, meetingId) {
  const {
    multiUser,
    whiteboardId
  } = body;
  check(multiUser, Boolean);
  check(whiteboardId, String);
  check(meetingId, String);
  return modifyWhiteboardAccess(meetingId, whiteboardId, multiUser);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"methods":{"changeWhiteboardAccess.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/whiteboard-multi-user/server/methods/changeWhiteboardAccess.js                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => changeWhiteboardAccess
});
let RedisPubSub;
module.link("/imports/startup/server/redis", {
  default(v) {
    RedisPubSub = v;
  }

}, 0);
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 1);
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 2);
let extractCredentials;
module.link("/imports/api/common/server/helpers", {
  extractCredentials(v) {
    extractCredentials = v;
  }

}, 3);

function changeWhiteboardAccess(multiUser, whiteboardId) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'ModifyWhiteboardAccessPubMsg';
  const {
    meetingId,
    requesterUserId
  } = extractCredentials(this.userId);
  check(multiUser, Boolean);
  check(whiteboardId, String);
  const payload = {
    multiUser,
    whiteboardId
  };
  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"modifiers":{"modifyWhiteboardAccess.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/whiteboard-multi-user/server/modifiers/modifyWhiteboardAccess.js                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => modifyWhiteboardAccess
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 1);
let WhiteboardMultiUser;
module.link("/imports/api/whiteboard-multi-user/", {
  default(v) {
    WhiteboardMultiUser = v;
  }

}, 2);

function modifyWhiteboardAccess(meetingId, whiteboardId, multiUser) {
  check(meetingId, String);
  check(whiteboardId, String);
  check(multiUser, Boolean);
  const selector = {
    meetingId,
    whiteboardId
  };
  const modifier = {
    meetingId,
    whiteboardId,
    multiUser
  };

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Error while adding an entry to Multi-User collection: ${err}`);
    }

    const {
      insertedId
    } = numChanged;

    if (insertedId) {
      return Logger.info(`Added multiUser flag=${multiUser} meetingId=${meetingId} whiteboardId=${whiteboardId}`);
    }

    return Logger.info(`Upserted multiUser flag=${multiUser} meetingId=${meetingId} whiteboardId=${whiteboardId}`);
  };

  return WhiteboardMultiUser.upsert(selector, modifier, cb);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"eventHandlers.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/whiteboard-multi-user/server/eventHandlers.js                                                           //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let RedisPubSub;
module.link("/imports/startup/server/redis", {
  default(v) {
    RedisPubSub = v;
  }

}, 0);
let processForHTML5ServerOnly;
module.link("/imports/api/common/server/helpers", {
  processForHTML5ServerOnly(v) {
    processForHTML5ServerOnly = v;
  }

}, 1);
let handleGetWhiteboardAccess;
module.link("./handlers/modifyWhiteboardAccess", {
  default(v) {
    handleGetWhiteboardAccess = v;
  }

}, 2);
RedisPubSub.on('GetWhiteboardAccessRespMsg', processForHTML5ServerOnly(handleGetWhiteboardAccess));
RedisPubSub.on('SyncGetWhiteboardAccessRespMsg', handleGetWhiteboardAccess);
RedisPubSub.on('ModifyWhiteboardAccessEvtMsg', handleGetWhiteboardAccess);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/whiteboard-multi-user/server/index.js                                                                   //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.link("./eventHandlers");
module.link("./methods");
module.link("./publishers");
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"methods.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/whiteboard-multi-user/server/methods.js                                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let changeWhiteboardAccess;
module.link("./methods/changeWhiteboardAccess", {
  default(v) {
    changeWhiteboardAccess = v;
  }

}, 1);
Meteor.methods({
  changeWhiteboardAccess
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"publishers.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/whiteboard-multi-user/server/publishers.js                                                              //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let WhiteboardMultiUser;
module.link("/imports/api/whiteboard-multi-user/", {
  default(v) {
    WhiteboardMultiUser = v;
  }

}, 0);
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 1);
let Logger;
module.link("/imports/startup/server/logger", {
  default(v) {
    Logger = v;
  }

}, 2);
let extractCredentials;
module.link("/imports/api/common/server/helpers", {
  extractCredentials(v) {
    extractCredentials = v;
  }

}, 3);

function whiteboardMultiUser() {
  if (!this.userId) {
    return WhiteboardMultiUser.find({
      meetingId: ''
    });
  }

  const {
    meetingId,
    requesterUserId
  } = extractCredentials(this.userId);
  Logger.debug(`Publishing whiteboard-multi-user for ${meetingId} ${requesterUserId}`);
  return WhiteboardMultiUser.find({
    meetingId
  });
}

function publish(...args) {
  const boundMultiUser = whiteboardMultiUser.bind(this);
  return boundMultiUser(...args);
}

Meteor.publish('whiteboard-multi-user', publish);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"index.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/whiteboard-multi-user/index.js                                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
const WhiteboardMultiUser = new Mongo.Collection('whiteboard-multi-user');

if (Meteor.isServer) {
  // types of queries for the whiteboard-multi-user:
  // 1. meetingId
  WhiteboardMultiUser._ensureIndex({
    meetingId: 1
  });
}

module.exportDefault(WhiteboardMultiUser);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"common":{"server":{"helpers.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/common/server/helpers.js                                                                                //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  spokeTimeoutHandles: () => spokeTimeoutHandles,
  clearSpokeTimeout: () => clearSpokeTimeout,
  indexOf: () => indexOf,
  processForHTML5ServerOnly: () => processForHTML5ServerOnly,
  hashFNV32a: () => hashFNV32a,
  extractCredentials: () => extractCredentials
});
let Users;
module.link("/imports/api/users", {
  default(v) {
    Users = v;
  }

}, 0);
const MSG_DIRECT_TYPE = 'DIRECT';
const NODE_USER = 'nodeJSapp';
const spokeTimeoutHandles = {};

const clearSpokeTimeout = (meetingId, userId) => {
  if (spokeTimeoutHandles[`${meetingId}-${userId}`]) {
    Meteor.clearTimeout(spokeTimeoutHandles[`${meetingId}-${userId}`]);
    delete spokeTimeoutHandles[`${meetingId}-${userId}`];
  }
};

const indexOf = [].indexOf || function (item) {
  for (let i = 0, l = this.length; i < l; i += 1) {
    if (i in this && this[i] === item) {
      return i;
    }
  }

  return -1;
};

const processForHTML5ServerOnly = fn => (message, ...args) => {
  const {
    envelope
  } = message;
  const {
    routing
  } = envelope;
  const {
    msgType,
    meetingId,
    userId
  } = routing;
  const selector = {
    userId,
    meetingId
  };
  const user = Users.findOne(selector);
  const shouldSkip = user && msgType === MSG_DIRECT_TYPE && userId !== NODE_USER && user.clientType !== 'HTML5';
  if (shouldSkip) return () => {};
  return fn(message, ...args);
};

const hashFNV32a = (str, asString, seed) => {
  let hval = seed === undefined ? 0x811c9dc5 : seed;

  for (let i = 0, l = str.length; i < l; i++) {
    hval ^= str.charCodeAt(i);
    hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
  }

  if (asString) {
    return `0000000${(hval >>> 0).toString(16)}`.substr(-8);
  }

  return hval >>> 0;
};

const extractCredentials = credentials => {
  if (!credentials) return {};
  const credentialsArray = credentials.split('--');
  const meetingId = credentialsArray[0];
  const requesterUserId = credentialsArray[1];
  return {
    meetingId,
    requesterUserId
  };
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}},"startup":{"server":{"index.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/startup/server/index.js                                                                                     //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread"));

module.export({
  eventEmitter: () => eventEmitter,
  redisPubSub: () => redisPubSub
});
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let WebAppInternals;
module.link("meteor/webapp", {
  WebAppInternals(v) {
    WebAppInternals = v;
  }

}, 1);
let Langmap;
module.link("langmap", {
  default(v) {
    Langmap = v;
  }

}, 2);
let fs;
module.link("fs", {
  default(v) {
    fs = v;
  }

}, 3);
let heapdump;
module.link("heapdump", {
  default(v) {
    heapdump = v;
  }

}, 4);
let Users;
module.link("/imports/api/users", {
  default(v) {
    Users = v;
  }

}, 5);
module.link("./settings");
let lookupUserAgent;
module.link("useragent", {
  lookup(v) {
    lookupUserAgent = v;
  }

}, 6);
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 7);
let memwatch;
module.link("memwatch-next", {
  default(v) {
    memwatch = v;
  }

}, 8);
let Logger;
module.link("./logger", {
  default(v) {
    Logger = v;
  }

}, 9);
let Redis;
module.link("./redis", {
  default(v) {
    Redis = v;
  }

}, 10);
let setMinBrowserVersions;
module.link("./minBrowserVersion", {
  default(v) {
    setMinBrowserVersions = v;
  }

}, 11);
let userLeaving;
module.link("/imports/api/users/server/methods/userLeaving", {
  default(v) {
    userLeaving = v;
  }

}, 12);
const AVAILABLE_LOCALES = fs.readdirSync('assets/app/locales');
Meteor.startup(() => {
  const APP_CONFIG = Meteor.settings.public.app;
  const INTERVAL_IN_SETTINGS = Meteor.settings.public.pingPong.clearUsersInSeconds * 1000;
  const INTERVAL_TIME = INTERVAL_IN_SETTINGS < 10000 ? 10000 : INTERVAL_IN_SETTINGS;
  const env = Meteor.isDevelopment ? 'development' : 'production';
  const CDN_URL = APP_CONFIG.cdn;
  let heapDumpMbThreshold = 100;
  const memoryMonitoringSettings = Meteor.settings.private.memoryMonitoring;

  if (memoryMonitoringSettings.stat.enabled) {
    memwatch.on('stats', stats => {
      let heapDumpTriggered = false;

      if (memoryMonitoringSettings.heapdump.enabled) {
        heapDumpTriggered = stats.current_base / 1048576 > heapDumpMbThreshold;
      }

      Logger.info('memwatch stats', (0, _objectSpread2.default)({}, stats, {
        heapDumpEnabled: memoryMonitoringSettings.heapdump.enabled,
        heapDumpTriggered
      }));

      if (heapDumpTriggered) {
        heapdump.writeSnapshot(`./heapdump-stats-${Date.now()}.heapsnapshot`);
        heapDumpMbThreshold += 100;
      }
    });
  }

  if (memoryMonitoringSettings.leak.enabled) {
    memwatch.on('leak', info => {
      Logger.info('memwatch leak', info);
    });
  }

  if (CDN_URL.trim()) {
    // Add CDN
    BrowserPolicy.content.disallowEval();
    BrowserPolicy.content.allowInlineScripts();
    BrowserPolicy.content.allowInlineStyles();
    BrowserPolicy.content.allowImageDataUrl(CDN_URL);
    BrowserPolicy.content.allowFontDataUrl(CDN_URL);
    BrowserPolicy.content.allowOriginForAll(CDN_URL);
    WebAppInternals.setBundledJsCssPrefix(CDN_URL + APP_CONFIG.basename);
    const fontRegExp = /\.(eot|ttf|otf|woff|woff2)$/;
    WebApp.rawConnectHandlers.use('/', (req, res, next) => {
      if (fontRegExp.test(req._parsedUrl.pathname)) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Vary', 'Origin');
        res.setHeader('Pragma', 'public');
        res.setHeader('Cache-Control', '"public"');
      }

      return next();
    });
  }

  setMinBrowserVersions();
  Meteor.setInterval(() => {
    const currentTime = Date.now();
    Logger.info('Checking for inactive users');
    const users = Users.find({
      connectionStatus: 'online',
      clientType: 'HTML5',
      lastPing: {
        $lt: currentTime - INTERVAL_TIME // get user who has not pinged in the last 10 seconds

      },
      loginTime: {
        $lt: currentTime - INTERVAL_TIME
      }
    }).fetch();
    if (!users.length) return Logger.info('No inactive users');
    Logger.info('Removing inactive users');
    users.forEach(user => {
      Logger.info(`Detected inactive user, userId:${user.userId}, meetingId:${user.meetingId}`);
      return userLeaving(user.meetingId, user.userId, user.connectionId);
    });
    return Logger.info('All inactive users have been removed');
  }, INTERVAL_TIME);
  Logger.warn(`SERVER STARTED.\nENV=${env},\nnodejs version=${process.version}\nCDN=${CDN_URL}\n`, APP_CONFIG);
});
WebApp.connectHandlers.use('/check', (req, res) => {
  const payload = {
    html5clientStatus: 'running'
  };
  res.setHeader('Content-Type', 'application/json');
  res.writeHead(200);
  res.end(JSON.stringify(payload));
});
WebApp.connectHandlers.use('/locale', (req, res) => {
  const APP_CONFIG = Meteor.settings.public.app;
  const fallback = APP_CONFIG.defaultSettings.application.fallbackLocale;
  const override = APP_CONFIG.defaultSettings.application.overrideLocale;
  const browserLocale = override && req.query.init === 'true' ? override.split(/[-_]/g) : req.query.locale.split(/[-_]/g);
  const localeList = [fallback];
  const usableLocales = AVAILABLE_LOCALES.map(file => file.replace('.json', '')).reduce((locales, locale) => locale.match(browserLocale[0]) ? [...locales, locale] : locales, []);
  const regionDefault = usableLocales.find(locale => browserLocale[0] === locale);
  if (regionDefault) localeList.push(regionDefault);
  if (!regionDefault && usableLocales.length) localeList.push(usableLocales[0]);
  let normalizedLocale;
  let messages = {};

  if (browserLocale.length > 1) {
    normalizedLocale = `${browserLocale[0]}_${browserLocale[1].toUpperCase()}`;
    localeList.push(normalizedLocale);
  }

  localeList.forEach(locale => {
    try {
      const data = Assets.getText(`locales/${locale}.json`);
      messages = Object.assign(messages, JSON.parse(data));
      normalizedLocale = locale;
    } catch (e) {
      Logger.warn(`'Could not process locale ${locale}:${e}`); // Getting here means the locale is not available in the current locale files.
    }
  });
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
    normalizedLocale,
    messages
  }));
});
WebApp.connectHandlers.use('/locales', (req, res) => {
  let locales = [];

  try {
    locales = AVAILABLE_LOCALES.map(file => file.replace('.json', '')).map(file => file.replace('_', '-')).map(locale => ({
      locale,
      name: Langmap[locale].nativeName
    }));
  } catch (e) {
    Logger.warn(`'Could not process locales error: ${e}`);
  }

  res.setHeader('Content-Type', 'application/json');
  res.writeHead(200);
  res.end(JSON.stringify(locales));
});
WebApp.connectHandlers.use('/feedback', (req, res) => {
  req.on('data', Meteor.bindEnvironment(data => {
    const body = JSON.parse(data);
    const {
      meetingId,
      userId,
      authToken,
      userName: reqUserName,
      comment,
      rating
    } = body;
    check(meetingId, String);
    check(userId, String);
    check(authToken, String);
    check(reqUserName, String);
    check(comment, String);
    check(rating, Number);
    const user = Users.findOne({
      meetingId,
      userId,
      connectionStatus: 'offline',
      authToken
    });

    if (!user) {
      Logger.warn('Couldn\'t find user for feedback');
    }

    res.setHeader('Content-Type', 'application/json');
    res.writeHead(200);
    res.end(JSON.stringify({
      status: 'ok'
    }));
    body.userName = user ? user.name : `[unconfirmed] ${reqUserName}`;
    const feedback = (0, _objectSpread2.default)({}, body);
    Logger.info('FEEDBACK LOG:', feedback);
  }));
});
WebApp.connectHandlers.use('/useragent', (req, res) => {
  const userAgent = req.headers['user-agent'];
  let response = 'No user agent found in header';

  if (userAgent) {
    response = lookupUserAgent(userAgent).toString();
  }

  Logger.info(`The requesting user agent is ${response}`); // res.setHeader('Content-Type', 'application/json');

  res.writeHead(200);
  res.end(response);
});
const eventEmitter = Redis.emitter;
const redisPubSub = Redis;
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"logger.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/startup/server/logger.js                                                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  logger: () => logger
});
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let createLogger, format, transports;
module.link("winston", {
  createLogger(v) {
    createLogger = v;
  },

  format(v) {
    format = v;
  },

  transports(v) {
    transports = v;
  }

}, 1);
const LOG_CONFIG = Meteor.settings.private.serverLog || {};
const {
  level
} = LOG_CONFIG;
const Logger = createLogger({
  level,
  format: format.combine(format.colorize({
    level: true
  }), format.splat(), format.simple()),
  transports: [// console logging
  new transports.Console({
    prettyPrint: false,
    humanReadableUnhandledException: true,
    colorize: true,
    handleExceptions: true,
    level
  })]
});
module.exportDefault(Logger);
const logger = Logger;
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"minBrowserVersion.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/startup/server/minBrowserVersion.js                                                                         //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let setMinimumBrowserVersions;
module.link("meteor/modern-browsers", {
  setMinimumBrowserVersions(v) {
    setMinimumBrowserVersions = v;
  }

}, 1);

const setMinBrowserVersions = () => {
  const {
    minBrowserVersions
  } = Meteor.settings.private;
  const versions = {};
  minBrowserVersions.forEach(elem => {
    let {
      version
    } = elem;
    if (version === 'Infinity') version = Infinity;
    versions[elem.browser] = version;
  });
  setMinimumBrowserVersions(versions, 'bbb-min');
};

module.exportDefault(setMinBrowserVersions);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"redis.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/startup/server/redis.js                                                                                     //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let Redis;
module.link("redis", {
  default(v) {
    Redis = v;
  }

}, 0);
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 1);
let EventEmitter2;
module.link("eventemitter2", {
  EventEmitter2(v) {
    EventEmitter2 = v;
  }

}, 2);
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 3);
let Logger;
module.link("./logger", {
  default(v) {
    Logger = v;
  }

}, 4);
// Fake meetingId used for messages that have no meetingId
const NO_MEETING_ID = '_';

const makeEnvelope = (channel, eventName, header, body, routing) => {
  const envelope = {
    envelope: {
      name: eventName,
      routing: routing || {
        sender: 'bbb-apps-akka' // sender: 'html5-server', // TODO

      },
      timestamp: Date.now()
    },
    core: {
      header,
      body
    }
  };
  return JSON.stringify(envelope);
};

const makeDebugger = enabled => message => {
  if (!enabled) return;
  Logger.debug(`REDIS: ${message}`);
};

class MeetingMessageQueue {
  constructor(eventEmitter, asyncMessages = [], debug = () => {}) {
    this.asyncMessages = asyncMessages;
    this.emitter = eventEmitter;
    this.queue = new PowerQueue();
    this.debug = debug;
    this.handleTask = this.handleTask.bind(this);
    this.queue.taskHandler = this.handleTask;
  }

  handleTask(data, next) {
    const {
      channel
    } = data;
    const {
      envelope
    } = data.parsedMessage;
    const {
      header
    } = data.parsedMessage.core;
    const {
      body
    } = data.parsedMessage.core;
    const {
      meetingId
    } = header;
    const eventName = header.name;
    const isAsync = this.asyncMessages.includes(channel) || this.asyncMessages.includes(eventName);
    let called = false;
    check(eventName, String);
    check(body, Object);

    const callNext = () => {
      if (called) return;
      this.debug(`${eventName} completed ${isAsync ? 'async' : 'sync'}`);
      called = true;
      const queueLength = this.queue.length();

      if (queueLength > 100) {
        Logger.error(`prev queue size=${queueLength} `);
      }

      next();
    };

    const onError = reason => {
      Logger.error(`${eventName}: ${reason.stack ? reason.stack : reason}`);
      callNext();
    };

    try {
      this.debug(`${JSON.stringify(data.parsedMessage.core)} emitted`);

      if (isAsync) {
        callNext();
      }

      this.emitter.emitAsync(eventName, {
        envelope,
        header,
        body
      }, meetingId).then(callNext).catch(onError);
    } catch (reason) {
      onError(reason);
    }
  }

  add(...args) {
    return this.queue.add(...args);
  }

}

class RedisPubSub {
  static handlePublishError(err) {
    if (err) {
      Logger.error(err);
    }
  }

  constructor(config = {}) {
    this.config = config;
    this.didSendRequestEvent = false;
    const host = process.env.REDIS_HOST || Meteor.settings.private.redis.host;
    const redisConf = Meteor.settings.private.redis;
    const {
      password,
      port
    } = redisConf;

    if (password) {
      this.pub = Redis.createClient({
        host,
        port,
        password
      });
      this.sub = Redis.createClient({
        host,
        port,
        password
      });
      this.pub.auth(password);
      this.sub.auth(password);
    } else {
      this.pub = Redis.createClient({
        host,
        port
      });
      this.sub = Redis.createClient({
        host,
        port
      });
    }

    this.emitter = new EventEmitter2();
    this.mettingsQueues = {};
    this.handleSubscribe = this.handleSubscribe.bind(this);
    this.handleMessage = this.handleMessage.bind(this);
    this.debug = makeDebugger(this.config.debug);
  }

  init() {
    this.sub.on('psubscribe', Meteor.bindEnvironment(this.handleSubscribe));
    this.sub.on('pmessage', Meteor.bindEnvironment(this.handleMessage));
    const channelsToSubscribe = this.config.subscribeTo;
    channelsToSubscribe.forEach(channel => {
      this.sub.psubscribe(channel);
    });
    this.debug(`Subscribed to '${channelsToSubscribe}'`);
  }

  updateConfig(config) {
    this.config = Object.assign({}, this.config, config);
    this.debug = makeDebugger(this.config.debug);
  } // TODO: Move this out of this class, maybe pass as a callback to init?


  handleSubscribe() {
    if (this.didSendRequestEvent) return; // populate collections with pre-existing data

    const REDIS_CONFIG = Meteor.settings.private.redis;
    const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
    const EVENT_NAME = 'GetAllMeetingsReqMsg';
    const body = {
      requesterId: 'nodeJSapp'
    };
    this.publishSystemMessage(CHANNEL, EVENT_NAME, body);
    this.didSendRequestEvent = true;
  }

  handleMessage(pattern, channel, message) {
    const parsedMessage = JSON.parse(message);
    const {
      name: eventName,
      meetingId
    } = parsedMessage.core.header;
    const {
      ignored: ignoredMessages,
      async
    } = this.config;

    if (ignoredMessages.includes(channel) || ignoredMessages.includes(eventName)) {
      if (eventName === 'CheckAlivePongSysMsg') {
        return;
      }

      this.debug(`${eventName} skipped`);
      return;
    }

    const queueId = meetingId || NO_MEETING_ID;

    if (!(queueId in this.mettingsQueues)) {
      this.mettingsQueues[meetingId] = new MeetingMessageQueue(this.emitter, async, this.debug);
    }

    this.mettingsQueues[meetingId].add({
      pattern,
      channel,
      eventName,
      parsedMessage
    });
  }

  destroyMeetingQueue(id) {
    delete this.mettingsQueues[id];
  }

  on(...args) {
    return this.emitter.on(...args);
  }

  publishVoiceMessage(channel, eventName, voiceConf, payload) {
    const header = {
      name: eventName,
      voiceConf
    };
    const envelope = makeEnvelope(channel, eventName, header, payload);
    return this.pub.publish(channel, envelope, RedisPubSub.handlePublishError);
  }

  publishSystemMessage(channel, eventName, payload) {
    const header = {
      name: eventName
    };
    const envelope = makeEnvelope(channel, eventName, header, payload);
    return this.pub.publish(channel, envelope, RedisPubSub.handlePublishError);
  }

  publishMeetingMessage(channel, eventName, meetingId, payload) {
    const header = {
      name: eventName,
      meetingId
    };
    const envelope = makeEnvelope(channel, eventName, header, payload);
    return this.pub.publish(channel, envelope, RedisPubSub.handlePublishError);
  }

  publishUserMessage(channel, eventName, meetingId, userId, payload) {
    const header = {
      name: eventName,
      meetingId,
      userId
    };
    const envelope = makeEnvelope(channel, eventName, header, payload, {
      meetingId,
      userId
    });
    return this.pub.publish(channel, envelope, RedisPubSub.handlePublishError);
  }

}

const RedisPubSubSingleton = new RedisPubSub();
Meteor.startup(() => {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  RedisPubSubSingleton.updateConfig(REDIS_CONFIG);
  RedisPubSubSingleton.init();
});
module.exportDefault(RedisPubSubSingleton);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"settings.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/startup/server/settings.js                                                                                  //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let fs;
module.link("fs", {
  default(v) {
    fs = v;
  }

}, 1);
let YAML;
module.link("yaml", {
  default(v) {
    YAML = v;
  }

}, 2);
const YAML_FILE_PATH = 'assets/app/config/settings.yml';

try {
  if (fs.existsSync(YAML_FILE_PATH)) {
    const SETTINGS = YAML.parse(fs.readFileSync(YAML_FILE_PATH, 'utf-8'));
    Meteor.settings = SETTINGS;
    __meteor_runtime_config__.PUBLIC_SETTINGS = SETTINGS.public;
  } else {
    throw new Error('File doesn\'t exists');
  }
} catch (error) {
  console.error('Error on load configuration file.', error);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}},"utils":{"lineEndings.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/utils/lineEndings.js                                                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  BREAK_LINE: () => BREAK_LINE,
  CARRIAGE_RETURN: () => CARRIAGE_RETURN,
  NEW_LINE: () => NEW_LINE
});
// Used in Flash and HTML to show a legitimate break in the line
const BREAK_LINE = '<br/>'; // Soft return in HTML to signify a broken line without
// displaying the escaped '<br/>' line break text

const CARRIAGE_RETURN = '\r'; // Handle this the same as carriage return, in case text copied has this

const NEW_LINE = '\n';
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"mimeTypes.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/utils/mimeTypes.js                                                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  XLS: () => XLS,
  XLSX: () => XLSX,
  DOC: () => DOC,
  DOCX: () => DOCX,
  PPT: () => PPT,
  PPTX: () => PPTX,
  ODT: () => ODT,
  RTF: () => RTF,
  TXT: () => TXT,
  ODS: () => ODS,
  ODP: () => ODP,
  PDF: () => PDF,
  JPEG: () => JPEG,
  PNG: () => PNG,
  SVG: () => SVG,
  UPLOAD_SUPORTED: () => UPLOAD_SUPORTED
});
const XLS = 'application/vnd.ms-excel';
const XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const DOC = 'application/msword';
const DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const PPT = 'application/vnd.ms-powerpoint';
const PPTX = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
const ODT = 'application/vnd.oasis.opendocument.text';
const RTF = 'application/rtf';
const TXT = 'text/plain';
const ODS = 'application/vnd.oasis.opendocument.spreadsheet';
const ODP = 'application/vnd.oasis.opendocument.presentation';
const PDF = 'application/pdf';
const JPEG = 'image/jpeg';
const PNG = 'image/png';
const SVG = 'image/svg+xml';
const UPLOAD_SUPORTED = [XLS, XLSX, DOC, DOCX, PPT, PPTX, ODT, RTF, TXT, ODS, ODP, PDF, JPEG, PNG];
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"regex-weburl.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/utils/regex-weburl.js                                                                                       //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.exportDefault(new RegExp( // protocol identifier
'(?:(?:https?|ftp)://)' + // user:pass authentication
'(?:\\S+(?::\\S*)?@)?' + '(?:' + // IP address exclusion
// private & local networks
'(?!(?:10|127)(?:\\.\\d{1,3}){3})' + '(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})' + '(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})' + // IP address dotted notation octets
// excludes loopback network 0.0.0.0
// excludes reserved space >= 224.0.0.0
// excludes network & broacast addresses
// (first & last IP address of each class)
'(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])' + '(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}' + '(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))' + '|' + // host name
'(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)' + // domain name
'(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*' + // TLD identifier
'(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))' + // TLD may end with dot
'\\.?' + ')' + // port number
'(?::\\d{2,5})?' + // resource path
'(?:[/?#]\\S*)?', 'img'));
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}},"server":{"main.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// server/main.js                                                                                                      //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.link("/imports/startup/server");
module.link("/imports/api/meetings/server");
module.link("/imports/api/users/server");
module.link("/imports/api/annotations/server");
module.link("/imports/api/cursor/server");
module.link("/imports/api/polls/server");
module.link("/imports/api/captions/server");
module.link("/imports/api/presentations/server");
module.link("/imports/api/presentation-pods/server");
module.link("/imports/api/presentation-upload-token/server");
module.link("/imports/api/slides/server");
module.link("/imports/api/breakouts/server");
module.link("/imports/api/group-chat/server");
module.link("/imports/api/group-chat-msg/server");
module.link("/imports/api/screenshare/server");
module.link("/imports/api/users-settings/server");
module.link("/imports/api/voice-users/server");
module.link("/imports/api/whiteboard-multi-user/server");
module.link("/imports/api/video-streams/server");
module.link("/imports/api/network-information/server");
module.link("/imports/api/users-infos/server");
module.link("/imports/api/note/server");
module.link("/imports/api/external-videos/server");
module.link("/imports/api/guest-users/server");
module.link("/imports/api/ping-pong/server");
module.link("/imports/api/local-settings/server");
module.link("/imports/api/voice-call-states/server");
module.link("/imports/api/log-client/server");
module.link("/imports/api/common/server/helpers");
module.link("/imports/startup/server/logger");

let _;

module.link("lodash", {
  default(v) {
    _ = v;
  }

}, 0);
global._ = _;
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}},{
  "extensions": [
    ".js",
    ".json",
    ".jsx"
  ]
});

var exports = require("/server/main.js");
//# sourceURL=meteor://💻app/app/app.js