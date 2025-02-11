export function bytesArrayToHex(bytes: Uint8Array): string {
  return "0x" + Buffer.from(bytes).toString("hex");
}

export function hexToBytesArray(hex: string): Uint8Array {
  if (!hex.startsWith("0x")) {
    return new Uint8Array(Buffer.from(hex, "hex"));
  }

  return new Uint8Array(Buffer.from(hex.slice(2), "hex"));
}

export function numberToFieldString(val: number) {
  return "0x" + val.toString(16).padStart(64, "0");
}
