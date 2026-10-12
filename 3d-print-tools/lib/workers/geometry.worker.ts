/// <reference lib="webworker" />
import * as Comlink from "comlink";
import { api } from "./api";
import { setManifoldWasmUrl } from "@/lib/geometry/manifold";

setManifoldWasmUrl("/wasm/manifold.wasm");

Comlink.expose(api);
