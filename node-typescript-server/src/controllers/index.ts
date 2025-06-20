import { Request, Response } from "express";

export const getExample = (req: Request, res: Response) => {
  res.send("This is an example response from the controller.");
};

export const postExample = (req: Request, res: Response) => {
  const data = req.body;
  res.status(201).send({ message: "Data received", data });
};

// Add more controller functions as needed
