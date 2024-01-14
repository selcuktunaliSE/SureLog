  import React, { useState, useMemo } from 'react';
  import Table from 'react-bootstrap/Table';

  const DynamicTable = ({ dataDict, onRowClick }) => {
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

    // Extract columns from the first item in the dictionary
    const columns = dataDict[Object.keys(dataDict)[0]] 
      ? Object.keys(dataDict[Object.keys(dataDict)[0]])
        .map(key => ({ label: key, accessor: key }))
      : [];

    const sortedData = useMemo(() => {
      let sortableData = Object.values(dataDict);
      if (sortConfig.key !== null) {
        sortableData.sort((a, b) => {
          // Generic sort function for strings and numbers
          if (typeof a[sortConfig.key] === 'string') {
            return sortConfig.direction === 'ascending' ? a[sortConfig.key].localeCompare(b[sortConfig.key]) : b[sortConfig.key].localeCompare(a[sortConfig.key]);
          } else {
            return sortConfig.direction === 'ascending' ? a[sortConfig.key] - b[sortConfig.key] : b[sortConfig.key] - a[sortConfig.key];
          }
        });
      }
      return sortableData;
    }, [dataDict, sortConfig]);

    const requestSort = (key) => {
      let direction = 'ascending';
      if (sortConfig.key === key && sortConfig.direction === 'ascending') {
        direction = 'descending';
      }
      setSortConfig({ key, direction });
    };

    const handleRowClick = (rowData) => {
      if (onRowClick) {
        onRowClick(rowData);
      }
    };

    return (
      <Table responsive="md" className="dynamic-table" striped bordered hover>
        <thead>
          <tr className='text-center'>
            {columns.map(({ label, accessor }) => (
              <th key={accessor} onClick={() => requestSort(accessor)}>
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((item, index) => (
            <tr className='text-center' key={index} onClick={() => handleRowClick(item)}>
              {columns.map(({ accessor }) => (
                <td key={accessor}>{item[accessor]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
    );
  };

  export default DynamicTable;
