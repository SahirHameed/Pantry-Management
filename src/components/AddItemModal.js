// src/components/AddItemModal.js
import React from "react";
import {
  Box,
  Typography,
  Modal,
  Stack,
  TextField,
  Button,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const categories = [
  "Grains",
  "Vegetables",
  "Fruits",
  "Dairy",
  "Protein",
  "Others",
];
const units = ["kg", "grams", "liters", "units", "packs", "dozens"];

const AddItemModal = ({
  open,
  handleClose,
  handleAddItem,
  itemName,
  setItemName,
  itemCategory,
  setItemCategory,
  itemUnit,
  setItemUnit,
  itemQuantity,
  setItemQuantity,
}) => (
  <Modal open={open} onClose={handleClose}>
    <Box
      position="absolute"
      top="50%"
      left="50%"
      width={400}
      bgcolor="white"
      border="2px solid #000"
      boxShadow={24}
      p={4}
      display="flex"
      flexDirection="column"
      gap={3}
      sx={{
        transform: "translate(-50%, -50%)",
        borderRadius: "8px",
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">Add Item</Typography>
        <IconButton onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Stack width="100%" spacing={2}>
        <TextField
          label="Name"
          variant="outlined"
          fullWidth
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
        />
        <FormControl fullWidth variant="outlined">
          <InputLabel>Category</InputLabel>
          <Select
            value={itemCategory}
            onChange={(e) => setItemCategory(e.target.value)}
            label="Category"
          >
            {categories.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth variant="outlined">
          <InputLabel>Unit</InputLabel>
          <Select
            value={itemUnit}
            onChange={(e) => setItemUnit(e.target.value)}
            label="Unit"
          >
            {units.map((unit) => (
              <MenuItem key={unit} value={unit}>
                {unit}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Quantity"
          variant="outlined"
          fullWidth
          type="number"
          value={itemQuantity}
          onChange={(e) => setItemQuantity(parseInt(e.target.value))}
        />
      </Stack>
      <Button
        variant="contained"
        sx={{ bgcolor: "black", color: "white" }}
        onClick={handleAddItem}
      >
        Add
      </Button>
    </Box>
  </Modal>
);

export default AddItemModal;
