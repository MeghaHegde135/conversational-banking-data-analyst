import React, { useState, useMemo } from 'react';

interface DataTableProps {
  data: Record<string, unknown>[];
  title?: string;
}

export const DataTable: React.FC<DataTableProps> = ({ data, title }) => {
  const [filterTerm, setFilterTerm] = useState('');

  const columns = useMemo(() => {
    if (!data || data.length === 0) return [];
    return Object.keys(data[0] || {});
  }, [data]);

  const filteredData = useMemo(() => {
    if (!filterTerm.trim()) return data;
    const term = filterTerm.toLowerCase();
    return data.filter((row) =>
      Object.values(row).some((val) =>
        String(val ?? '').toLowerCase().includes(term)
      )
    );
  }, [data, filterTerm]);

  if (!data || data.length === 0) {
    return <div className="table-empty-notice">No records available to display.</div>;
  }

  const formatHeader = (col: string): string => {
    return col
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const renderCell = (col: string, val: unknown) => {
    if (val === null || val === undefined) return <span className="text-muted">-</span>;

    // Status badge formatting
    if (col.toLowerCase() === 'status' && typeof val === 'string') {
      const statusClass =
        val === 'APPROVED'
          ? 'badge-approved'
          : val === 'PENDING'
          ? 'badge-pending'
          : 'badge-rejected';
      return <span className={`status-pill ${statusClass}`}>{val}</span>;
    }

    // Currency formatting
    if (col.toLowerCase().includes('amount') && typeof val === 'number') {
      return (
        <span className="font-mono text-amount">
          ${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      );
    }

    return String(val);
  };

  return (
    <div className="bank-table-card">
      <div className="bank-table-toolbar">
        <span className="bank-table-title">
          {title || `Table Records (${filteredData.length} of ${data.length})`}
        </span>
        {data.length > 5 && (
          <input
            type="text"
            placeholder="Filter table rows..."
            value={filterTerm}
            onChange={(e) => setFilterTerm(e.target.value)}
            className="bank-table-filter-input"
          />
        )}
      </div>

      <div className="bank-table-responsive-wrapper">
        <table className="bank-styled-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col}>{formatHeader(col)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="table-empty-row">
                  No matching records found.
                </td>
              </tr>
            ) : (
              filteredData.map((row, idx) => (
                <tr key={idx}>
                  {columns.map((col) => (
                    <td key={col}>{renderCell(col, row[col])}</td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
