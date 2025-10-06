const http = require('http');

const req = http.get('http://localhost:5000/health', (res) => {
  process.exit(res.statusCode === 200 ? 0 : 1);
});

req.on('error', () => process.exit(1));
req.setTimeout(5000, () => {
  req.destroy();
  process.exit(1);
});
