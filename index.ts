import express from "express";
import bodyParser from "body-parser";
import type { Alpha3Code } from "i18n-iso-countries";
import { randomUUID } from "crypto";
const app = express();

type ProofRequest = {
  id: string;
  minAge: number;
  citizenship: Alpha3Code;
  status: "pending" | "successful" | "unsuccessful";
};

const proofRequests: { [key: string]: ProofRequest } = {};

const PORT = process.env.PORT || 3010;

app.use(bodyParser.json());

app.post("/request/create", (req, res) => {
  const { minAge, citizenship } = req.body;
  const id = randomUUID();
  const proofRequest: ProofRequest = {
    id,
    minAge,
    citizenship,
    status: "pending",
  };
  proofRequests[id] = proofRequest;
  res.send(proofRequest);
});

app.get("/request/:id", (req, res) => {
  const { id } = req.params;
  if (!proofRequests[id]) {
    res.status(404).send("Request not found");
    return;
  }
  res.send(proofRequests[id]);
});

app.post("/request/complete", (req, res) => {
  const { isValid, requestId } = req.body;
  if (!proofRequests[requestId]) {
    res.status(404).send("Request not found");
    return;
  }
  if (proofRequests[requestId].status !== "pending") {
    res.status(400).send("Request already completed");
    return;
  }
  proofRequests[requestId].status = isValid ? "successful" : "unsuccessful";
  res.send(proofRequests[requestId]);
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
