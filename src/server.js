const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
  service: 'gmail', // You can use other services like SendGrid or your SMTP server
  auth: {
    user: 'your-email@gmail.com', // Your email
    pass: 'your-password' // Your email password
  }
});

app.post('/send-email', (req, res) => {
  const { to_name, to_email, booking_date, booking_time, package } = req.body;

  const mailOptions = {
    from: 'your-email@gmail.com',
    to: to_email,
    subject: 'Booking Confirmation',
    text: `Hello ${to_name},\n\nYour booking for ${package} on ${booking_date} at ${booking_time} has been confirmed.`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).send({ message: 'Error sending email', error });
    }
    res.status(200).send({ message: 'Email sent', info });
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
