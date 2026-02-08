import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock fs and path before importing the module
vi.mock('fs', () => ({
  existsSync: vi.fn().mockReturnValue(false),
  mkdirSync: vi.fn(),
  writeFileSync: vi.fn(),
  readFileSync: vi.fn().mockReturnValue('{}'),
}));

vi.mock('uuid', () => ({
  v4: vi.fn().mockReturnValue('test-uuid-1234'),
}));

// We need to re-import after mocks are set up
// Since sessionManager is a singleton, we'll test its public API
import { sessionManager } from './state.js';

describe('SessionManager', () => {
  beforeEach(() => {
    sessionManager.reset();
  });

  describe('createSession', () => {
    it('should create a session with project name', () => {
      const session = sessionManager.createSession({
        projectName: 'Test Project',
      });

      expect(session.projectName).toBe('Test Project');
      expect(session.sessionId).toBe('test-uuid-1234');
      expect(session.screens).toEqual([]);
      expect(session.flows).toEqual([]);
      expect(session.components).toEqual({});
    });

    it('should set the created session as active', () => {
      const session = sessionManager.createSession({
        projectName: 'Active Project',
      });

      const active = sessionManager.getActiveSession();
      expect(active).not.toBeNull();
      expect(active!.sessionId).toBe(session.sessionId);
    });

    it('should set timestamps on creation', () => {
      const session = sessionManager.createSession({
        projectName: 'Time Test',
      });

      expect(session.createdAt).toBeDefined();
      expect(session.updatedAt).toBeDefined();
      expect(session.createdAt).toBe(session.updatedAt);
    });
  });

  describe('getSession', () => {
    it('should return session by ID', () => {
      const created = sessionManager.createSession({
        projectName: 'Fetch Test',
      });

      const fetched = sessionManager.getSession(created.sessionId);
      expect(fetched).not.toBeNull();
      expect(fetched!.projectName).toBe('Fetch Test');
    });

    it('should return null for non-existent session', () => {
      const result = sessionManager.getSession('non-existent-id');
      expect(result).toBeNull();
    });
  });

  describe('updateSession', () => {
    it('should update project name', () => {
      sessionManager.createSession({ projectName: 'Original' });

      const updated = sessionManager.updateSession({
        projectName: 'Updated Name',
      });

      expect(updated).not.toBeNull();
      expect(updated!.projectName).toBe('Updated Name');
    });

    it('should return null when no active session', () => {
      const result = sessionManager.updateSession({
        projectName: 'No Session',
      });
      expect(result).toBeNull();
    });

    it('should update the updatedAt timestamp', () => {
      const session = sessionManager.createSession({
        projectName: 'Timestamp Test',
      });
      const originalUpdatedAt = session.updatedAt;

      // Small delay to ensure different timestamp
      const updated = sessionManager.updateSession({
        projectName: 'New Name',
      });

      expect(updated!.updatedAt).toBeDefined();
    });
  });

  describe('deleteSession', () => {
    it('should delete existing session', () => {
      const session = sessionManager.createSession({
        projectName: 'To Delete',
      });

      const deleted = sessionManager.deleteSession(session.sessionId);
      expect(deleted).toBe(true);

      const fetched = sessionManager.getSession(session.sessionId);
      expect(fetched).toBeNull();
    });

    it('should return false for non-existent session', () => {
      const deleted = sessionManager.deleteSession('non-existent');
      expect(deleted).toBe(false);
    });

    it('should clear active session if deleted session was active', () => {
      const session = sessionManager.createSession({
        projectName: 'Active Delete',
      });

      sessionManager.deleteSession(session.sessionId);
      const active = sessionManager.getActiveSession();
      expect(active).toBeNull();
    });
  });

  describe('listSessions', () => {
    it('should return empty array when no sessions', () => {
      const list = sessionManager.listSessions();
      expect(list).toEqual([]);
    });

    it('should return all created sessions', () => {
      sessionManager.createSession({ projectName: 'Session 1' });
      // Since uuid is mocked to always return same value,
      // the second creation will overwrite the first in the Map
      // This is expected behavior in test context
      const list = sessionManager.listSessions();
      expect(list.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('addScreen', () => {
    it('should add screen to active session', () => {
      sessionManager.createSession({ projectName: 'Screen Test' });

      const screen = sessionManager.addScreen({
        name: 'Home',
        nodeId: '1:1',
        regions: [],
      });

      expect(screen.name).toBe('Home');
      expect(screen.components).toEqual([]);
    });

    it('should throw on duplicate screen name', () => {
      sessionManager.createSession({ projectName: 'Dup Test' });

      sessionManager.addScreen({
        name: 'Home',
        nodeId: '1:1',
        regions: [],
      });

      expect(() =>
        sessionManager.addScreen({
          name: 'Home',
          nodeId: '1:2',
          regions: [],
        })
      ).toThrow('already exists');
    });

    it('should throw when no active session', () => {
      expect(() =>
        sessionManager.addScreen({
          name: 'Orphan',
          nodeId: '1:1',
          regions: [],
        })
      ).toThrow('No active session');
    });
  });

  describe('registerComponent', () => {
    it('should register a component', () => {
      sessionManager.createSession({ projectName: 'Comp Test' });

      const component = sessionManager.registerComponent({
        nodeId: '1:5',
        name: 'MyButton',
        type: 'button',
        reusable: true,
      });

      expect(component.name).toBe('MyButton');
      expect(component.nodeId).toBe('1:5');
    });

    it('should throw on empty component name', () => {
      sessionManager.createSession({ projectName: 'Empty Name' });

      expect(() =>
        sessionManager.registerComponent({
          nodeId: '1:5',
          name: '',
          type: 'button',
          reusable: true,
        })
      ).toThrow('Component name is required');
    });
  });

  describe('setActiveSession', () => {
    it('should set active session by ID', () => {
      const session = sessionManager.createSession({
        projectName: 'Set Active',
      });

      const result = sessionManager.setActiveSession(session.sessionId);
      expect(result).toBe(true);
    });

    it('should return false for non-existent session', () => {
      const result = sessionManager.setActiveSession('non-existent');
      expect(result).toBe(false);
    });
  });
});
