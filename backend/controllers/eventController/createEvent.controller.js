const queryFn = require('../../utils/queryFunction');

async function createEvent(req, res) {
  const { title, description, startDateTime, endDateTime, participants } = req.body;
  const { userid } = req.user; 
  console.log(userid)

  if (!title || !description || !startDateTime || !endDateTime) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const eventQuery = {
    text: `INSERT INTO events (title, description, startdatetime, enddatetime, createdby) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    values: [title, description, startDateTime, endDateTime, userid],
  };

  try {
    const eventResult = await queryFn(eventQuery.text, eventQuery.values);
    const eventId = eventResult.rows[0].eventid;

    const participantQueries = participants.map(async (email) => {
      const userQuery = {
        text: `SELECT userid FROM users WHERE email = $1`,
        values: [email],
      };

      const userResult = await queryFn(userQuery.text, userQuery.values);
      const userId = userResult.rows[0].userid;

      if (!userId) {
        throw new Error(`User with email ${email} not found`);
      }

      const participantQuery = {
        text: `INSERT INTO participants (eventid, userid) VALUES ($1, $2)`,
        values: [eventId, userId],
      };

      await queryFn(participantQuery.text, participantQuery.values);
    });

    await Promise.all(participantQueries);

    res.status(201).json({ message: 'Event created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create event' });
  }
}

module.exports = createEvent;