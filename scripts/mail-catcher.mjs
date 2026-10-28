// Local development mail catcher: a minimal SMTP server that accepts every message and
// saves it to data/mail/<timestamp>.eml instead of delivering it. Never use in production.
// Usage: node scripts/mail-catcher.mjs   then set SMTP_HOST=127.0.0.1 SMTP_PORT=2525 in .env.local
import { createServer } from 'node:net';
import { mkdirSync, writeFileSync } from 'node:fs';

const PORT = Number(process.env.CATCHER_PORT || 2525);
mkdirSync('data/mail', { recursive: true });

createServer((socket) => {
  let buffer = '';
  let inData = false;
  let envelope = { from: '', to: [] };
  const reply = (line) => socket.write(line + '\r\n');
  reply('220 localhost CIASO mail catcher');

  socket.on('data', (chunk) => {
    buffer += chunk.toString('utf8');
    while (true) {
      if (inData) {
        const end = buffer.indexOf('\r\n.\r\n');
        if (end === -1) return;
        const message = buffer.slice(0, end).replace(/^\.\./gm, '.');
        buffer = buffer.slice(end + 5);
        inData = false;
        const file = `data/mail/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.eml`;
        writeFileSync(file, message);
        const subject = (message.match(/^Subject: (.*)$/m) || [])[1] || '';
        console.log(`✉  ${envelope.from} → ${envelope.to.join(', ')} | ${subject} | saved ${file}`);
        envelope = { from: '', to: [] };
        reply('250 OK: message saved');
        continue;
      }
      const nl = buffer.indexOf('\r\n');
      if (nl === -1) return;
      const line = buffer.slice(0, nl);
      buffer = buffer.slice(nl + 2);
      const cmd = line.slice(0, 4).toUpperCase();
      if (cmd === 'EHLO' || cmd === 'HELO') reply('250 localhost');
      else if (cmd === 'MAIL') { envelope.from = line.slice(10).trim(); reply('250 OK'); }
      else if (cmd === 'RCPT') { envelope.to.push(line.slice(8).trim()); reply('250 OK'); }
      else if (cmd === 'DATA') { inData = true; reply('354 End data with <CR><LF>.<CR><LF>'); }
      else if (cmd === 'RSET') { envelope = { from: '', to: [] }; reply('250 OK'); }
      else if (cmd === 'NOOP') reply('250 OK');
      else if (cmd === 'QUIT') { reply('221 Bye'); socket.end(); return; }
      else reply('502 Command not implemented');
    }
  });
  socket.on('error', () => {});
}).listen(PORT, '127.0.0.1', () => console.log(`Mail catcher listening on 127.0.0.1:${PORT} (saving to data/mail/)`));
