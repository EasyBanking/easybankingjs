const { EventEmitter } = require("events");
const { events } = require("./constants");
const { User } = require("../../models/User");

const emitter = new EventEmitter();

emitter.on(events.NOTFICATION, async (data) => {
  const user = await User.findById(userId).orFail(
    new NotFound("User not found")
  );

  if (Object.values(events).includes(data.type)) {
    user.notfications.push({
      content: generateNotficationContent(
        events[data.type],
        data.user
      )(data.amount),
      viewed: false,
    });
    await user.save();
  }
});

// ntofications helper

function generateNotficationContent(type, { username }) {
  switch (type) {
    case events.TRANSFER_MONEY_NOTFICATION:
      return (amount) => `you have been transfered ${amount} to ${username} `;

    case events.RECEIVE_MONEY_NOTFICATION:
      return (amount) => `you have been received ${amount} from ${username} `;

    case events.INSTANT_PAY_GENERATION_NOTFICATION:
      return (amount) => `you have initalized payment ${amount}`;

    case events.INSTANT_PAY_RECEVEING_NOTFICATION:
      return (amount) => `you have received payment ${amount}`;
  }
}

module.exports = NotficationsEmitter;
