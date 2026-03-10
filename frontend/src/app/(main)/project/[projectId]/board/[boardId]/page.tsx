'use client';

import { useParams } from 'next/navigation';
import KanbanBoard from '@/components/KanbanBoard';
import Link from 'next/link';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { useKanbanStore } from '@/store/useKanbanStore';

export default function BoardPage() {
  const { projectId, boardId } = useParams() as { projectId: string, boardId: string };
  const boards = useKanbanStore(state => state.boards);
  
  // Try to find board locally, but KanbanBoard component will fetch it fresh if needed
  const board = boards.find(b => b.id === boardId);

  return (
    <div className="h-full flex flex-col pt-4">
      <div className="mb-6 flex justify-between items-center px-2">
         <div>
            <Link href={`/project/${projectId}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1 w-fit mb-2">
              <ArrowLeft size={16} /> Back to Boards
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">{board?.name || 'Board View'}</h1>
         </div>
         <div className="flex gap-2 text-sm">
             <button className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                <UserPlus size={16}/> Share
             </button>
         </div>
      </div>

      <div className="flex-1 min-h-0 bg-transparent rounded-2xl">
         <KanbanBoard boardId={boardId} />
      </div>
    </div>
  );
}
