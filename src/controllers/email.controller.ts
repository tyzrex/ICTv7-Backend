import { NextFunction, Request, Response } from "express";
import nodemailer from "nodemailer";
import Mailgen from "mailgen";

import { emailSender } from "../utils/env";
import { isValidEmail } from "../helpers/validator";

export const sendEmail = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const username = req.body?.username;
  const emailReceiver = req.body?.email;

  if (!emailReceiver) {
    res.status(400).json({ message: "No email provided." });
    return next();
  }

  if (!isValidEmail(emailReceiver)) {
    res.status(400).json({ error: "Invalid email format." });
    return next();
  }

  const config = {
    service: "gmail",
    auth: {
      user: emailSender.address,
      pass: emailSender.password,
    },
  };

  const transporter = nodemailer.createTransport(config);

  const mailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "Prime IT Club",
      link: "https://primeitclub.com/",
    },
  });

  const email = {
    body: {
      name: username,
      intro:
        "Welcome to ICT Meetup V7.0! To complete your registration, we need to verify your email address. ",
      action: {
        instructions: "Please click the button below to confirm your email: ",
        button: {
          color: "#123ABC",
          text: "Verify Email",
          link: "https://primeitclub.com/",
        },
      },
      outro: "Thank you for registering with us!",
    },
  };

  const message = {
    from: emailSender.address,
    to: emailReceiver,
    subject: "Please Verify Your Email Address",
    html: mailGenerator.generate(email),
  };

  try {
    await transporter.sendMail(message);
    return res.status(201).json({ message: "Mail has been sent." });
  } catch (error) {
    console.log("ERROR: ", error);
    return res.status(500).json({ message: "Faild to send email." });
  }
};
