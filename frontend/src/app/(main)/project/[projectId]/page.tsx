'use client';

import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Layout, Plus, ArrowLeft } from 'lucide-react';
import { useKanbanStore } from '@/store/useKanbanStore';

interface ProjectData {
  id: string;
  name: string;
  description: string;
}

export default function ProjectPage() {
  const { projectId } = useParams() as { projectId: string };
  const { boards, loading, fetchBoards } = useKanbanStore();
  const [project, setProject] = useState<ProjectData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [boardName, setBoardName] = useState('');

  useEffect(() => {
    // Fetch project details
    api.get(`/projects/${projectId}`).then(res => setProject(res.data)).catch(console.error);
    fetchBoards(projectId);
  }, [projectId, fetchBoards]);

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/boards', { name: boardName, projectId });
      setIsModalOpen(false);
      setBoardName('');
      fetchBoards(projectId);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="mb-4">
        <Link href="/dashboard" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1 w-fit">
          <ArrowLeft size={16} /> Back to Projects
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{project?.name || 'Loading Project...'}</h1>
          <p className="mt-1 text-sm text-gray-500">{project?.description}</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm shadow-indigo-200"
        >
          <Plus size={20} />
          <span>New Board</span>
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1,2,3].map(i => (
            <div key={i} className="h-32 bg-white rounded-2xl border border-gray-100 shadow-sm" />
          ))}
        </div>
      ) : boards.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
          <Layout className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-sm font-medium text-gray-900">No boards</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new board.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {boards.map((b) => (
            <Link key={b.id} href={`/project/${projectId}/board/${b.id}`}>
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] transition-all hover:-translate-y-1 cursor-pointer group flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 truncate">{b.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{b.columns?.length || 0} columns</p>
                </div>
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Layout size={24} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md transform transition-all">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Create New Board</h3>
            <form onSubmit={handleCreateBoard} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Board Name</label>
                <input required type="text" value={boardName} onChange={e => setBoardName(e.target.value)} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all" placeholder="e.g. Sprint 1" />
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm">Create Board</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
