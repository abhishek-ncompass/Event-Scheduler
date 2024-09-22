const queryFn = require("../../utils/queryFunction");
const CustomError = require("../../utils/CustomError");
const { customResponse } = require("../../utils/customResponse");

const _getEvents = `
  SELECT 
    e.eventid, 
    e.title, 
    e.description, 
    e.startdatetime, 
    e.enddatetime, 
    e.createdby, 
    u.email AS creator_email, 
    u.firstname AS creator_firstname
  FROM events e
  JOIN users u ON e.createdby = u.userid
  WHERE e.createdby = $1 OR e.eventid IN (
    SELECT p.eventid
    FROM participants p
    WHERE p.userid = $1
  ) AND e.isarchived = FALSE AND e.deletedat IS NULL
`;

async function getEvents(req, res) {
  const { userid } = req.user;

  try {
    const values = [userid];
    const eventResult = await queryFn(_getEvents, values);

    const events = eventResult.rows.map((event) => {
      const { eventid, title, description, startdatetime, enddatetime, createdby, creator_email, creator_firstname } = event;
      return {
        eventid,
        title,
        description,
        startDateTime: startdatetime,
        endDateTime: enddatetime,
        createdBy: {
          userid: createdby,
          email: creator_email,
          firstname: creator_firstname,
        },
      };
    });

    customResponse(res, 200, "Events retrieved successfully", events);
  } catch (error) {
    if (error instanceof CustomError) {
      customResponse(res, error.status, error.message, null, true);
    } else {
      console.error(error);
      customResponse(res, 500, "Failed to retrieve events", null, true);
    }
  }
}

module.exports = getEvents;