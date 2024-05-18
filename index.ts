import express from "express";
import bodyParser from "body-parser";
import type { Alpha3Code } from "i18n-iso-countries";
import { randomUUID } from "crypto";
import proofOfAge from "./circuits/proof_age.json";
import { numberToFieldString } from "./lib";
import { CompiledCircuit, ProofData } from "@noir-lang/backend_barretenberg";
import { verify } from "./lib/noir";

const app = express();

type ProofRequest = {
  id: string;
  current_date?: string;
  minAge?: number;
  citizenship?: Alpha3Code;
  status: "created" | "pending" | "successful" | "unsuccessful";
  proof?: string;
};

const proofRequests: { [key: string]: ProofRequest } = {};

const PORT = process.env.PORT || 3010;

app.use(bodyParser.json());

app.post("/request/create", (req, res) => {
  const { minAge, citizenship, current_date } = req.body;
  const id = randomUUID();
  const proofRequest: ProofRequest = {
    id,
    minAge,
    citizenship,
    current_date,
    status: "created",
  };
  proofRequests[id] = proofRequest;
  res.send(proofRequest);
});

app.post("/request/start", (req, res) => {
  const { requestId } = req.body;
  if (!proofRequests[requestId]) {
    res.status(404).send("Request not found");
    return;
  }
  if (proofRequests[requestId].status !== "created") {
    res.status(400).send("Request already started");
    return;
  }
  proofRequests[requestId].status = "pending";
  res.send(proofRequests[requestId]);
});

app.get("/request/:id", (req, res) => {
  const { id } = req.params;
  if (!proofRequests[id]) {
    res.status(404).send("Request not found");
    return;
  }
  res.send(proofRequests[id]);
});

app.post("/request/complete", async (req, res) => {
  const { proof, requestId } = req.body;

  const proofRequest = proofRequests[requestId];

  if (!proofRequest) {
    res.status(404).send("Request not found");
    return;
  }

  if (proofRequest.status !== "pending") {
    res.status(400).send("Request already completed");
    return;
  }

  const currentDataBytes = new TextEncoder().encode(proofRequest.current_date);

  const publicInputs = new Map();
  for (let i = 0; i < currentDataBytes.length; i++) {
    publicInputs.set(
      proofOfAge.abi.param_witnesses.current_date[0].start + i,
      numberToFieldString(currentDataBytes[i])
    );
  }
  publicInputs.set(
    proofOfAge.abi.param_witnesses.min_age_required[0].start,
    numberToFieldString(proofRequest.minAge!)
  );

  const fullProof: ProofData = {
    proof,
    publicInputs,
  };

  const verified = await verify(proofOfAge as CompiledCircuit, fullProof);

  proofRequests[requestId].status = verified ? "successful" : "unsuccessful";
  res.send(proofRequests[requestId]);
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
