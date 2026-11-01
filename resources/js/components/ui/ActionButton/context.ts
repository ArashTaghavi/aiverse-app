"use client";

import { createContext } from "react";

export const ActionContext = createContext({ menu: false, close: () => {} });
