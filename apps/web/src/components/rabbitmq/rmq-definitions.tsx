import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { Download, FileJson } from 'lucide-react';
import { JsonViewer } from '../shared/json-viewer';
import { FileUpload } from '../ui/file-upload';
import { rabbitmqApi } from '@/api/endpoints/rabbitmq';
import { toast } from 'sonner';

export function RmqDefinitions() {
  const { connId } = useParams();
  const cid = Number(connId);
  const [definitions, setDefinitions] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const data = await rabbitmqApi.getDefinitions(cid);
      setDefinitions(data);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rabbitmq-definitions-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Definitions exported');
    } catch {
      toast.error('Failed to export definitions');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (file: File) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await rabbitmqApi.importDefinitions(cid, data);
      toast.success('Definitions imported successfully');
    } catch {
      toast.error('Failed to import definitions');
    }
  };

  return (
    <div>
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Export */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-1 text-sm font-semibold">Export Definitions</h3>
          <p className="mb-4 text-xs text-muted-foreground">Download all broker definitions as JSON</p>
          <button
            onClick={handleExport}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            {loading ? 'Exporting...' : 'Export Definitions'}
          </button>
        </div>

        {/* Import */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-1 text-sm font-semibold">Import Definitions</h3>
          <p className="mb-4 text-xs text-muted-foreground">Upload a JSON definitions file to apply</p>
          <FileUpload
            accept=".json"
            onChange={handleImport}
            description="JSON definitions file"
          />
        </div>
      </div>

      {definitions ? (
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center gap-2">
            <FileJson className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold">Exported Definitions</span>
            <span className="text-xs text-muted-foreground">
              {definitions.users?.length || 0} users, {definitions.queues?.length || 0} queues, {definitions.exchanges?.length || 0} exchanges, {definitions.bindings?.length || 0} bindings
            </span>
          </div>
          <div className="max-h-[60vh] overflow-auto rounded-lg bg-muted/30 p-3">
            <JsonViewer data={definitions} collapsed={2} />
          </div>
        </div>
      ) : (
        <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-border bg-card">
          <div className="text-center text-muted-foreground">
            <FileJson className="mx-auto mb-2 h-8 w-8 opacity-30" />
            <p className="text-sm font-medium">No definitions loaded</p>
            <p className="text-xs">Export or import to preview definitions here</p>
          </div>
        </div>
      )}
    </div>
  );
}
