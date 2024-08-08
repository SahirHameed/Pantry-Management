// src/components/InventoryTable.js
import React from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";

const InventoryTable = ({
  inventory,
  onEdit,
  onDelete,
  onIncrement,
  onDecrement,
}) => {
  return (
    <Paper elevation={3} sx={{ width: "100%", borderRadius: "8px" }}>
      <TableContainer>
        <Table>
          <TableHead sx={{ bgcolor: "grey" }}>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Unit</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {inventory.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>{item.unit}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>
                  <IconButton onClick={() => onIncrement(item.id)}>
                    <AddCircleIcon />
                  </IconButton>
                  <IconButton onClick={() => onDecrement(item.id)}>
                    <RemoveCircleIcon />
                  </IconButton>
                  <IconButton onClick={() => onEdit(item)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => onDelete(item.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default InventoryTable;
