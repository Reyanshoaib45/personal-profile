/**
 * Local SMTP sink for testing only.
 *
 * Accepts any message and prints it as JSON. Used to verify the site's mail
 * transport end to end without touching a real inbox:
 *
 *   node scripts/smtp-sink.mjs 2525
 *   SMTP_HOST=127.0.0.1 SMTP_PORT=2525 SMTP_USER=test@example.com \
 *   SMTP_PASS=secret npm run dev
 */
import net from 'node:net';

const port = Number(process.argv[2] || 2525);

const server = net.createServer((socket) => {
  let buffer = '';
  let inData = false;
  let data = '';
  const envelope = { from: '', to: [] };
  let authStep = 0;

  socket.write('220 localhost test sink\r\n');

  const reply = (line) => socket.write(`${line}\r\n`);

  function handle(line) {
    const cmd = line.trim();
    const upper = cmd.toUpperCase();

    if (authStep === 1) {
      authStep = 2;
      return reply('334 UGFzc3dvcmQ6');
    }
    if (authStep === 2) {
      authStep = 0;
      return reply('235 2.7.0 Authentication successful');
    }

    if (upper.startsWith('EHLO') || upper.startsWith('HELO')) {
      reply('250-localhost');
      reply('250-AUTH PLAIN LOGIN');
      reply('250-8BITMIME');
      reply('250 SMTPUTF8');
    } else if (upper.startsWith('AUTH LOGIN')) {
      authStep = 1;
      reply('334 VXNlcm5hbWU6');
    } else if (upper.startsWith('AUTH')) {
      reply('235 2.7.0 Authentication successful');
    } else if (upper.startsWith('MAIL FROM')) {
      envelope.from = cmd.replace(/^MAIL FROM:\s*/i, '').replace(/[<>]/g, '');
      reply('250 2.1.0 OK');
    } else if (upper.startsWith('RCPT TO')) {
      envelope.to.push(cmd.replace(/^RCPT TO:\s*/i, '').replace(/[<>]/g, ''));
      reply('250 2.1.5 OK');
    } else if (upper === 'DATA') {
      inData = true;
      data = '';
      reply('354 End data with <CR><LF>.<CR><LF>');
    } else if (upper.startsWith('QUIT')) {
      reply('221 2.0.0 Bye');
      socket.end();
    } else if (upper.startsWith('RSET')) {
      reply('250 2.0.0 OK');
    } else {
      reply('250 2.0.0 OK');
    }
  }

  socket.on('data', (chunk) => {
    if (inData) {
      data += chunk.toString('utf8');
      const end = data.indexOf('\r\n.\r\n');
      if (end !== -1) {
        const body = data.slice(0, end);
        inData = false;
        console.log('=== MESSAGE RECEIVED ===');
        console.log(JSON.stringify({ ...envelope, bytes: body.length, body }, null, 2));
        console.log('=== END MESSAGE ===');
        reply('250 2.0.0 OK queued');
      }
      return;
    }

    buffer += chunk.toString('utf8');
    let index;
    while ((index = buffer.indexOf('\r\n')) !== -1) {
      const line = buffer.slice(0, index);
      buffer = buffer.slice(index + 2);
      handle(line);
    }
  });

  socket.on('error', () => {});
});

server.listen(port, '127.0.0.1', () => console.log(`SMTP sink listening on 127.0.0.1:${port}`));
