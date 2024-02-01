import React, { useState, useMemo } from 'react';
import "../../scss/custom_components/_dynamicTable.scss";
import Table from 'react-bootstrap/Table';

const DynamicTable = ({ dataDict, onRowClick }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

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

  // Calculate the range of items to display based on the current page
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = sortedData.slice(startIndex, endIndex);

  const handleItemsPerPageChange = (e) => {
    const value = Math.max(5, Math.min(200, Number(e.target.value)));
    setItemsPerPage(value);
  };

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

  const RenderValue = ({ value }) => {
    if (typeof value === 'boolean') {
      return value ? <i className="ri-check-line"></i> : <i className="ri-close-line"></i>;
    }
    return value;
  };

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="dynamic-table-container">
      <Table responsive="md" className="dynamic-table" >
        
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
          {currentData.map((item, index) => (
            <tr className='text-center' key={index} onClick={() => handleRowClick(item)}>
              {columns.map(({ accessor }) => (
                <td key={accessor}>
                  <RenderValue value={item[accessor]} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
      
      <div className="pagination-container">
        <div className="pagination d-flex justify-content-end align-items-center mt-3">
          <div className="items-per-page-container d-flex align-items-center me-auto">
            <label htmlFor="itemsPerPage" className="me-2">Items per page:</label>
            <input  
              type="number"
              id="itemsPerPage"
              className="form-control"
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              min="5"
              max="200"
              style={{ width: '80px' }}
            />
          </div>
          
          <button className="btn btn-secondary" onClick={handlePreviousPage} disabled={currentPage === 1}>
            Previous
          </button>
          
          <span className="mx-2">{`Page ${currentPage} of ${totalPages}`}</span>
          
          <button className="btn btn-primary" onClick={handleNextPage} disabled={currentPage === totalPages}>
            Next
          </button>

        </div>
      </div>
    </div>
  );
};

export default DynamicTable;
