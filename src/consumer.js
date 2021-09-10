require('dotenv').config();
const amqp = require('amqplib');
const PlaylistSongsService = require('./PlaylistSongsService');
const MailSender = require('./MailSender');
const Listener = require('./listener');

const init = async () => {
  const playlistSongsService = new PlaylistSongsService();
  const mailSender = new MailSender();
  const listener = new Listener(playlistSongsService, mailSender);

  // buat koneksi dan channel
  const connection = await amqp.connect(process.env.RABBITMQ_SERVER);
  const channel = await connection.createChannel();

  await channel.assertQueue('export:songs', {
    durable: true,
  });

  // panggil listener untuk mengkonsumsi queue
  channel.consume('export:songs', listener.listen, { noAck: true });
};

init();
