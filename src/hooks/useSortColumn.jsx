import { useState } from "react";

export const useSortColumn = (
  initialColumn = "name",
  initialAscending = true
) => {
  const [sortColumn, setSortColumn] = useState({
    column: initialColumn,
    ascending: initialAscending,
  });

  const changeSortOrder = (column) => {
    setSortColumn((prev) => ({
      column,
      ascending: prev.column === column ? !prev.ascending : true,
    }));
  };

  return { sortColumn, setSortColumn, changeSortOrder };
};
