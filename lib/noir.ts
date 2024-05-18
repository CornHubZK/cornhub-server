import {
  BarretenbergBackend,
  CompiledCircuit,
  ProofData,
} from "@noir-lang/backend_barretenberg";
import { InputMap, Noir } from "@noir-lang/noir_js";

export async function prove(circuit: CompiledCircuit, inputs: InputMap) {
  const backend = new BarretenbergBackend(circuit);
  const noir = new Noir(circuit, backend);
  const proof = await noir.generateFinalProof(inputs);
  return proof;
}

export async function verify(circuit: CompiledCircuit, proof: ProofData) {
  const backend = new BarretenbergBackend(circuit);
  const noir = new Noir(circuit, backend);
  const verification = await noir.verifyFinalProof(proof);
  return verification;
}
