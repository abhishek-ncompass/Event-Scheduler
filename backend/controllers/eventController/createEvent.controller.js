const queryFn = require("../../utils/queryFunction");
const CustomError = require("../../utils/CustomError");
const { customResponse } = require("../../utils/customResponse");

const _createEvent = `
  INSERT INTO
    EVENTS (
      TITLE,
      DESCRIPTION,
      STARTDATETIME,
      ENDDATETIME,
      CREATEDBY
    )
  VALUES
    ($1, $2, $3, $4, $5)
  RETURNING
    *`;

const _participant = `
  SELECT
    USERID
  FROM
    USERS
  WHERE
    EMAIL = $1`;

const _addParticipant = `
  INSERT INTO
    PARTICIPANTS (EVENTID, USERID)
  VALUES
    ($1, $2)`;

async function createEvent(req, res) {
  const { title, description, startDateTime, endDateTime, participants } =
    req.body;
  const { userid } = req.user;

  try {
    if (!title || !description || !startDateTime || !endDateTime) {
      throw new CustomError([{ message: "Missing required fields" }], 400);
    }

    const values = [title, description, startDateTime, endDateTime, userid];
    const eventResult = await queryFn(_createEvent, values);
    const eventId = eventResult.rows[0].eventid;

    const participantQueries = participants.map(async (email) => {
      const userResult = await queryFn(_participant, [email]);
      const userId = userResult.rows[0]?.userid;

      if (!userId) {
        throw new CustomError([{ message: `User with email ${email} not found` }], 404);
      }

      await queryFn(_addParticipant, [eventId, userId]);
    });

    await Promise.all(participantQueries);

    customResponse(res, 201, "Event created successfully");
  } catch (error) {
    if (error instanceof CustomError) {
      customResponse(res, error.status, error.message, null, true);
    } else {
      console.error(error);
      customResponse(res, 500, "Failed to create event", null, true);
    }
  }
}

module.exports = createEvent;