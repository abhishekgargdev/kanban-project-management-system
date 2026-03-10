'use client';

import { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { api } from '@/services/api';
import { KanbanBoard as KanbanBoardType } from '@/store/useKanbanStore';
import { Plus, Calendar, MessageSquare, PlusCircle } from 'lucide-react';

export default function KanbanBoard({ boardId }: { boardId: string }) {
  const [boardConfig, setBoardConfig] = useState<KanbanBoardType | null>(null);
  const [loading, setLoading] = useState(true);
  const [newTaskCol, setNewTaskCol] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  
  // Custom DND implementation without strict zustand tying to avoid unnecessary sync issues during drag
  useEffect(() => {
    fetchBoard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardId]);

  const fetchBoard = async () => {
    try {
      const { data } = await api.get(`/boards/${boardId}`);
      // Ensure columns are ordered correctly
      const sortedColumns = (data.columns || []).map((col: { id: string; name: string; order: number; tasks: { order: number }[] }) => ({
        ...col,
        tasks: (col.tasks || []).sort((a: { order: number }, b: { order: number }) => a.order - b.order)
      })).sort((a: { order: number }, b: { order: number }) => a.order - b.order);

      setBoardConfig({ ...data, columns: sortedColumns });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;
    if (!boardConfig) return;

    const sourceCol = boardConfig.columns.find(c => c.id === source.droppableId);
    const destCol = boardConfig.columns.find(c => c.id === destination.droppableId);

    if (!sourceCol || !destCol) return;

    const newSourceTasks = Array.from(sourceCol.tasks || []);
    const [movedTask] = newSourceTasks.splice(source.index, 1);

    if (source.droppableId === destination.droppableId) {
      newSourceTasks.splice(destination.index, 0, movedTask);
      
      const newCols = boardConfig.columns.map(col => {
        if (col.id === sourceCol.id) {
          return { ...col, tasks: newSourceTasks };
        }
        return col;
      });

      setBoardConfig({ ...boardConfig, columns: newCols });

      // In real-world, bulk update task orders on backend
      try {
         await api.patch(`/tasks/${draggableId}`, { columnId: destCol.id, order: destination.index });
      } catch(e) { console.error("Update failed", e); }
    } else {
      const newDestTasks = Array.from(destCol.tasks || []);
      newDestTasks.splice(destination.index, 0, movedTask);

      const newCols = boardConfig.columns.map(col => {
        if (col.id === sourceCol.id) return { ...col, tasks: newSourceTasks };
        if (col.id === destCol.id) return { ...col, tasks: newDestTasks };
        return col;
      });

      setBoardConfig({ ...boardConfig, columns: newCols });

      try {
        await api.patch(`/tasks/${draggableId}`, { columnId: destCol.id, order: destination.index });
      } catch(e) { console.error("Update failed", e); }
    }
  };
  
  const handleCreateTask = async (columnId: string) => {
    if(!newTaskTitle.trim()) {
        setNewTaskCol(null);
        return;
    }
    
    try {
        await api.post('/tasks', { title: newTaskTitle, columnId });
        setNewTaskTitle('');
        setNewTaskCol(null);
        fetchBoard(); // Refresh board
    } catch(err) {
        console.error(err);
    }
  }

  if (loading) return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;
  if (!boardConfig) return <div>Board not found</div>;

  return (
    <div className="flex h-full gap-6 overflow-x-auto pb-4 px-2">
      <DragDropContext onDragEnd={onDragEnd}>
        {boardConfig.columns.map((column) => (
          <div key={column.id} className="w-80 shrink-0 flex flex-col bg-gray-100/50 border border-gray-200/60 rounded-2xl p-4">
            <div className="flex justify-between items-center mb-4 px-1">
              <h3 className="font-bold text-gray-800">{column.name}</h3>
              <span className="bg-gray-200 text-gray-600 text-xs font-semibold px-2 py-1 rounded-full">{column.tasks?.length || 0}</span>
            </div>

            <Droppable droppableId={column.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex-1 overflow-y-auto space-y-3 min-h-[150px] transition-colors rounded-xl ${snapshot.isDraggingOver ? 'bg-indigo-50/50' : ''} p-1`}
                >
                  {(column.tasks || []).map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`bg-white p-4 rounded-xl border transition-all ${snapshot.isDragging ? 'shadow-2xl border-indigo-400 rotate-2 scale-105 z-50' : 'shadow-sm border-gray-100 hover:shadow-md hover:border-indigo-200'}`}
                        >
                          <p className="font-medium text-gray-900 leading-snug">{task.title}</p>
                          <div className="flex items-center gap-4 mt-4 text-gray-400">
                             <div className="flex items-center gap-1.5"><MessageSquare size={14}/> <span className="text-xs">{(task as { comments?: unknown[] }).comments?.length || 0}</span></div>
                             {task.dueDate && <div className="flex items-center gap-1.5"><Calendar size={14}/> <span className="text-xs">{new Date(task.dueDate).toLocaleDateString()}</span></div>}
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  
                  {/* Inline Add Task */}
                  {newTaskCol === column.id ? (
                      <div className="bg-white p-3 rounded-xl border shadow-sm border-indigo-200">
                          <textarea 
                             autoFocus
                             className="w-full text-sm resize-none focus:outline-none placeholder:text-gray-400 font-medium" 
                             placeholder="What needs to be done?"
                             rows={2}
                             value={newTaskTitle}
                             onChange={e => setNewTaskTitle(e.target.value)}
                             onKeyDown={e => {
                                 if(e.key === 'Enter' && !e.shiftKey) {
                                     e.preventDefault();
                                     handleCreateTask(column.id);
                                 }
                             }}
                          />
                          <div className="flex items-center gap-2 mt-2">
                             <button onClick={() => handleCreateTask(column.id)} className="bg-indigo-600 text-white text-xs px-3 py-1.5 rounded-lg font-medium">Add</button>
                             <button onClick={() => { setNewTaskCol(null); setNewTaskTitle(''); }} className="text-gray-500 hover:text-gray-700 text-xs px-2 font-medium">Cancel</button>
                          </div>
                      </div>
                  ) : (
                      <button 
                        onClick={() => { setNewTaskCol(column.id); setNewTaskTitle(''); }}
                        className="w-full rounded-xl flex items-center gap-2 py-3 px-3 text-sm font-medium text-gray-500 hover:text-indigo-600 hover:bg-white transition-colors border border-transparent hover:border-indigo-100"
                       >
                         <PlusCircle size={18} />
                         <span>Add task...</span>
                      </button>
                  )}
                  
                </div>
              )}
            </Droppable>
          </div>
        ))}
        {/* Placeholder for Add Column */}
        <div className="w-80 shrink-0">
             <button className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-white/50 border border-dashed border-gray-300 text-gray-500 hover:text-indigo-600 hover:border-indigo-300 transition-all font-medium">
                 <Plus size={20} />
                 <span>Add another list</span>
             </button>
        </div>
      </DragDropContext>
    </div>
  );
}
