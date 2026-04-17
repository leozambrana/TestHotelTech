import express from 'express';
import cors from 'cors';
import { parseArgs } from 'util';

const app = express();
app.use(cors());
app.use(express.json());

// Argument parsing
const { values } = parseArgs({
  options: {
    map: { type: 'string', default: './map.ascii' },
    bookings: { type: 'string', default: './bookings.json' },
  },
  strict: false,
});

const PORT = 3001;

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', map: values.map, bookings: values.bookings });
});

app.listen(PORT, () => {
  console.log(`\x1b[35m[API]\x1b[0m Server running at http://localhost:${PORT}`);
  console.log(`\x1b[35m[API]\x1b[0m Map file: ${values.map}`);
  console.log(`\x1b[35m[API]\x1b[0m Bookings file: ${values.bookings}`);
});
