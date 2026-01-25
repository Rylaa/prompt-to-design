/**
 * Design Session State Manager
 * Ekranlar arasi baglami korur
 */

import { v4 as uuidv4 } from "uuid";
import type {
  DesignSession,
  CreateSessionInput,
  UpdateSessionInput,
  Screen,
  RegisteredComponent,
  PrototypeFlow,
} from "./types.js";
import { DEVICE_PRESETS, DEFAULT_DEVICE, DEFAULT_THEME } from "./presets.js";

class SessionManager {
  private sessions: Map<string, DesignSession> = new Map();
  private activeSessionId: string | null = null;

  createSession(input: CreateSessionInput): DesignSession {
    const sessionId = uuidv4();
    let device = DEFAULT_DEVICE;
    if (input.device && DEVICE_PRESETS[input.device]) {
      device = DEVICE_PRESETS[input.device];
    } else if (input.customDevice) {
      device = { name: "Custom", type: "mobile", ...input.customDevice };
    }
    const theme = { ...DEFAULT_THEME, ...input.theme };
    const session: DesignSession = {
      sessionId,
      projectName: input.projectName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      device,
      theme,
      components: {},
      screens: [],
      flows: [],
    };
    this.sessions.set(sessionId, session);
    this.activeSessionId = sessionId;
    return session;
  }

  getActiveSession(): DesignSession | null {
    if (!this.activeSessionId) return null;
    return this.sessions.get(this.activeSessionId) || null;
  }

  getSession(sessionId: string): DesignSession | null {
    return this.sessions.get(sessionId) || null;
  }

  updateSession(input: UpdateSessionInput): DesignSession | null {
    const session = this.getActiveSession();
    if (!session) return null;
    if (input.projectName) session.projectName = input.projectName;
    if (input.device && DEVICE_PRESETS[input.device]) {
      session.device = DEVICE_PRESETS[input.device];
    }
    if (input.theme) session.theme = { ...session.theme, ...input.theme };
    if (input.activeScreen) session.activeScreen = input.activeScreen;
    session.updatedAt = new Date().toISOString();
    return session;
  }

  addScreen(screen: Omit<Screen, "components">): Screen {
    const session = this.getActiveSession();
    if (!session) throw new Error("No active session");
    const newScreen: Screen = { ...screen, components: [] };
    session.screens.push(newScreen);
    session.activeScreen = screen.name;
    session.updatedAt = new Date().toISOString();
    return newScreen;
  }

  registerComponent(component: RegisteredComponent): void {
    const session = this.getActiveSession();
    if (!session) throw new Error("No active session");
    session.components[component.name] = component;
    if (session.activeScreen) {
      const screen = session.screens.find(s => s.name === session.activeScreen);
      if (screen && !screen.components.includes(component.name)) {
        screen.components.push(component.name);
      }
    }
    session.updatedAt = new Date().toISOString();
  }

  addFlow(flow: PrototypeFlow): void {
    const session = this.getActiveSession();
    if (!session) throw new Error("No active session");
    session.flows.push(flow);
    session.updatedAt = new Date().toISOString();
  }

  deleteSession(sessionId: string): boolean {
    if (this.activeSessionId === sessionId) this.activeSessionId = null;
    return this.sessions.delete(sessionId);
  }

  listSessions(): DesignSession[] {
    return Array.from(this.sessions.values());
  }

  setActiveSession(sessionId: string): boolean {
    if (this.sessions.has(sessionId)) {
      this.activeSessionId = sessionId;
      return true;
    }
    return false;
  }
}

export const sessionManager = new SessionManager();
