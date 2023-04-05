import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Periodically send data to the client
  const sendData = () => {
    const data = {
      id: uuidv4(),
      message: 'This is a streamed message from the server.',
      timestamp: new Date().toISOString(),
    };

    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  const interval = setInterval(sendData, 5000); // Send data every 5 seconds

  // Clear interval and close the connection when the client disconnects
  req.on('close', () => {
    clearInterval(interval);
    res.end();
  });
}
