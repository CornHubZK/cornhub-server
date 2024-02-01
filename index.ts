import express from "express";
import bodyParser from "body-parser";
import countries from "i18n-iso-countries";
import type { Alpha3Code } from "i18n-iso-countries";
import { randomUUID } from "crypto";
const app = express();

type Request = {
  id: string;
  minAge: number;
  citizenship: Alpha3Code;
  status: "pending" | "successful" | "unsuccessful";
};

const requests: { [key: string]: Request } = {};

const PORT = process.env.PORT || 3010;

app.use(bodyParser.json());

app.post("/request/create", (req, res) => {
  const { minAge, citizenship } = req.body;
  const id = randomUUID();
  const request: Request = {
    id,
    minAge,
    citizenship,
    status: "pending",
  };
  requests[id] = request;
  res.send(request);
});

app.get("/request/:id", (req, res) => {
  const { id } = req.params;
  if (!requests[id]) {
    res.status(404).send("Request not found");
    return;
  }
  res.send(requests[id]);
});

app.post("/request/complete", (req, res) => {
  const { isValid, requestId } = req.body;
  if (!requests[requestId]) {
    res.status(404).send("Request not found");
    return;
  }
  if (requests[requestId].status !== "pending") {
    res.status(400).send("Request already completed");
    return;
  }
  requests[requestId].status = isValid ? "successful" : "unsuccessful";
  res.send(requests[requestId]);
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
