import { useState, useEffect, useCallback } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface QueryHistoryItem {
  naturalLanguage: string;
  generatedSql: string;
  tableName: string;
  executed: boolean;
  error?: string;
}

export function useQueryForge() {
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [queryHistory, setQueryHistory] = useState<QueryHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Load tables on mount
  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/tables`);
      if (!res.ok) throw new Error('Failed to fetch tables');
      const data = await res.json();
      setTables(data.tables || []);
      if (data.tables?.length > 0 && !selectedTable) {
        setSelectedTable(data.tables[0]);
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
    }
  }, [selectedTable]);

  const uploadFile = useCallback(async (file: File) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || 'Upload failed');
      }

      const data = await res.json();
      console.log('[v0] File uploaded:', data);
      
      // Refresh tables
      await fetchTables();
      
      return data;
    } catch (error) {
      console.error('[v0] Upload error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchTables]);

  const createTable = useCallback(async (tableData: { name: string; columns: Array<{ name: string; type: string }> }) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/create-table`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tableData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || 'Table creation failed');
      }

      const data = await res.json();
      console.log('[v0] Table created:', data);
      
      // Refresh tables
      await fetchTables();
      
      return data;
    } catch (error) {
      console.error('[v0] Create table error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchTables]);

  const executeQuery = useCallback(
    async (naturalLanguage: string, tableName: string, execute: boolean = true) => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/query`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: naturalLanguage,
            table_name: tableName,
            execute,
          }),
        });

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.detail || 'Query failed');
        }

        const data = await res.json();
        
        // Add to history
        setQueryHistory((prev) => [
          {
            naturalLanguage,
            generatedSql: data.sql,
            tableName,
            executed: execute && data.success,
            error: !data.success ? data.error : undefined,
          },
          ...prev,
        ]);

        return data;
      } catch (error) {
        console.error('[v0] Query error:', error);
        setQueryHistory((prev) => [
          {
            naturalLanguage,
            generatedSql: '',
            tableName,
            executed: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          },
          ...prev,
        ]);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    tables,
    selectedTable,
    setSelectedTable,
    queryHistory,
    loading,
    uploadFile,
    createTable,
    executeQuery,
  };
}
