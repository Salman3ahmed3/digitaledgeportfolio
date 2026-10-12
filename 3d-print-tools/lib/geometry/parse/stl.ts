/** Triangle soup from an STL file (binary or ASCII). */
export function parseStl(buffer: ArrayBuffer, onProgress?: (f: number) => void): Float32Array {
  return isBinaryStl(buffer) ? parseBinary(buffer, onProgress) : parseAscii(buffer, onProgress);
}

export function isBinaryStl(buffer: ArrayBuffer): boolean {
  if (buffer.byteLength < 84) return false;
  const dv = new DataView(buffer);
  const n = dv.getUint32(80, true);
  if (84 + n * 50 === buffer.byteLength) return true;
  // Some exporters write "solid" in binary headers; fall back to sniffing for non-ASCII bytes.
  const head = new Uint8Array(buffer, 0, Math.min(buffer.byteLength, 512));
  const text = new TextDecoder().decode(head).trimStart();
  if (!text.startsWith("solid")) return true;
  for (const b of head) if (b > 127) return true;
  return false;
}

function parseBinary(buffer: ArrayBuffer, onProgress?: (f: number) => void): Float32Array {
  const dv = new DataView(buffer);
  const n = Math.min(dv.getUint32(80, true), Math.floor((buffer.byteLength - 84) / 50));
  const out = new Float32Array(n * 9);
  let o = 84;
  const step = Math.max(1, Math.floor(n / 50));
  for (let t = 0; t < n; t++) {
    o += 12; // skip normal
    for (let k = 0; k < 9; k++, o += 4) out[t * 9 + k] = dv.getFloat32(o, true);
    o += 2;
    if (onProgress && t % step === 0) onProgress(t / n);
  }
  return out;
}

function parseAscii(buffer: ArrayBuffer, onProgress?: (f: number) => void): Float32Array {
  const text = new TextDecoder().decode(buffer);
  const out: number[] = [];
  const re = /vertex\s+([-+\d.eE]+)\s+([-+\d.eE]+)\s+([-+\d.eE]+)/g;
  let m: RegExpExecArray | null;
  let count = 0;
  while ((m = re.exec(text))) {
    out.push(+m[1], +m[2], +m[3]);
    if (onProgress && ++count % 30000 === 0) onProgress(m.index / text.length);
  }
  return new Float32Array(out.length - (out.length % 9) === out.length ? out : out.slice(0, out.length - (out.length % 9)));
}
