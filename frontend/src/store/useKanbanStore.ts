import { create } from 'zustand';
import { api } from '../services/api';

export interface KanbanTask {
  id: string;
  columnId: string;
  title: string;
  description: string;
  assignedUserId?: string;
  dueDate?: string;
  order: number;
}

export interface KanbanColumn {
  id: string;
  boardId: string;
  name: string;
  order: number;
  tasks: KanbanTask[];
}

export interface KanbanBoard {
  id: string;
  projectId: string;
  name: string;
  columns: KanbanColumn[];
}

interface KanbanState {
  boards: KanbanBoard[];
  currentBoard: KanbanBoard | null;
  loading: boolean;
  fetchBoards: (projectId: string) => Promise<void>;
  setCurrentBoard: (board: KanbanBoard) => void;
  moveTask: (taskId: string, sourceColId: string, destColId: string, newOrder: number) => Promise<void>;
}

export const useKanbanStore = create<KanbanState>((set, get) => ({
  boards: [],
  currentBoard: null,
  loading: false,

  fetchBoards: async (projectId: string) => {
    set({ loading: true });
    try {
      const response = await api.get(`/boards?projectId=${projectId}`);
      set({ boards: response.data, loading: false });
    } catch (error) {
      console.error('Failed to fetch boards:', error);
      set({ loading: false });
    }
  },

  setCurrentBoard: (board) => set({ currentBoard: board }),

  moveTask: async (taskId, sourceColId, destColId, newOrder) => {
    const { currentBoard } = get();
    if (!currentBoard) return;

    // Optimistic update
    // Note: The actual DND implementation might need a more robust local update
    // before sending to the backend depending on user preference
    set({ currentBoard: { ...currentBoard } });

    try {
      await api.patch(`/tasks/${taskId}`, {
        columnId: destColId,
        order: newOrder,
      });
    } catch (error) {
      console.error('Failed to update task:', error);
      // Revert optimistic update ideally here
    }
  },
}));
