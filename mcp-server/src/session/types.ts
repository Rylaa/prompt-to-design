/**
 * Design Session Types
 * State types that maintain context across screens
 */

export interface DevicePreset {
  name: string;
  type: "mobile" | "tablet" | "desktop";
  width: number;
  height: number;
  platform: "ios" | "android" | "web";
}

export interface ThemeConfig {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  success: string;
  warning: string;
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  radius: {
    sm: number;
    md: number;
    lg: number;
    full: number;
  };
}

export interface RegisteredComponent {
  nodeId: string;
  name: string;
  type: string;
  library?: "shadcn" | "ios" | "macos" | "liquid-glass" | "custom";
  variant?: string;
  reusable: boolean;
}

export interface ScreenRegion {
  name: string;
  type: "header" | "content" | "footer" | "sidebar" | "custom";
  nodeId?: string;
  height?: number | "auto" | "fill";
  position?: "top" | "bottom" | "left" | "right";
}

export interface Screen {
  name: string;
  nodeId: string;
  regions: ScreenRegion[];
  components: string[]; // component names used in this screen
}

export interface PrototypeFlow {
  from: string; // screen name
  to: string; // screen name
  trigger: "onTap" | "onDrag" | "afterDelay" | "onHover";
  sourceNodeId?: string;
  targetNodeId?: string;
}

export interface DesignSession {
  sessionId: string;
  projectName: string;
  createdAt: string;
  updatedAt: string;

  // Device configuration
  device: DevicePreset;

  // Design tokens
  theme: ThemeConfig;

  // Registered components for reuse
  components: Record<string, RegisteredComponent>;

  // Created screens
  screens: Screen[];

  // Prototype flows between screens
  flows: PrototypeFlow[];

  // Current active screen
  activeScreen?: string;
}

export interface CreateSessionInput {
  projectName: string;
  device?: string; // preset name or custom
  customDevice?: {
    width: number;
    height: number;
    platform: "ios" | "android" | "web";
  };
  theme?: Partial<ThemeConfig>;
}

export interface UpdateSessionInput {
  projectName?: string;
  device?: string;
  theme?: Partial<ThemeConfig>;
  activeScreen?: string;
}
